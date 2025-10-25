// Local database service using IndexedDB instead of Firebase
// This eliminates the need for Firebase billing and works offline

import { Episode, NewEpisodeData } from '../types';

const DB_NAME = 'PodcastPlatformDB';
const DB_VERSION = 1;
const EPISODES_STORE = 'episodes';

class LocalDatabase {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open database');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('Local database initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create episodes store if it doesn't exist
        if (!db.objectStoreNames.contains(EPISODES_STORE)) {
          const store = db.createObjectStore(EPISODES_STORE, { keyPath: 'id', autoIncrement: true });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  private async ensureDb(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  async addEpisode(episodeData: NewEpisodeData): Promise<void> {
    const db = await this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([EPISODES_STORE], 'readwrite');
      const store = transaction.objectStore(EPISODES_STORE);

      // Convert File to ArrayBuffer for storage
      const reader = new FileReader();
      reader.onload = () => {
        const episode = {
          title: episodeData.title,
          description: episodeData.description,
          audioData: reader.result as ArrayBuffer,
          audioType: episodeData.audioFile.type,
          audioName: episodeData.audioFile.name,
          createdAt: Date.now(),
        };

        const request = store.add(episode);
        
        request.onsuccess = () => {
          console.log('Episode added successfully');
          resolve();
        };
        
        request.onerror = () => {
          console.error('Failed to add episode');
          reject(request.error);
        };
      };

      reader.onerror = () => {
        reject(new Error('Failed to read audio file'));
      };

      reader.readAsArrayBuffer(episodeData.audioFile);
    });
  }

  async getAllEpisodes(): Promise<Episode[]> {
    const db = await this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([EPISODES_STORE], 'readonly');
      const store = transaction.objectStore(EPISODES_STORE);
      const index = store.index('createdAt');
      const request = index.openCursor(null, 'prev'); // Sort by newest first

      const episodes: Episode[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const data = cursor.value;
          
          // Convert ArrayBuffer back to Blob URL
          const blob = new Blob([data.audioData], { type: data.audioType });
          const audioUrl = URL.createObjectURL(blob);
          
          const episode: Episode = {
            id: cursor.key.toString(),
            title: data.title,
            description: data.description,
            audioUrl: audioUrl,
            storagePath: `local://${data.audioName}`, // Local storage path
            createdAt: data.createdAt,
          };

          episodes.push(episode);
          cursor.continue();
        } else {
          resolve(episodes);
        }
      };

      request.onerror = () => {
        console.error('Failed to get episodes');
        reject(request.error);
      };
    });
  }

  async deleteEpisode(episode: Episode): Promise<void> {
    const db = await this.ensureDb();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([EPISODES_STORE], 'readwrite');
      const store = transaction.objectStore(EPISODES_STORE);
      
      // Revoke the blob URL to free memory
      if (episode.audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(episode.audioUrl);
      }

      const request = store.delete(parseInt(episode.id));
      
      request.onsuccess = () => {
        console.log('Episode deleted successfully');
        resolve();
      };
      
      request.onerror = () => {
        console.error('Failed to delete episode');
        reject(request.error);
      };
    });
  }
}

// Create singleton instance
const localDb = new LocalDatabase();

// Initialize database on module load
localDb.init().catch(console.error);

// Export functions that match the Firebase API
export const addEpisode = async (episodeData: NewEpisodeData): Promise<void> => {
  return localDb.addEpisode(episodeData);
};

export const getAllEpisodes = async (): Promise<Episode[]> => {
  return localDb.getAllEpisodes();
};

export const deleteEpisode = async (episode: Episode): Promise<void> => {
  return localDb.deleteEpisode(episode);
};
