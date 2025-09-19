// Firebase v9+ modular SDK
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your Firebase project config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyCmkiOOv53tqLrCK8b0EedFkFbMErdn1EY',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'smart-parking-a80b9.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'smart-parking-a80b9',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:40073669003:web:bcc2317d8a75215843e78e',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
