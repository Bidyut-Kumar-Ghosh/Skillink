// Import Firebase functionality
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBg_u3YRBMEocWRob9N_iSBiPPucdrn8Js",
  authDomain: "skillink-education-app.firebaseapp.com",
  projectId: "skillink-education-app",
  storageBucket: "skillink-education-app.appspot.com",
  messagingSenderId: "718630093691",
  appId: "1:718630093691:web:6aa6ec03bc19d6d347f3de",
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
