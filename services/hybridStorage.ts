// Hybrid storage service - combines local storage with Supabase
// Falls back to local storage if Supabase is not configured

import { Episode, NewEpisodeData } from '../types';

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  // Check if Supabase URL and key are set (not the placeholder values)
  const supabaseUrl = 'https://your-project.supabase.co';
  const supabaseKey = 'your-anon-key';
  
  return supabaseUrl !== 'https://your-project.supabase.co' && 
         supabaseKey !== 'your-anon-key';
};

// Local storage fallback
class LocalStorageService {
  private static STORAGE_KEY = 'podcast_episodes';

  static async addEpisode(episodeData: NewEpisodeData): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const episode = {
          id: Date.now().toString(),
          title: episodeData.title,
          description: episodeData.description,
          audioData: reader.result as string, // base64
          audioType: episodeData.audioFile.type,
          audioName: episodeData.audioFile.name,
          createdAt: Date.now()
        };

        // Get existing episodes
        const existing = this.getAllEpisodesSync();
        existing.unshift(episode); // Add to beginning

        // Save to localStorage
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
        audioUrl: ep.audioData, // Already base64 data URL
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

// Supabase service (if configured)
let supabaseService: any = null;

if (isSupabaseConfigured()) {
  try {
    // Dynamically import Supabase service
    supabaseService = await import('./supabaseService');
    console.log('Supabase service loaded');
  } catch (error) {
    console.warn('Supabase service not available, using local storage');
  }
}

// Main service functions
export const addEpisode = async (episodeData: NewEpisodeData): Promise<void> => {
  try {
    if (supabaseService && isSupabaseConfigured()) {
      console.log('Using Supabase storage...');
      return await supabaseService.addEpisode(episodeData);
    } else {
      console.log('Using local storage...');
      return await LocalStorageService.addEpisode(episodeData);
    }
  } catch (error: any) {
    console.error('Storage error:', error);
    
    // Fallback to local storage if Supabase fails
    if (supabaseService && isSupabaseConfigured()) {
      console.log('Supabase failed, falling back to local storage...');
      return await LocalStorageService.addEpisode(episodeData);
    }
    
    throw new Error(`Failed to add episode: ${error.message}`);
  }
};

export const getAllEpisodes = async (): Promise<Episode[]> => {
  try {
    if (supabaseService && isSupabaseConfigured()) {
      console.log('Loading from Supabase...');
      return await supabaseService.getAllEpisodes();
    } else {
      console.log('Loading from local storage...');
      return await LocalStorageService.getAllEpisodes();
    }
  } catch (error: any) {
    console.error('Load error:', error);
    
    // Fallback to local storage if Supabase fails
    if (supabaseService && isSupabaseConfigured()) {
      console.log('Supabase failed, falling back to local storage...');
      return await LocalStorageService.getAllEpisodes();
    }
    
    throw new Error(`Failed to load episodes: ${error.message}`);
  }
};

export const deleteEpisode = async (episode: Episode): Promise<void> => {
  try {
    if (supabaseService && isSupabaseConfigured()) {
      console.log('Deleting from Supabase...');
      return await supabaseService.deleteEpisode(episode);
    } else {
      console.log('Deleting from local storage...');
      return await LocalStorageService.deleteEpisode(episode);
    }
  } catch (error: any) {
    console.error('Delete error:', error);
    
    // Fallback to local storage if Supabase fails
    if (supabaseService && isSupabaseConfigured()) {
      console.log('Supabase failed, falling back to local storage...');
      return await LocalStorageService.deleteEpisode(episode);
    }
    
    throw new Error(`Failed to delete episode: ${error.message}`);
  }
};

// Test connection
export const testConnection = async (): Promise<boolean> => {
  if (supabaseService && isSupabaseConfigured()) {
    try {
      return await supabaseService.testConnection();
    } catch (error) {
      console.warn('Supabase connection failed, using local storage');
      return false;
    }
  }
  return true; // Local storage always works
};
