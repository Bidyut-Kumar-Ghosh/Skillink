import * as Crypto from "expo-crypto";
import { getUserModel } from "@/models/User";
import {
  storeUserData,
  removeUserData,
  connectToDatabase,
  mongoose,
} from "@/config/mongodb";
import "react-native-get-random-values";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Helper function for password hashing
const hashPassword = async (password: string): Promise<string> => {
  try {
    // First create a salt
    const salt = Crypto.randomUUID();
    // Then hash the password with the salt
    const hashedPassword = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password + salt
    );
    // Return the salt and hashed password combined
    return `${salt}:${hashedPassword}`;
  } catch (error) {
    console.error("Error hashing password:", error);
    // Fallback for development
    return `mock-salt:${password}`;
  }
};

// Helper function for password verification
const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    // Split the stored hash into salt and hash
    const [salt, storedHash] = hashedPassword.split(":");
    // Hash the input password with the same salt
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password + salt
    );
    // Compare the generated hash with the stored hash
    return hash === storedHash;
  } catch (error) {
    console.error("Error verifying password:", error);
    // Fallback for development (NOT for production!)
    return hashedPassword.endsWith(password);
  }
};

// Fallback storage when MongoDB is unavailable
const storeUserInLocalBackup = async (userData: any) => {
  try {
    const existingUsers = await AsyncStorage.getItem("backupUsers");
    const users = existingUsers ? JSON.parse(existingUsers) : [];

    // Check if user already exists
    const existingIndex = users.findIndex(
      (u: any) => u.email === userData.email
    );

    if (existingIndex >= 0) {
      users[existingIndex] = userData;
    } else {
      users.push(userData);
    }

    await AsyncStorage.setItem("backupUsers", JSON.stringify(users));
  } catch (error) {
    console.error("Error storing backup user:", error);
  }
};

// Registration with email
export const registerWithEmail = async (
  email: string,
  password: string,
  name: string = ""
) => {
  try {
    // Try to connect to MongoDB
    await connectToDatabase();

    // Get the User model
    const User = getUserModel();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("This email address is already in use");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      role: email === "admin@skillink.com" ? "admin" : "user",
      createdAt: new Date(),
      lastLoginAt: new Date(),
    });

    // Create user session data (without password)
    const userData = {
      id: newUser._id ? newUser._id.toString() : Date.now().toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      photoURL: newUser.photoURL,
      lastLoginAt: newUser.lastLoginAt,
      createdAt: newUser.createdAt,
    };

    // Store user data in AsyncStorage
    await storeUserData(userData);

    return userData;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// Login with email
export const loginWithEmail = async (email: string, password: string) => {
  try {
    // Try to connect to MongoDB
    await connectToDatabase();

    // Get the User model
    const User = getUserModel();

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Check if user has a password (might be a Google auth user)
    if (!user.password) {
      throw new Error("Please log in with Google");
    }

    // Compare password
    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    // Update last login
    user.lastLoginAt = new Date();
    if (user.save) {
      await user.save();
    }

    // Create user session data (without password)
    const userData = {
      id: user._id ? user._id.toString() : Date.now().toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      photoURL: user.photoURL,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };

    // Store user data in AsyncStorage
    await storeUserData(userData);

    return userData;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Google authentication
export const loginWithGoogle = async (googleUser: {
  email: string;
  name: string;
  googleId: string;
  photoURL?: string;
}) => {
  try {
    // Try to connect to MongoDB
    await connectToDatabase();

    // Get the User model
    const User = getUserModel();

    // Find user by googleId or email
    let user = await User.findOne({ googleId: googleUser.googleId });

    // If no user found by googleId, try to find by email
    if (!user) {
      user = await User.findOne({ email: googleUser.email });

      if (user) {
        // If we found a user by email but with no googleId, update the user
        user.googleId = googleUser.googleId;
        user.photoURL = googleUser.photoURL;
        if (user.save) {
          await user.save();
        }
      } else {
        // Create a new user
        user = await User.create({
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.googleId,
          photoURL: googleUser.photoURL,
          role: googleUser.email === "admin@skillink.com" ? "admin" : "user",
          createdAt: new Date(),
          lastLoginAt: new Date(),
        });
      }
    }

    // Update last login
    user.lastLoginAt = new Date();
    if (googleUser.photoURL && user.photoURL !== googleUser.photoURL) {
      user.photoURL = googleUser.photoURL;
    }
    if (user.save) {
      await user.save();
    }

    // Create user session data
    const userData = {
      id: user._id ? user._id.toString() : Date.now().toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      photoURL: user.photoURL,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };

    // Store user data in AsyncStorage
    await storeUserData(userData);

    return userData;
  } catch (error) {
    console.error("Google login error:", error);
    throw error;
  }
};

// Logout
export const logout = async () => {
  try {
    await removeUserData();
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};
