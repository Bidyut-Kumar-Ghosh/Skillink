import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChwNmitDIeX7fwkOWFP2tR4FOt7YzHMnc",
  authDomain: "skillink-education.firebaseapp.com",
  projectId: "skillink-education",
  storageBucket: "skillink-education.firebasestorage.app",
  messagingSenderId: "408227425879",
  appId: "1:408227425879:web:1db75f11760dde21e6fd12",
  measurementId: "G-41N3D73DBF",
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);

// Setup Firebase Auth with AsyncStorage for session persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore
const db = getFirestore(app);

// Export everything properly
export { app, auth, db };
