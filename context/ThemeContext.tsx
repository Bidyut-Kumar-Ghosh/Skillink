import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

// Define theme colors
export const LightTheme = {
    primary: '#6C63FF',
    primaryDark: '#5046e4',
    background: '#FFFFFF',
    cardBackground: '#FFFFFF',
    surface: '#F7F9FC',
    text: '#333333',
    textLight: '#757575',
    buttonText: '#FFFFFF',
    border: '#E0E0E0',
    error: '#D32F2F',
    success: '#28a745',
    warning: '#ffc107',
    shadow: 'rgba(0, 0, 0, 0.1)',
    facebook: '#1877F2',
    github: '#333333',
    google: {
        red: '#EA4335',
        blue: '#4285F4',
        yellow: '#FBBC05',
        green: '#34A853',
    }
};

export const DarkTheme = {
    primary: '#8C7FFF',
    primaryDark: '#6C63FF',
    background: '#121212',
    cardBackground: '#1E1E1E',
    surface: '#282828',
    text: '#F5F5F5',
    textLight: '#BBBBBB',
    buttonText: '#FFFFFF',
    border: '#444444',
    error: '#EF5350',
    success: '#4CAF50',
    warning: '#FFD54F',
    shadow: 'rgba(0, 0, 0, 0.3)',
    facebook: '#4267B2',
    github: '#2B2B2B',
    google: {
        red: '#EA4335',
        blue: '#4285F4',
        yellow: '#FBBC05',
        green: '#34A853',
    }
};

// Theme context type
type ThemeContextType = {
    theme: typeof LightTheme | typeof DarkTheme;
    isDarkMode: boolean;
    toggleTheme: () => void;
    setDarkMode: (isDark: boolean) => void;
};

// Create the context
const ThemeContext = createContext<ThemeContextType>({
    theme: LightTheme,
    isDarkMode: false,
    toggleTheme: () => { },
    setDarkMode: () => { },
});

// Provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Get the system color scheme
    const deviceColorScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState<boolean>(deviceColorScheme === 'dark');

    // Update theme when system theme changes
    useEffect(() => {
        setIsDarkMode(deviceColorScheme === 'dark');
    }, [deviceColorScheme]);

    // Toggle between light and dark themes
    const toggleTheme = () => {
        setIsDarkMode((prev) => !prev);
    };

    // Set specific theme
    const setDarkMode = (isDark: boolean) => {
        setIsDarkMode(isDark);
    };

    // Current theme object
    const theme = isDarkMode ? DarkTheme : LightTheme;

    return (
        <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, setDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext); 