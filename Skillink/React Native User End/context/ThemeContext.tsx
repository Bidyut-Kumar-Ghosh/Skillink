import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define theme types
interface ThemeColors {
    primary: string;
    primaryDark: string;
    background: string;
    cardBackground: string;
    surface: string;
    text: string;
    textLight: string;
    textMuted: string;
    buttonText: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    danger: string;
    navIconActive: string;
    navIconInactive: string;
    google: {
        background: string;
        text: string;
    };
}

// Theme context type
interface ThemeContextType {
    theme: ThemeColors;
    isDarkMode: boolean;
    toggleTheme: () => void;
}

// Light theme color palette
const lightTheme: ThemeColors = {
    primary: '#3366FF',
    primaryDark: '#2A5AE0',
    background: '#F8F9FA',
    cardBackground: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#2E3A59',
    textLight: '#8F9BB3',
    textMuted: '#6C757D',
    buttonText: '#FFFFFF',
    border: '#E4E9F2',
    error: '#FF3D71',
    success: '#00E096',
    warning: '#FFAA00',
    info: '#0095FF',
    danger: '#FF3D71',
    navIconActive: '#3366FF',
    navIconInactive: '#8F9BB3',
    google: {
        background: '#FFFFFF',
        text: '#000000',
    },
};

// Dark theme color palette
const darkTheme: ThemeColors = {
    primary: '#3366FF',
    primaryDark: '#598BFF',
    background: '#222B45',
    cardBackground: '#1A2138',
    surface: '#323759',
    text: '#EDF1F7',
    textLight: '#8F9BB3',
    textMuted: '#A0A0A0',
    buttonText: '#FFFFFF',
    border: '#323759',
    error: '#FF3D71',
    success: '#00E096',
    warning: '#FFAA00',
    info: '#0095FF',
    danger: '#FF3D71',
    navIconActive: '#3366FF',
    navIconInactive: '#8F9BB3',
    google: {
        background: '#FFFFFF',
        text: '#000000',
    },
};

// Default light theme as fallback
const defaultContext: ThemeContextType = {
    theme: lightTheme,
    isDarkMode: false,
    toggleTheme: () => { },
};

const ThemeContext = createContext<ThemeContextType>(defaultContext);

// Theme provider component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const colorScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [theme, setTheme] = useState<ThemeColors>(lightTheme);

    // Load theme preference from storage on mount
    useEffect(() => {
        const loadThemePreference = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('themePreference');
                if (savedTheme !== null) {
                    const isDark = savedTheme === 'dark';
                    setIsDarkMode(isDark);
                    setTheme(isDark ? darkTheme : lightTheme);
                } else {
                    // Use system default if no saved preference
                    const systemDark = colorScheme === 'dark';
                    setIsDarkMode(systemDark);
                    setTheme(systemDark ? darkTheme : lightTheme);
                }
            } catch (error) {
                console.error('Error loading theme preference', error);
            }
        };

        loadThemePreference();
    }, [colorScheme]);

    // Toggle theme function
    const toggleTheme = async () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        setTheme(newMode ? darkTheme : lightTheme);

        // Save preference to storage
        try {
            await AsyncStorage.setItem('themePreference', newMode ? 'dark' : 'light');
        } catch (error) {
            console.error('Error saving theme preference', error);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// Hook to use theme in components
export const useTheme = () => {
    const context = useContext(ThemeContext);
    return context;
}; 