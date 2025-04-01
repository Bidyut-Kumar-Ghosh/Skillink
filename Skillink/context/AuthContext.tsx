import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from './ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { hashPassword, verifyPassword } from '@/utils/crypto';
import { showError, showSuccess, getErrorCode } from '@/app/components/NotificationHandler';

// Function to get user data from Firestore
const getUserData = async (uid: string) => {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            return userDoc.data();
        }
        return null;
    } catch (error) {
        console.error('Error retrieving user data:', error);
        return null;
    }
};

// Function to get user by email
const getUserByEmail = async (email: string) => {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data();
        }
        return null;
    } catch (error) {
        console.error('Error retrieving user by email:', error);
        return null;
    }
};

// Custom log function to avoid excessive error logging
const logAuthError = (message: string, error: any) => {
    // Report the error to our notification handler
    const errorCode = getErrorCode(error);
    showError(errorCode, error.message || message);
};

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    photoURL?: string;
    createdAt?: Date;
}

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    isAdmin: boolean;
    loading: boolean;
    authLoading: boolean;
    signUp: (email: string, password: string, name?: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    logOut: () => Promise<void>;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);
    const { theme } = useTheme();

    // If theme is not available, don't render children to prevent errors
    if (!theme) {
        return null;
    }

    // Check if user is logged in on app load
    useEffect(() => {
        const checkPersistedUser = async () => {
            try {
                // First check AsyncStorage for persisted user
                const storedUser = await AsyncStorage.getItem('user');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    setLoading(false);
                    return;
                }
            } catch (error) {
                console.error('Error checking persisted user:', error);
            }

            // If no persisted user, check Firebase auth state
            const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                try {
                    if (firebaseUser) {
                        // Get user data from Firestore
                        const userData = await getUserData(firebaseUser.uid);
                        if (userData) {
                            const userObj = {
                                id: firebaseUser.uid,
                                email: firebaseUser.email || '',
                                name: userData.name || '',
                                role: userData.role || 'user',
                                photoURL: userData.photoURL,
                                createdAt: userData.createdAt,
                            };

                            setUser(userObj);

                            // Store user in AsyncStorage for persistence
                            try {
                                await AsyncStorage.setItem('user', JSON.stringify(userObj));
                            } catch (storageError) {
                                console.error('Error saving user to storage:', storageError);
                            }
                        }
                    } else {
                        setUser(null);
                        // Clear AsyncStorage if no user
                        try {
                            await AsyncStorage.removeItem('user');
                        } catch (storageError) {
                            console.error('Error removing user from storage:', storageError);
                        }
                    }
                } catch (error) {
                    console.error('Error checking user session:', error);
                } finally {
                    setLoading(false);
                }
            });

            return () => unsubscribe();
        };

        checkPersistedUser();
    }, []);

    const signUp = async (email: string, password: string, name?: string) => {
        try {
            setAuthLoading(true);
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // Hash the password before storing
            const hashedPassword = await hashPassword(password);

            // Current timestamp for account creation
            const timestamp = serverTimestamp();

            // Save additional user data to Firestore
            const userData = {
                name: name || '',
                email: email,
                uid: firebaseUser.uid,
                password: hashedPassword, // Store hashed password
                role: email === "admin@skillink.com" ? "admin" : "user",
                createdAt: timestamp,
            };

            await setDoc(doc(db, "users", firebaseUser.uid), userData);

            // Don't automatically sign in or update local user state
            // Don't navigate to home automatically

            // Sign out the user to force them to log in
            await signOut(auth);

        } catch (error: any) {
            logAuthError('Error signing up with email:', error);
            throw error;
        } finally {
            setAuthLoading(false);
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            setAuthLoading(true);

            // Try to sign in directly with Firebase Auth
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const firebaseUser = userCredential.user;

                // Get user data from Firestore
                const userData = await getUserData(firebaseUser.uid);

                if (!userData) {
                    // User exists in Auth but not in Firestore - create a record
                    const timestamp = serverTimestamp();
                    const hashedPassword = await hashPassword(password);

                    const newUserData = {
                        name: '',
                        email: email,
                        uid: firebaseUser.uid,
                        password: hashedPassword,
                        role: 'user',
                        createdAt: timestamp,
                    };

                    await setDoc(doc(db, "users", firebaseUser.uid), newUserData);

                    // Create user object
                    const userObj = {
                        id: firebaseUser.uid,
                        email: email,
                        name: '',
                        role: 'user',
                        createdAt: timestamp,
                    };

                    // Update local user state
                    setUser(userObj);

                    // Store in AsyncStorage for persistence
                    await AsyncStorage.setItem('user', JSON.stringify(userObj));

                    router.replace('/');
                    return;
                }

                // Create user object with all necessary info
                const userObj = {
                    id: firebaseUser.uid,
                    email: email,
                    name: userData.name || '',
                    role: userData.role || 'user',
                    photoURL: userData.photoURL,
                    createdAt: userData.createdAt,
                };

                // Update local user state
                setUser(userObj);

                // Store in AsyncStorage for persistence
                await AsyncStorage.setItem('user', JSON.stringify(userObj));

                router.replace('/');
                return;
            } catch (firebaseError: any) {
                // Don't log to console, only use our error handler for UI display
                // Instead of console.error, use reportError
                const errorCode = getErrorCode(firebaseError);
                showError(errorCode, firebaseError.message || 'Authentication failed');

                // If Firebase auth fails, try to find user in Firestore by email
                const firestoreUser = await getUserByEmail(email);

                if (!firestoreUser) {
                    setAuthLoading(false);
                    // User doesn't exist at all
                    return Promise.reject(new Error('Invalid email or password'));
                }

                // Verify password against stored hash
                const passwordMatches = await verifyPassword(password, firestoreUser.password);

                if (!passwordMatches) {
                    setAuthLoading(false);
                    return Promise.reject(new Error('Invalid email or password'));
                }

                // Password matches in Firestore, but Firebase Auth failed
                // This could happen if Firebase Auth is reset but Firestore records remain
                // In this case, create a new Firebase Auth account
                try {
                    // Try to create the user in Firebase Auth
                    await createUserWithEmailAndPassword(auth, email, password);

                    // Then sign in again
                    const userCredential = await signInWithEmailAndPassword(auth, email, password);
                    const firebaseUser = userCredential.user;

                    // Update Firestore record to match new UID if needed
                    if (firestoreUser.uid !== firebaseUser.uid) {
                        await setDoc(doc(db, "users", firebaseUser.uid), {
                            ...firestoreUser,
                            uid: firebaseUser.uid
                        });
                    }

                    // Create user object
                    const userObj = {
                        id: firebaseUser.uid,
                        email: email,
                        name: firestoreUser.name || '',
                        role: firestoreUser.role || 'user',
                        photoURL: firestoreUser.photoURL,
                        createdAt: firestoreUser.createdAt,
                    };

                    // Update local user state
                    setUser(userObj);

                    // Store in AsyncStorage for persistence
                    await AsyncStorage.setItem('user', JSON.stringify(userObj));

                    router.replace('/');
                    return;
                } catch (createError: any) {
                    // Don't log to console
                    const createErrorCode = getErrorCode(createError);
                    showError(createErrorCode, createError.message || 'Error creating user');

                    // If we can't create/signin with Firebase Auth, 
                    // but we verified credentials in Firestore, still allow login
                    console.error('Error creating Firebase Auth user:', createError);

                    const userObj = {
                        id: firestoreUser.uid,
                        email: email,
                        name: firestoreUser.name || '',
                        role: firestoreUser.role || 'user',
                        photoURL: firestoreUser.photoURL,
                        createdAt: firestoreUser.createdAt,
                    };

                    // Update local user state
                    setUser(userObj);

                    // Store in AsyncStorage for persistence
                    await AsyncStorage.setItem('user', JSON.stringify(userObj));

                    router.replace('/');
                    return;
                }
            }
        } catch (error: any) {
            // This could be either an expected or unexpected error
            logAuthError('Error signing in:', error);
            setAuthLoading(false);
            return Promise.reject(error);
        } finally {
            setAuthLoading(false);
        }
    };

    const logOut = async () => {
        try {
            setAuthLoading(true);

            // Clear AsyncStorage first
            await AsyncStorage.removeItem('user');

            // Sign out from Firebase
            try {
                await signOut(auth);
            } catch (signOutError: any) {
                console.error('Firebase signOut error:', signOutError);
                // If we're on web, continue with the logout process even if Firebase signOut fails
                // This ensures users can still log out on web even if there's an auth token issue
            }

            // Clear local state - this is crucial and should happen regardless of signOut success
            setUser(null);

            // Navigate to login
            router.replace('/authentication/login');
            showSuccess("Success", "You have been logged out successfully!");
        } catch (error: any) {
            logAuthError('Error signing out:', error);
            // Even on error, we should try to clear the user state to prevent being stuck
            setUser(null);
            router.replace('/authentication/login');
        } finally {
            setAuthLoading(false);
        }
    };

    // Admin check
    const isAdmin = user?.role === 'admin';

    // Return context provider with authentication state and functions
    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                authLoading,
                isLoggedIn: !!user,
                isAdmin,
                signUp,
                signIn,
                logOut,
                setUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
} 