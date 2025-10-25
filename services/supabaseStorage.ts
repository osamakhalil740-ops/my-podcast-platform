// Supabase Storage Service - Global persistent storage
// Episodes are stored on Supabase and accessible from anywhere

import { createClient } from '@supabase/supabase-js';
import { Episode, NewEpisodeData } from '../types';

// Supabase configuration - FREE TIER
const supabaseUrl = 'https://kwkutdenzvtdctjkvkui.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3a3V0ZGVuenZ0ZGN0amt2a3VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTQyODUsImV4cCI6MjA3NjkzMDI4NX0.aVvI6B02CgMjb4Bh6jrvUrZ_NTi6w6mQScFz0egEj2k';
// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

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

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://your-project.supabase.co' && 
         supabaseKey !== 'your-anon-key';
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
 * Add a new episode to Supabase
 */
export const addEpisode = async (episodeData: NewEpisodeData): Promise<void> => {
  try {
    console.log('Starting episode upload to Supabase...');
    
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, using local storage...');
      return await LocalStorageFallback.addEpisode(episodeData);
    }

    // Convert audio file to base64
    const audioBase64 = await fileToBase64(episodeData.audioFile);
    
    // Create episode data
    const episode = {
      title: episodeData.title,
      description: episodeData.description,
      audio_data: audioBase64,
      audio_type: episodeData.audioFile.type,
      audio_name: episodeData.audioFile.name,
      file_size: episodeData.audioFile.size,
      created_at: new Date().toISOString()
    };

    // Upload to Supabase with timeout
    console.log('Uploading episode to Supabase...');
    console.log('Episode data:', {
      title: episode.title,
      description: episode.description,
      audio_type: episode.audio_type,
      audio_name: episode.audio_name,
      file_size: episode.file_size
    });

    // Upload to Supabase with timeout
    const uploadPromise = supabase
      .from('episodes')
      .insert([episode]);

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Upload timeout after 30 seconds')), 30000)
    );

    const { data, error } = await Promise.race([uploadPromise, timeoutPromise]) as any;

    if (error) {
      console.error('Supabase upload error:', error);
      console.error('Error details:', error.message, error.code, error.details);
      throw new Error(`Supabase error: ${error.message} (Code: ${error.code})`);
    }

    console.log('Upload successful, data:', data);

    console.log('Episode uploaded successfully to Supabase');
    
  } catch (error: any) {
    console.error('Error uploading to Supabase:', error);
    
    // Fallback to local storage
    console.log('Supabase upload failed, falling back to local storage...');
    return await LocalStorageFallback.addEpisode(episodeData);
  }
};

/**
 * Get all episodes from Supabase
 */
export const getAllEpisodes = async (): Promise<Episode[]> => {
  try {
    console.log('Loading episodes from Supabase...');
    
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, using local storage...');
      return await LocalStorageFallback.getAllEpisodes();
    }

    // Get episodes from Supabase
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    // Convert to Episode format
    const formattedEpisodes: Episode[] = data.map((ep: any) => {
      const audioUrl = base64ToBlobUrl(ep.audio_data, ep.audio_type);
      
      return {
        id: ep.id.toString(),
        title: ep.title,
        description: ep.description,
        audioUrl: audioUrl,
        storagePath: `supabase://${ep.audio_name}`,
        createdAt: new Date(ep.created_at).getTime()
      };
    });

    console.log(`Loaded ${formattedEpisodes.length} episodes from Supabase`);
    return formattedEpisodes;
    
  } catch (error: any) {
    console.error('Error loading episodes from Supabase:', error);
    
    // Fallback to local storage
    console.log('Supabase load failed, falling back to local storage...');
    return await LocalStorageFallback.getAllEpisodes();
  }
};

/**
 * Delete an episode from Supabase
 */
export const deleteEpisode = async (episode: Episode): Promise<void> => {
  try {
    console.log('Deleting episode from Supabase...');
    
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, using local storage...');
      return await LocalStorageFallback.deleteEpisode(episode);
    }

    // Revoke blob URL to free memory
    if (episode.audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(episode.audioUrl);
    }

    // Delete from Supabase
    const { error } = await supabase
      .from('episodes')
      .delete()
      .eq('id', parseInt(episode.id));

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    console.log('Episode deleted successfully from Supabase');
    
  } catch (error: any) {
    console.error('Error deleting episode from Supabase:', error);
    
    // Fallback to local storage
    console.log('Supabase delete failed, falling back to local storage...');
    return await LocalStorageFallback.deleteEpisode(episode);
  }
};

// Test connection
export const testConnection = async (): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured, using local storage');
    return true;
  }

  try {
    console.log('Testing Supabase connection...');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseKey.substring(0, 20) + '...');
    
    const { data, error } = await supabase
      .from('episodes')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      console.error('Error details:', error.message, error.code);
      return false;
    }
    
    console.log('Supabase connection: OK');
    console.log('Data:', data);
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
};
