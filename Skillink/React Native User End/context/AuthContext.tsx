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
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs, FieldValue } from 'firebase/firestore/lite';
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
                photoURL: data.photoURL || '',
                createdAt: data.createdAt,
                status: data.status,
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
                status: data.status,
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

    // For Firebase auth errors, the error code will be in the format 'auth/error-type'
    // For custom errors, we'll use the error message directly
    if (!errorCode || errorCode === 'unknown-error') {
        showError('auth/error', error.message || message);
    } else {
        showError(errorCode, error.message || message);
    }
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
    status?: string;
}

interface FirestoreUser extends User {
    uid: string;
    password: string;
    status: string;
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
                // Keep the cached data for persistence only. Do not expose
                // it as the authenticated session until Firebase confirms it.
                await AsyncStorage.getItem('user');
            } catch (error) {
                console.error('Error checking persisted user:', error);
            }

            // Always verify Firebase auth state before marking the session ready.
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
                                    photoURL: userData.photoURL || '',
                                    createdAt: userData.createdAt,
                                    status: userData.status,
                                };

                                setUser(userObj);

                                // Store user in AsyncStorage for persistence
                                try {
                                    await AsyncStorage.setItem('user', JSON.stringify(userObj));
                                } catch (storageError) {
                                    console.error('Error saving user to storage:', storageError);
                                }
                            } else {
                                // User authenticated but Firestore profile is missing.
                                // This can cause permission denied errors if we keep stale local state.
                                try {
                                    await signOut(auth);
                                } catch (signOutError) {
                                    console.error('Error signing out stale auth state:', signOutError);
                                }
                                setUser(null);
                                try {
                                    await AsyncStorage.removeItem('user');
                                } catch (storageError) {
                                    console.error('Error removing stale user from storage:', storageError);
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
                status: 'active',
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
                        status: 'active'
                    };

                    await setDoc(doc(db, "users", firebaseUser.uid), newUserData);

                    // Create a user object to set the state
                    const userObj: User = {
                        id: firebaseUser.uid,
                        email: email,
                        name: '',
                        role: 'user',
                        photoURL: '',
                        createdAt: timestamp,
                        status: 'active',
                    };

                    setUser(userObj);

                    // Store in AsyncStorage for persistence
                    await AsyncStorage.setItem('user', JSON.stringify(userObj));

                    // Show success notification
                    showSuccess('auth/login-success');

                    // Navigate to home
                    router.replace('/');
                    setAuthLoading(false);
                    return;
                }

                // Check if user is suspended
                if (userData && userData.status === 'suspended') {
                    // Sign out the user since they're suspended
                    await signOut(auth);

                    // Clear any stored user data
                    await AsyncStorage.removeItem('user');
                    setUser(null);

                    // Show suspended account message
                    showError(
                        'auth/account-suspended',
                        'Your account has been suspended. Please contact Skillink Support for assistance.'
                    );
                    setAuthLoading(false);
                    return;
                }

                // User exists in Firestore, proceed with sign in
                // Create a user object with Firebase and Firestore data
                const userObj: User = {
                    id: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    name: userData.name || '',
                    role: userData.role || 'user',
                    photoURL: userData.photoURL || '',
                    createdAt: userData.createdAt,
                    status: userData.status,
                };

                setUser(userObj);

                // Store in AsyncStorage
                await AsyncStorage.setItem('user', JSON.stringify(userObj));

                // Show welcome back message
                showSuccess('auth/login-welcome-back', `Welcome back, ${userData.name || 'User'}!`);

                // Navigate to home
                router.replace('/');

            } catch (firebaseAuthError: any) {
                // Firebase Auth failed. Do not permit Firestore-only fallback login because
                // Firestore security rules require a valid authenticated session.
                throw firebaseAuthError;
            }
        } catch (error: any) {
            // This catches any errors from the outer try/catch
            logAuthError('Error signing in:', error);

            // No need to rethrow the error as it's already been handled by logAuthError
            setAuthLoading(false);
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