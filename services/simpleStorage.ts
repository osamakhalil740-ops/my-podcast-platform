// Simple storage service - works locally with export/import
// Episodes are saved locally and can be shared via export

import { Episode, NewEpisodeData } from '../types';

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

// Local storage service
class SimpleStorage {
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
          fileSize: episodeData.audioFile.size,
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

  // Export episodes to JSON file
  static exportEpisodes(): void {
    const episodes = this.getAllEpisodesSync();
    const dataStr = JSON.stringify(episodes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `podcast-episodes-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Import episodes from JSON file
  static importEpisodes(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const episodes = JSON.parse(reader.result as string);
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(episodes));
          resolve();
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}

// Main service functions
export const addEpisode = async (episodeData: NewEpisodeData): Promise<void> => {
  try {
    console.log('Starting episode upload...');
    await SimpleStorage.addEpisode(episodeData);
    console.log('Episode uploaded successfully');
  } catch (error: any) {
    console.error('Error uploading episode:', error);
    throw new Error(`Failed to add episode: ${error.message}`);
  }
};

export const getAllEpisodes = async (): Promise<Episode[]> => {
  try {
    console.log('Loading episodes...');
    const episodes = await SimpleStorage.getAllEpisodes();
    console.log(`Loaded ${episodes.length} episodes`);
    return episodes;
  } catch (error: any) {
    console.error('Error loading episodes:', error);
    throw new Error(`Failed to load episodes: ${error.message}`);
  }
};

export const deleteEpisode = async (episode: Episode): Promise<void> => {
  try {
    console.log('Deleting episode...');
    await SimpleStorage.deleteEpisode(episode);
    console.log('Episode deleted successfully');
  } catch (error: any) {
    console.error('Error deleting episode:', error);
    throw new Error(`Failed to delete episode: ${error.message}`);
  }
};

// Export/Import functions
export const exportEpisodes = (): void => {
  SimpleStorage.exportEpisodes();
};

export const importEpisodes = (file: File): Promise<void> => {
  return SimpleStorage.importEpisodes(file);
};

// Test connection
export const testConnection = async (): Promise<boolean> => {
  return true; // Local storage always works
};
