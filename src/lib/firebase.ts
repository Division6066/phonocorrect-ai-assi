import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "phonocorrect-ai.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "phonocorrect-ai",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "phonocorrect-ai.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Connect to emulators in development
if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_FIREBASE_USE_PRODUCTION) {
  try {
    // Auth emulator
    if (!auth.currentUser) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    }
    
    // Firestore emulator
    connectFirestoreEmulator(db, 'localhost', 8080);
    
    // Functions emulator
    connectFunctionsEmulator(functions, 'localhost', 5001);
  } catch (error) {
    console.warn('Firebase emulators already connected or not available:', error);
  }
}

export default app;