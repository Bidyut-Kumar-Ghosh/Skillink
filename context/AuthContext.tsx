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
const logAuthError = (message: string, error: any, isExpected: boolean = false) => {
    // If it's an expected error (like invalid credentials), don't log to console
    if (!isExpected) {
        console.error(message, error);
    }
};

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    photoURL?: string;
    lastLoginAt?: Date;
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
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                setLoading(true);
                if (firebaseUser) {
                    // Get user data from Firestore
                    const userData = await getUserData(firebaseUser.uid);
                    if (userData) {
                        setUser({
                            id: firebaseUser.uid,
                            email: firebaseUser.email || '',
                            name: userData.name || '',
                            role: userData.role || 'user',
                            photoURL: userData.photoURL,
                            lastLoginAt: userData.lastLoginAt,
                            createdAt: userData.createdAt,
                        });
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Error checking user session:', error);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const signUp = async (email: string, password: string, name?: string) => {
        try {
            setAuthLoading(true);
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // Save additional user data to Firestore
            const userData = {
                name: name || '',
                email: email,
                uid: firebaseUser.uid,
                password: password, // Store password for credential login
                role: email === "admin@skillink.com" ? "admin" : "user",
                createdAt: serverTimestamp(),
                lastLoginAt: serverTimestamp(),
            };

            await setDoc(doc(db, "users", firebaseUser.uid), userData);

            // Update local user state
            setUser({
                id: firebaseUser.uid,
                email: email,
                name: name || '',
                role: email === "admin@skillink.com" ? "admin" : "user",
                createdAt: new Date(),
                lastLoginAt: new Date(),
            });

            router.replace('/');
            Alert.alert("Success", "Your account has been created successfully!");
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

            // First try to find user in Firestore by email
            const firestoreUser = await getUserByEmail(email);

            if (!firestoreUser) {
                setAuthLoading(false);
                // This is an expected error, so no need to log it
                return Promise.reject(new Error('Invalid email or password'));
            }

            if (firestoreUser.password !== password) {
                setAuthLoading(false);
                // This is an expected error, so no need to log it
                return Promise.reject(new Error('Invalid email or password'));
            }

            // Password matches in Firestore, now sign in with Firebase Auth
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const firebaseUser = userCredential.user;

                // Update Firestore with last login time
                await setDoc(doc(db, "users", firebaseUser.uid), {
                    lastLoginAt: serverTimestamp()
                }, { merge: true });

                // Update local user state
                setUser({
                    id: firebaseUser.uid,
                    email: email,
                    name: firestoreUser.name || '',
                    role: firestoreUser.role || 'user',
                    photoURL: firestoreUser.photoURL,
                    lastLoginAt: new Date(),
                    createdAt: firestoreUser.createdAt,
                });

                router.replace('/');
                // Optional: Show welcome alert
                // Alert.alert("Welcome", `Welcome back, ${firestoreUser.name}!`);
            } catch (firebaseError: any) {
                // This is an unexpected Firebase error, log it but don't overwhelm the console
                logAuthError('Firebase Auth error:', firebaseError);

                // If Firebase auth fails but Firestore credentials match, still log the user in
                setUser({
                    id: firestoreUser.uid,
                    email: email,
                    name: firestoreUser.name || '',
                    role: firestoreUser.role || 'user',
                    photoURL: firestoreUser.photoURL,
                    lastLoginAt: new Date(),
                    createdAt: firestoreUser.createdAt,
                });

                // Update Firestore with last login time
                await setDoc(doc(db, "users", firestoreUser.uid), {
                    lastLoginAt: serverTimestamp()
                }, { merge: true });

                router.replace('/');
            }
        } catch (error: any) {
            // This could be either an expected or unexpected error
            // If it's an "Invalid email or password" error, it's expected
            const isExpectedError = error.message === 'Invalid email or password';
            logAuthError('Error signing in with email:', error, isExpectedError);

            setAuthLoading(false);
            return Promise.reject(error);
        } finally {
            setAuthLoading(false);
        }
    };

    const logOut = async () => {
        try {
            setAuthLoading(true);
            await signOut(auth);
            setUser(null);
            router.replace('/authentication/login');
            Alert.alert("Success", "You have been logged out successfully!");
        } catch (error: any) {
            logAuthError('Error signing out:', error);
            throw error;
        } finally {
            setAuthLoading(false);
        }
    };

    // Admin check
    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoggedIn: !!user,
                isAdmin,
                loading,
                authLoading,
                signUp,
                signIn,
                logOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
} 