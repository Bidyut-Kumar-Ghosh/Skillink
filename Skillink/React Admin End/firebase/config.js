// Import Firebase functionality
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChwNmitDIeX7fwkOWFP2tR4FOt7YzHMnc",
  authDomain: "skillink-education.firebaseapp.com",
  projectId: "skillink-education",
  storageBucket: "skillink-education.firebasestorage.app",
  messagingSenderId: "408227425879",
  appId: "1:408227425879:web:1db75f11760dde21e6fd12",
  measurementId: "G-41N3D73DBF",
};

// Initialize Firebase - check if app already exists to prevent duplicate initialization
let app;
try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
} catch (error) {
  console.error("Firebase initialization error:", error);
  // Fallback initialization
  app = initializeApp(firebaseConfig);
}

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
