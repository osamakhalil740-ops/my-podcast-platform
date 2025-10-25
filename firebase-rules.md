# Firebase Security Rules

## Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /episodes/{document} {
      allow read: if true; // Allow everyone to read episodes
      allow write: if true; // Allow everyone to write episodes (for development)
    }
  }
}
```

## Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /audio/{allPaths=**} {
      allow read: if true; // Allow everyone to read audio files
      allow write: if true; // Allow everyone to upload audio files (for development)
    }
  }
}
```

## How to Update Rules:

### For Firestore:
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Go to Rules tab
4. Replace the rules with the above code
5. Click "Publish"

### For Storage:
1. Go to Firebase Console
2. Navigate to Storage
3. Go to Rules tab
4. Replace the rules with the above code
5. Click "Publish"

## Important Notes:
- These rules allow public access (for development only)
- For production, implement proper authentication
- Make sure your Firebase project is properly configured
