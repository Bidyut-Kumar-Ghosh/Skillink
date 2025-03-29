import React, { createContext, useState, useContext, ReactNode } from 'react';
import { router } from 'expo-router';

// Define user type
type User = {
    id: string;
    name: string;
    email: string;
    provider: string;
    avatar?: string;
};

// Define signup data type
type SignupData = {
    name: string;
    email: string;
    password: string;
};

// Define context type
type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    login: (provider: string) => Promise<void>;
    logout: () => void;
    isLoggedIn: boolean;
    register: (data: SignupData) => Promise<void>;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: false,
    login: async () => { },
    logout: () => { },
    isLoggedIn: false,
    register: async () => { },
});

// Auth provider props type
type AuthProviderProps = {
    children: ReactNode;
};

// Auth provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Mock login function - would connect to real auth providers in production
    const login = async (provider: string) => {
        setIsLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock user data based on provider
            const mockUser: User = {
                id: `user-${Math.floor(Math.random() * 10000)}`,
                name: `Test User (${provider})`,
                email: `user@${provider.toLowerCase()}.com`,
                provider: provider,
                avatar: provider === 'GitHub' ? 'https://github.com/identicons/app/to/image.png' : undefined,
            };

            setUser(mockUser);
            console.log(`Logged in with ${provider}`, mockUser);

            // Navigate to dashboard after successful login
            router.replace('/dashboard');
        } catch (error) {
            console.error(`Login with ${provider} failed:`, error);
        } finally {
            setIsLoading(false);
        }
    };

    // Register function for signup
    const register = async (data: SignupData) => {
        setIsLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Create user from signup data
            const newUser: User = {
                id: `user-${Math.floor(Math.random() * 10000)}`,
                name: data.name,
                email: data.email,
                provider: 'Email',
            };

            setUser(newUser);
            console.log('Registered new user:', newUser);

            // Navigate to dashboard after successful registration
            router.replace('/dashboard');
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Logout function
    const logout = () => {
        setUser(null);
        // Navigate back to home page
        router.replace('/');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                login,
                logout,
                isLoggedIn: !!user,
                register,
            }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext); 