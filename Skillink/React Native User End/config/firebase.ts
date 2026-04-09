// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
  Auth,
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore/lite";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBg_u3YRBMEocWRob9N_iSBiPPucdrn8Js",
  authDomain: "skillink-education-app.firebaseapp.com",
  projectId: "skillink-education-app",
  storageBucket: "skillink-education-app.appspot.com",
  messagingSenderId: "718630093691",
  appId: "1:718630093691:web:6aa6ec03bc19d6d347f3de",
};

// Reuse app instance during fast refresh/hot reload.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth differently based on platform
let auth: Auth;
if (Platform.OS === "web") {
  // Use standard getAuth for web
  auth = getAuth(app);
} else {
  // Use React Native specific persistence for mobile
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // Auth may already be initialized after fast refresh.
    auth = getAuth(app);
  }
}

// Initialize Firestore & Storage
const db: Firestore = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
