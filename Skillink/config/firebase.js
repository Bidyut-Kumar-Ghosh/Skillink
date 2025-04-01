// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBg_u3YRBMEocWRob9N_iSBiPPucdrn8Js",
  authDomain: "skillink-education-app.firebaseapp.com",
  projectId: "skillink-education-app",
  storageBucket: "skillink-education-app.appspot.com",
  messagingSenderId: "718630093691",
  appId: "1:718630093691:web:6aa6ec03bc19d6d347f3de",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore & Storage
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
