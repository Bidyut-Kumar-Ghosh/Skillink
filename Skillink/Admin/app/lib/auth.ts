import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateEmail,
  User,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";

// Interface for user data
export interface UserData {
  uid: string;
  email: string;
  name: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  role: "admin" | "teacher" | "student";
  emailVerified: boolean;
  disabled: boolean;
  createdAt: any;
  lastLoginAt: any;
  updatedAt?: any;
}

// Register a new user
export async function registerUser(
  email: string,
  password: string,
  name: string,
  role: "admin" | "teacher" | "student" = "student"
): Promise<UserData> {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Update profile
    await updateProfile(user, {
      displayName: name,
    });

    // Create user document in Firestore
    const userData: UserData = {
      uid: user.uid,
      email: user.email || email,
      name,
      displayName: name,
      role,
      emailVerified: user.emailVerified,
      disabled: false,
      photoURL: user.photoURL || "",
      phoneNumber: user.phoneNumber || "",
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };

    // Save to Firestore
    await setDoc(doc(db, "users", user.uid), userData);

    return userData;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
}

// Login user
export async function loginUser(
  email: string,
  password: string
): Promise<UserData> {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Update last login
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
    });

    // Get user data
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      throw new Error("User does not exist in database");
    }

    return userSnap.data() as UserData;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
}

// Sign out
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}

// Reset password
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
}

// Update user profile
export async function updateUserProfile(
  user: User,
  data: Partial<UserData>
): Promise<void> {
  try {
    const userRef = doc(db, "users", user.uid);

    // Update auth profile if needed
    if (data.displayName || data.photoURL) {
      await updateProfile(user, {
        displayName: data.displayName,
        photoURL: data.photoURL,
      });
    }

    // Update Firestore data
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}

// Change password
export async function changePassword(
  user: User,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  try {
    // Re-authenticate user
    const credential = EmailAuthProvider.credential(
      user.email || "",
      currentPassword
    );
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
}

// Change email
export async function changeEmail(
  user: User,
  password: string,
  newEmail: string
): Promise<void> {
  try {
    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email || "", password);
    await reauthenticateWithCredential(user, credential);

    // Update email in Auth
    await updateEmail(user, newEmail);

    // Update email in Firestore
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      email: newEmail,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error changing email:", error);
    throw error;
  }
}

// Get current user data
export async function getCurrentUserData(
  uid: string
): Promise<UserData | null> {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
}
