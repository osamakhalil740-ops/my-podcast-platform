// Vercel Storage Service - Global persistent storage
// Episodes are stored on Vercel and accessible from anywhere

import { Episode, NewEpisodeData } from '../types';

// Vercel configuration
const VERCEL_API_URL = 'https://my-podcast-platform.vercel.app/api';

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

// Check if Vercel is configured
const isVercelConfigured = () => {
  return VERCEL_API_URL !== 'https://your-app.vercel.app/api';
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
 * Add a new episode to Vercel storage
 */
export const addEpisode = async (episodeData: NewEpisodeData): Promise<void> => {
  try {
    console.log('Starting episode upload to Vercel...');
    
    // Check if Vercel is configured
    if (!isVercelConfigured()) {
      console.log('Vercel not configured, using local storage...');
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

    // Upload to Vercel
    const response = await fetch(`${VERCEL_API_URL}/episodes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(episode)
    });

    if (!response.ok) {
      throw new Error(`Vercel error: ${response.status}`);
    }

    console.log('Episode uploaded successfully to Vercel');
    
  } catch (error: any) {
    console.error('Error uploading to Vercel:', error);
    
    // Fallback to local storage
    console.log('Vercel upload failed, falling back to local storage...');
    return await LocalStorageFallback.addEpisode(episodeData);
  }
};

/**
 * Get all episodes from Vercel storage
 */
export const getAllEpisodes = async (): Promise<Episode[]> => {
  try {
    console.log('Loading episodes from Vercel...');
    
    // Check if Vercel is configured
    if (!isVercelConfigured()) {
      console.log('Vercel not configured, using local storage...');
      return await LocalStorageFallback.getAllEpisodes();
    }

    // Get episodes from Vercel
    const response = await fetch(`${VERCEL_API_URL}/episodes`);
    
    if (!response.ok) {
      throw new Error(`Vercel error: ${response.status}`);
    }
    
    const episodes = await response.json();
    
    // Convert to Episode format
    const formattedEpisodes: Episode[] = episodes.map((ep: any) => {
      const audioUrl = base64ToBlobUrl(ep.audioData, ep.audioType);
      
      return {
        id: ep.id,
        title: ep.title,
        description: ep.description,
        audioUrl: audioUrl,
        storagePath: `vercel://${ep.audioName}`,
        createdAt: ep.createdAt
      };
    });
    
    // Sort by creation date (newest first)
    formattedEpisodes.sort((a, b) => b.createdAt - a.createdAt);
    
    console.log(`Loaded ${formattedEpisodes.length} episodes from Vercel`);
    return formattedEpisodes;
    
  } catch (error: any) {
    console.error('Error loading episodes from Vercel:', error);
    
    // Fallback to local storage
    console.log('Vercel load failed, falling back to local storage...');
    return await LocalStorageFallback.getAllEpisodes();
  }
};

/**
 * Delete an episode from Vercel storage
 */
export const deleteEpisode = async (episode: Episode): Promise<void> => {
  try {
    console.log('Deleting episode from Vercel...');
    
    // Check if Vercel is configured
    if (!isVercelConfigured()) {
      console.log('Vercel not configured, using local storage...');
      return await LocalStorageFallback.deleteEpisode(episode);
    }

    // Revoke blob URL to free memory
    if (episode.audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(episode.audioUrl);
    }

    // Delete from Vercel
    const response = await fetch(`${VERCEL_API_URL}/episodes/${episode.id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Vercel error: ${response.status}`);
    }

    console.log('Episode deleted successfully from Vercel');
    
  } catch (error: any) {
    console.error('Error deleting episode from Vercel:', error);
    
    // Fallback to local storage
    console.log('Vercel delete failed, falling back to local storage...');
    return await LocalStorageFallback.deleteEpisode(episode);
  }
};

// Test connection
export const testConnection = async (): Promise<boolean> => {
  if (!isVercelConfigured()) {
    console.log('Vercel not configured, using local storage');
    return true;
  }

  try {
    const response = await fetch(`${VERCEL_API_URL}/episodes`);
    return response.ok;
  } catch (error) {
    console.error('Vercel connection test failed:', error);
    return false;
  }
};
