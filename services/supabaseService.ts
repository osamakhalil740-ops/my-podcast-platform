// Supabase service for persistent storage
// Free alternative to Firebase with better features

import { createClient } from '@supabase/supabase-js';
import { Episode, NewEpisodeData } from '../types';

// Supabase configuration - FREE TIER
const supabaseUrl = 'https://your-project.supabase.co'; // Replace with your Supabase URL
const supabaseKey = 'your-anon-key'; // Replace with your Supabase anon key

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

/**
 * Add a new episode to Supabase
 */
export const addEpisode = async (episodeData: NewEpisodeData): Promise<void> => {
  try {
    console.log('Starting episode upload to Supabase...');
    
    // Convert audio file to base64
    const audioBase64 = await fileToBase64(episodeData.audioFile);
    
    // Prepare episode data
    const episodeRecord = {
      title: episodeData.title,
      description: episodeData.description,
      audio_data: audioBase64,
      audio_type: episodeData.audioFile.type,
      audio_name: episodeData.audioFile.name,
      file_size: episodeData.audioFile.size,
      created_at: new Date().toISOString()
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('episodes')
      .insert([episodeRecord]);

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Failed to upload episode: ${error.message}`);
    }

    console.log('Episode uploaded successfully to Supabase');
    
  } catch (error: any) {
    console.error('Error uploading episode:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};

/**
 * Get all episodes from Supabase
 */
export const getAllEpisodes = async (): Promise<Episode[]> => {
  try {
    console.log('Loading episodes from Supabase...');
    
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Failed to load episodes: ${error.message}`);
    }

    // Convert Supabase data to Episode format
    const episodes: Episode[] = data.map((record: any) => {
      const audioUrl = base64ToBlobUrl(record.audio_data, record.audio_type);
      
      return {
        id: record.id.toString(),
        title: record.title,
        description: record.description,
        audioUrl: audioUrl,
        storagePath: `supabase://${record.audio_name}`,
        createdAt: new Date(record.created_at).getTime()
      };
    });

    console.log(`Loaded ${episodes.length} episodes from Supabase`);
    return episodes;
    
  } catch (error: any) {
    console.error('Error loading episodes:', error);
    throw new Error(`Failed to load episodes: ${error.message}`);
  }
};

/**
 * Delete an episode from Supabase
 */
export const deleteEpisode = async (episode: Episode): Promise<void> => {
  try {
    console.log('Deleting episode from Supabase...');
    
    // Revoke blob URL to free memory
    if (episode.audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(episode.audioUrl);
    }

    const { error } = await supabase
      .from('episodes')
      .delete()
      .eq('id', parseInt(episode.id));

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Failed to delete episode: ${error.message}`);
    }

    console.log('Episode deleted successfully from Supabase');
    
  } catch (error: any) {
    console.error('Error deleting episode:', error);
    throw new Error(`Failed to delete episode: ${error.message}`);
  }
};

// Test Supabase connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('episodes')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('Supabase connection: OK');
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
};
