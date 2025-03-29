import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  inMemoryPersistence,
} from "firebase/auth";
import { Platform } from "react-native";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzJB2iQeNc7LzTWlhW9X6SejcYbgLQvxU",
  authDomain: "skillink-1e68d.firebaseapp.com",
  projectId: "skillink-1e68d",
  storageBucket: "skillink-1e68d.appspot.com",
  messagingSenderId: "142423143478",
  appId: "1:142423143478:web:cd89cefd2001b5c0943f40",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Set persistence based on platform
const setPersistenceByPlatform = async () => {
  try {
    // For web use local persistence, for mobile use in-memory
    // Since mobile apps have their own persistence mechanism
    if (Platform.OS === "web") {
      await setPersistence(auth, browserLocalPersistence);
    } else {
      await setPersistence(auth, inMemoryPersistence);
    }
  } catch (error) {
    console.error("Error setting auth persistence:", error);
  }
};

// Call the function to set persistence
setPersistenceByPlatform();
