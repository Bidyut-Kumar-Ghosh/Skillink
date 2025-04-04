import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from './ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    UserCredential,
    User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs, FieldValue } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { hashPassword, verifyPassword } from '@/utils/crypto';
import { showError, showSuccess, getErrorCode } from '@/app/components/NotificationHandler';

// Function to get user data from Firestore
const getUserData = async (uid: string): Promise<User | null> => {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            const data = userDoc.data() as FirestoreUser;
            return {
                id: uid,
                email: data.email || '',
                name: data.name || '',
                role: data.role || 'user',
                createdAt: data.createdAt,
            };
        }
        return null;
    } catch (error) {
        console.error('Error retrieving user data:', error);
        return null;
    }
};

// Function to get user by email
const getUserByEmail = async (email: string): Promise<FirestoreUser | null> => {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data() as FirestoreUser;
            return {
                id: querySnapshot.docs[0].id,
                email: data.email || '',
                name: data.name || '',
                role: data.role || 'user',
                createdAt: data.createdAt,
                password: data.password,
                uid: data.uid,
            };
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
    createdAt?: Date | FieldValue;
    password?: string;
    uid?: string;
}

interface FirestoreUser extends User {
    uid: string;
    password: string;
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
            try {
                const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                    try {
                        if (firebaseUser) {
                            // Get user data from Firestore
                            const userData = await getUserData(firebaseUser.uid);
                            if (userData) {
                                const userObj: User = {
                                    id: firebaseUser.uid,
                                    email: firebaseUser.email || '',
                                    name: userData.name || '',
                                    role: userData.role || 'user',
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
            } catch (authError) {
                console.error('Auth state subscription error:', authError);
                setLoading(false);
            }
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
            const userData: FirestoreUser = {
                id: firebaseUser.uid,
                name: name || '',
                email: email,
                uid: firebaseUser.uid,
                password: hashedPassword,
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
                    const userObj: User = {
                        id: firebaseUser.uid,
                        email: email,
                        name: '',
                        role: 'user',
                        createdAt: timestamp,
                    };

                    // Update local user state
                    setUser(userObj);

                    // Store in AsyncStorage for persistence
                    await AsyncStorage.setItem("user", JSON.stringify(userObj));

                    router.replace('/');
                    return;
                }

                // Create user object with all necessary info
                const userObj: User = {
                    id: firebaseUser.uid,
                    email: email,
                    name: userData.name || '',
                    role: userData.role || 'user',
                    createdAt: userData.createdAt,
                };

                // Update local user state
                setUser(userObj);

                // Store in AsyncStorage for persistence
                await AsyncStorage.setItem("user", JSON.stringify(userObj));

                router.replace('/');
                return;
            } catch (firebaseError: any) {
                // Handle Firebase auth errors with a single notification
                if (firebaseError.code === 'auth/wrong-password' ||
                    firebaseError.code === 'auth/user-not-found' ||
                    firebaseError.code === 'auth/invalid-credential') {
                    showError('auth/login-error', 'Invalid email or password. Please try again.');
                    setAuthLoading(false);
                    // Use a plain object instead of Error to avoid stack traces in console
                    // This will prevent the error from showing in the console
                    return Promise.reject({
                        silent: true,
                        message: 'Invalid credentials'
                    });
                } else {
                    // Only show user-friendly error messages, no need to expose technical details
                    showError('auth/login-error', 'There was a problem signing in. Please try again.');
                }

                // If Firebase auth fails, try to find user in Firestore by email
                const firestoreUser = await getUserByEmail(email);

                if (!firestoreUser) {
                    setAuthLoading(false);
                    // User doesn't exist at all - silent rejection
                    return Promise.reject({
                        silent: true,
                        message: 'Invalid email or password'
                    });
                }

                // Verify password against stored hash
                const passwordMatches = await verifyPassword(password, firestoreUser.password);

                if (!passwordMatches) {
                    setAuthLoading(false);
                    // Password doesn't match - silent rejection
                    return Promise.reject({
                        silent: true,
                        message: 'Invalid email or password'
                    });
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
                    // Silent handling - no console logs
                    // If we can't create/signin with Firebase Auth, 
                    // but we verified credentials in Firestore, still allow login
                    const userObj = {
                        id: firestoreUser.uid,
                        email: email,
                        name: firestoreUser.name || '',
                        role: firestoreUser.role || 'user',
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
            // Only show internal errors that aren't already handled
            if (!error.silent) {
                // Use a user-friendly message instead of technical details
                showError('auth/login-error', 'There was a problem signing in. Please try again.');
            }
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
                // Silent error handling - no console logs for web or any platform
            }

            // Clear local state - this is crucial and should happen regardless of signOut success
            setUser(null);

            // Navigate to login
            router.replace('/authentication/login');
            showSuccess("Success", "You have been logged out successfully!");
        } catch (error: any) {
            // Silent error handling - no console logs
            // Even on error, we should try to clear the user state to prevent being stuck
            setUser(null);
            router.replace('/authentication/login');
        } finally {
            setAuthLoading(false);
        }
    };

    // Return context provider with authentication state and functions
    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                authLoading,
                isLoggedIn: !!user,
                isAdmin: user?.role === 'admin',
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