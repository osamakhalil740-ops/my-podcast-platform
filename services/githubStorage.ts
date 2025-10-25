// GitHub Storage Service - Free persistent storage
// Uses GitHub API to store episodes in a repository

import { Episode, NewEpisodeData } from '../types';

// GitHub configuration
const GITHUB_TOKEN = 'ghp_your_token_here'; // Replace with your GitHub token
const GITHUB_USERNAME = 'your_username'; // Replace with your GitHub username
const GITHUB_REPO = 'my-podcast-data'; // Repository name
const GITHUB_BRANCH = 'main';

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Helper function to convert base64 to blob URL
const base64ToBlobUrl = (base64: string, mimeType: string): string => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  return URL.createObjectURL(blob);
};

// GitHub API helper
const githubRequest = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Check if GitHub is configured
const isGitHubConfigured = () => {
  return GITHUB_TOKEN !== 'ghp_your_token_here' && 
         GITHUB_USERNAME !== 'your_username';
};

// Local storage fallback
class LocalStorageFallback {
  private static STORAGE_KEY = 'podcast_episodes';

  static async addEpisode(episodeData: NewEpisodeData): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const episode = {
          id: Date.now().toString(),
          title: episodeData.title,
          description: episodeData.description,
          audioData: reader.result as string,
          audioType: episodeData.audioFile.type,
          audioName: episodeData.audioFile.name,
          createdAt: Date.now()
        };

        const existing = this.getAllEpisodesSync();
        existing.unshift(episode);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existing));
        resolve();
      };
      reader.onerror = () => reject(new Error('Failed to read audio file'));
      reader.readAsDataURL(episodeData.audioFile);
    });
  }

  static getAllEpisodesSync(): Episode[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const episodes = JSON.parse(stored);
      return episodes.map((ep: any) => ({
        id: ep.id,
        title: ep.title,
        description: ep.description,
        audioUrl: ep.audioData,
        storagePath: `local://${ep.audioName}`,
        createdAt: ep.createdAt
      }));
    } catch (error) {
      console.error('Error loading episodes from localStorage:', error);
      return [];
    }
  }

  static async getAllEpisodes(): Promise<Episode[]> {
    return Promise.resolve(this.getAllEpisodesSync());
  }

  static async deleteEpisode(episode: Episode): Promise<void> {
    const episodes = this.getAllEpisodesSync();
    const filtered = episodes.filter(ep => ep.id !== episode.id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }
}

/**
 * Add a new episode to GitHub
 */
export const addEpisode = async (episodeData: NewEpisodeData): Promise<void> => {
  try {
    console.log('Starting episode upload to GitHub...');
    
    // Check if GitHub is configured
    if (!isGitHubConfigured()) {
      console.log('GitHub not configured, using local storage...');
      return await LocalStorageFallback.addEpisode(episodeData);
    }

    // Convert audio file to base64
    const audioBase64 = await fileToBase64(episodeData.audioFile);
    
    // Create episode data
    const episode = {
      id: Date.now().toString(),
      title: episodeData.title,
      description: episodeData.description,
      audioData: audioBase64,
      audioType: episodeData.audioFile.type,
      audioName: episodeData.audioFile.name,
      fileSize: episodeData.audioFile.size,
      createdAt: Date.now()
    };

    // Create filename
    const filename = `episodes/${episode.id}.json`;
    
    // Upload to GitHub
    const uploadUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${filename}`;
    
    const uploadData = {
      message: `Add episode: ${episode.title}`,
      content: btoa(JSON.stringify(episode, null, 2)),
      branch: GITHUB_BRANCH
    };

    await githubRequest(uploadUrl, {
      method: 'PUT',
      body: JSON.stringify(uploadData)
    });

    console.log('Episode uploaded successfully to GitHub');
    
  } catch (error: any) {
    console.error('Error uploading to GitHub:', error);
    
    // Fallback to local storage
    console.log('GitHub upload failed, falling back to local storage...');
    return await LocalStorageFallback.addEpisode(episodeData);
  }
};

/**
 * Get all episodes from GitHub
 */
export const getAllEpisodes = async (): Promise<Episode[]> => {
  try {
    console.log('Loading episodes from GitHub...');
    
    // Check if GitHub is configured
    if (!isGitHubConfigured()) {
      console.log('GitHub not configured, using local storage...');
      return await LocalStorageFallback.getAllEpisodes();
    }

    // Get episodes from GitHub
    const episodesUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/episodes`;
    
    const files = await githubRequest(episodesUrl);
    
    const episodes: Episode[] = [];
    
    for (const file of files) {
      if (file.name.endsWith('.json')) {
        try {
          // Get file content
          const contentResponse = await fetch(file.download_url);
          const episodeData = await contentResponse.json();
          
          // Convert to Episode format
          const audioUrl = base64ToBlobUrl(episodeData.audioData, episodeData.audioType);
          
          const episode: Episode = {
            id: episodeData.id,
            title: episodeData.title,
            description: episodeData.description,
            audioUrl: audioUrl,
            storagePath: `github://${episodeData.audioName}`,
            createdAt: episodeData.createdAt
          };
          
          episodes.push(episode);
        } catch (error) {
          console.error(`Error loading episode ${file.name}:`, error);
        }
      }
    }
    
    // Sort by creation date (newest first)
    episodes.sort((a, b) => b.createdAt - a.createdAt);
    
    console.log(`Loaded ${episodes.length} episodes from GitHub`);
    return episodes;
    
  } catch (error: any) {
    console.error('Error loading episodes from GitHub:', error);
    
    // Fallback to local storage
    console.log('GitHub load failed, falling back to local storage...');
    return await LocalStorageFallback.getAllEpisodes();
  }
};

/**
 * Delete an episode from GitHub
 */
export const deleteEpisode = async (episode: Episode): Promise<void> => {
  try {
    console.log('Deleting episode from GitHub...');
    
    // Check if GitHub is configured
    if (!isGitHubConfigured()) {
      console.log('GitHub not configured, using local storage...');
      return await LocalStorageFallback.deleteEpisode(episode);
    }

    // Revoke blob URL to free memory
    if (episode.audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(episode.audioUrl);
    }

    // Delete from GitHub
    const filename = `episodes/${episode.id}.json`;
    const deleteUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${filename}`;
    
    // Get file SHA first
    const fileInfo = await githubRequest(deleteUrl);
    
    const deleteData = {
      message: `Delete episode: ${episode.title}`,
      sha: fileInfo.sha,
      branch: GITHUB_BRANCH
    };

    await githubRequest(deleteUrl, {
      method: 'DELETE',
      body: JSON.stringify(deleteData)
    });

    console.log('Episode deleted successfully from GitHub');
    
  } catch (error: any) {
    console.error('Error deleting episode from GitHub:', error);
    
    // Fallback to local storage
    console.log('GitHub delete failed, falling back to local storage...');
    return await LocalStorageFallback.deleteEpisode(episode);
  }
};

// Test GitHub connection
export const testConnection = async (): Promise<boolean> => {
  if (!isGitHubConfigured()) {
    console.log('GitHub not configured, using local storage');
    return true;
  }

  try {
    const testUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}`;
    await githubRequest(testUrl);
    console.log('GitHub connection: OK');
    return true;
  } catch (error) {
    console.error('GitHub connection test failed:', error);
    return false;
  }
};
