import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from './ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Replace with actual Firebase implementation
// Mock functions to be replaced with Firebase
const getUserData = async () => {
    try {
        const storedUser = await AsyncStorage.getItem('userData');
        return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        console.error('Error retrieving user data:', error);
        return null;
    }
};

// Mock Google authentication for development
const mockGoogleAuth = async () => {
    // Return a mock Google user
    return {
        email: 'google@example.com',
        name: 'Google User',
        googleId: 'google123',
        photoURL: 'https://via.placeholder.com/150',
    };
};

// Mock authentication functions - to be replaced with Firebase
const registerWithEmail = async (email: string, password: string, name: string = '') => {
    // TODO: Replace with Firebase implementation
    const userData = {
        id: Date.now().toString(),
        email,
        name,
        role: email === "admin@skillink.com" ? "admin" : "user",
        createdAt: new Date(),
        lastLoginAt: new Date(),
    };
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    return userData;
};

const loginWithEmail = async (email: string, password: string) => {
    // TODO: Replace with Firebase implementation
    const userData = {
        id: Date.now().toString(),
        email,
        name: 'Test User',
        role: email === "admin@skillink.com" ? "admin" : "user",
        createdAt: new Date(),
        lastLoginAt: new Date(),
    };
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    return userData;
};

const loginWithGoogle = async (googleUser: any) => {
    // TODO: Replace with Firebase implementation
    const userData = {
        id: Date.now().toString(),
        email: googleUser.email,
        name: googleUser.name,
        role: googleUser.email === "admin@skillink.com" ? "admin" : "user",
        photoURL: googleUser.photoURL,
        createdAt: new Date(),
        lastLoginAt: new Date(),
    };
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    return userData;
};

const logout = async () => {
    // TODO: Replace with Firebase implementation
    await AsyncStorage.removeItem('userData');
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
    signInWithGoogle: () => Promise<void>;
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
        const checkUserLoggedIn = async () => {
            try {
                setLoading(true);
                const userData = await getUserData();
                if (userData) {
                    setUser(userData);
                }
            } catch (error) {
                console.error('Error checking user session:', error);
            } finally {
                setLoading(false);
            }
        };

        checkUserLoggedIn();
    }, []);

    const signUp = async (email: string, password: string, name?: string) => {
        try {
            setAuthLoading(true);
            const userData = await registerWithEmail(email, password, name || '');
            setUser(userData);
            router.replace('/');
            Alert.alert("Success", "Your account has been created successfully!");
        } catch (error: any) {
            console.error('Error signing up with email:', error);
            Alert.alert("Error", error.message || 'Failed to sign up. Please try again.');
            throw error;
        } finally {
            setAuthLoading(false);
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            setAuthLoading(true);
            const userData = await loginWithEmail(email, password);
            setUser(userData);
            router.replace('/');
            Alert.alert("Success", "You have been logged in successfully!");
        } catch (error: any) {
            console.error('Error signing in with email:', error);
            Alert.alert("Error", error.message || 'Failed to sign in. Please check your credentials.');
            throw error;
        } finally {
            setAuthLoading(false);
        }
    };

    const signInWithGoogle = async () => {
        try {
            setAuthLoading(true);
            // In a real app, we would use Google auth
            // For this mock, we'll just simulate a Google login
            const googleUser = await mockGoogleAuth();
            const userData = await loginWithGoogle(googleUser);
            setUser(userData);
            router.replace('/');
        } catch (error: any) {
            console.error('Error with Google sign-in:', error);
            Alert.alert("Error", error.message || 'Failed to sign in with Google. Please try again.');
        } finally {
            setAuthLoading(false);
        }
    };

    const logOut = async () => {
        try {
            setAuthLoading(true);
            await logout();
            setUser(null);
            router.replace('/authentication/login');
            Alert.alert("Success", "You have been logged out successfully!");
        } catch (error: any) {
            console.error('Error signing out:', error);
            Alert.alert("Error", "Failed to log out. Please try again.");
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
                signInWithGoogle,
                logOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
} 