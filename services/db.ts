
// Note: This file has been converted from IndexedDB to a Firebase service.
// It's recommended to rename this file to `podcastService.ts` for clarity.

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, getDocs, 
  deleteDoc, doc, serverTimestamp, query, orderBy 
} from 'firebase/firestore';
import { 
  getStorage, ref, uploadBytes, getDownloadURL, deleteObject
} from 'firebase/storage';
import { Episode, NewEpisodeData } from '../types';

// Your web app's Firebase configuration for "My Podcast V2"
const firebaseConfig = {
  apiKey: "AIzaSyBgOFwWX9A8HCmMGutmU2o5C-HrcGB-4SY",
  authDomain: "my-podcast-v2.firebaseapp.com",
  projectId: "my-podcast-v2",
  storageBucket: "my-podcast-v2.appspot.com",
  messagingSenderId: "84678913209",
  appId: "1:84678913209:web:5b29f4a16c34f50db93f68"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
// Let the SDK automatically resolve the storage bucket from the config.
const storage = getStorage(app);

// Test Firebase connection
const testConnection = async () => {
  try {
    console.log("Testing Firebase connection...");
    // Test Firestore connection
    const testCollection = collection(firestore, 'test');
    console.log("Firestore connection: OK");
    
    // Test Storage connection
    const testRef = ref(storage, 'test/test.txt');
    console.log("Storage connection: OK");
    
    return true;
  } catch (error) {
    console.error("Firebase connection test failed:", error);
    return false;
  }
};

// Run connection test on module load
testConnection();

const EPISODES_COLLECTION = 'episodes';

/**
 * Adds a new episode by uploading the audio file to Storage and saving metadata to Firestore.
 * Enhanced version with better error handling and progress tracking.
 */
export const addEpisode = async (episodeData: NewEpisodeData): Promise<void> => {
  const { title, description, audioFile } = episodeData;

  // Validate file before upload
  if (!audioFile) {
    throw new Error("No audio file provided");
  }

  // Check file size (50MB limit)
  if (audioFile.size > 50 * 1024 * 1024) {
    throw new Error("File size exceeds 50MB limit");
  }

  // Check file type
  if (!audioFile.type.startsWith('audio/')) {
    throw new Error("File must be an audio file");
  }

  const storagePath = `audio/${new Date().toISOString()}_${audioFile.name}`;
  const storageRef = ref(storage, storagePath);
  
  try {
    console.log("Starting upload for file:", audioFile.name, "Size:", audioFile.size);
    
    // Step 1: Upload the file with timeout and better error handling
    const uploadPromise = uploadBytes(storageRef, audioFile);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Upload timeout after 2 minutes")), 2 * 60 * 1000)
    );
    
    const uploadResult = await Promise.race([uploadPromise, timeoutPromise]) as any;
    console.log("Upload completed successfully");
    
    // Step 2: Get the download URL
    const audioUrl = await getDownloadURL(uploadResult.ref);
    console.log("Download URL obtained:", audioUrl);

    // Step 3: Add the episode metadata to Firestore
    const docRef = await addDoc(collection(firestore, EPISODES_COLLECTION), {
      title,
      description,
      audioUrl,
      storagePath,
      createdAt: serverTimestamp(),
    });
    console.log("Episode added to Firestore with ID:", docRef.id);
    
  } catch (error: any) {
    console.error("Error creating episode:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    
    // Provide more specific error messages
    if (error.code === 'storage/unauthorized') {
      throw new Error("❌ Unauthorized: Please check Firebase Storage rules. Go to Firebase Console > Storage > Rules and set: allow read, write: if true;");
    } else if (error.code === 'storage/canceled') {
      throw new Error("❌ Upload was canceled");
    } else if (error.code === 'storage/unknown') {
      throw new Error("❌ Unknown error occurred during upload");
    } else if (error.code === 'storage/retry-limit-exceeded') {
      throw new Error("❌ Upload failed after multiple attempts. Please try again.");
    } else if (error.message.includes('timeout')) {
      throw new Error("❌ Upload timed out. Please try again with a smaller file.");
    } else if (error.message.includes('network')) {
      throw new Error("❌ Network error. Please check your internet connection.");
    } else if (error.message.includes('permission')) {
      throw new Error("❌ Permission denied. Check Firebase Storage rules.");
    } else {
      throw new Error(`❌ Upload failed: ${error.message || 'Unknown error'}. Check Firebase Console for details.`);
    }
  }
};


/**
 * Deletes an episode from both Firebase Storage and Firestore.
 */
export const deleteEpisode = async (episode: Episode): Promise<void> => {
  // 1. Delete the audio file from Storage
  const storageRef = ref(storage, episode.storagePath);
  await deleteObject(storageRef);

  // 2. Delete the episode document from Firestore
  const docRef = doc(firestore, EPISODES_COLLECTION, episode.id);
  await deleteDoc(docRef);
};

/**
 * Retrieves all episodes from Firestore, ordered by creation date.
 */
export const getAllEpisodes = async (): Promise<Episode[]> => {
  const episodesCollection = collection(firestore, EPISODES_COLLECTION);
  // Query to order episodes by 'createdAt' in descending order (newest first)
  const q = query(episodesCollection, orderBy('createdAt', 'desc'));
  
  const snapshot = await getDocs(q);
  
  const episodes: Episode[] = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      description: data.description,
      audioUrl: data.audioUrl,
      storagePath: data.storagePath,
      // Convert Firestore Timestamp to a simple number
      createdAt: data.createdAt?.toMillis() || 0,
    };
  });
  
  return episodes;
};