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
                                    status: userData.status,
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

                    // Set the user state
                    const userObj: User = {
                        id: firebaseUser.uid,
                        email: email,
                        name: '',
                        role: 'user',
                        createdAt: timestamp,
                        status: 'active',
                    };

                    setUser(userObj);

                    // Store in AsyncStorage
                    await AsyncStorage.setItem('user', JSON.stringify(userObj));

                    // Navigate to home
                    router.replace('/');
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

                // User exists and is active, set user state
                const userObj: User = {
                    id: firebaseUser.uid,
                    email: email,
                    name: userData.name || '',
                    role: userData.role || 'user',
                    photoURL: firebaseUser.photoURL || undefined,
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
                // Firebase Auth failed, try to find if user exists in Firestore
                const userByEmail = await getUserByEmail(email);

                if (!userByEmail) {
                    logAuthError('User not found in Firestore database:', { message: 'No user found with this email.' });
                    throw new Error('No user found with this email address');
                }

                // Check if user is suspended
                if (userByEmail.status === 'suspended') {
                    showError(
                        'auth/account-suspended',
                        'Your account has been suspended. Please contact Skillink Support for assistance.'
                    );
                    setAuthLoading(false);
                    return;
                }

                // Verify password match
                const passwordMatches = await verifyPassword(password, userByEmail.password);

                if (!passwordMatches) {
                    logAuthError('Invalid login credentials:', { message: 'Incorrect email or password' });
                    throw new Error('Incorrect email or password');
                }

                // Password matches
                const userObj: User = {
                    id: userByEmail.id,
                    email: userByEmail.email,
                    name: userByEmail.name || '',
                    role: userByEmail.role || 'user',
                    createdAt: userByEmail.createdAt,
                    status: userByEmail.status,
                };

                setUser(userObj);

                // Store in AsyncStorage
                await AsyncStorage.setItem('user', JSON.stringify(userObj));

                // Show welcome back message
                showSuccess('auth/login-welcome-back', `Welcome back, ${userByEmail.name || 'User'}!`);

                // Navigate to home
                router.replace('/');
            }
        } catch (error: any) {
            // This catches any errors from the outer try/catch
            logAuthError('Error signing in:', error);
            throw error;
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