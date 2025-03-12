import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyA6VM4Q_-LyWlsNae8PqknE5o9XPfXsmiA",
  authDomain: "micro-saas-ai-builder.firebaseapp.com",
  projectId: "micro-saas-ai-builder",
  storageBucket: "micro-saas-ai-builder.firebasestorage.app",
  messagingSenderId: "172702449522",
  appId: "1:172702449522:web:e2e8df3546ef4340ef67eb",
  measurementId: "G-RXMCR0EWW7"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
