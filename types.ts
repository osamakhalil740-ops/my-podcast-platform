
// Data required when creating a new episode.
// This is used by the uploader form.
export interface NewEpisodeData {
  title: string;
  description: string;
  audioFile: File;
}

// The definitive Episode object structure.
// This is what's stored in Firestore (minus id) and used throughout the React app state.
export interface Episode {
  id: string; // Document ID from Firestore
  title: string;
  description: string;
  audioUrl: string;    // Public URL from Firebase Storage
  storagePath: string; // Path in Firebase Storage (needed for deletion)
  createdAt: number;   // Timestamp for sorting
}
