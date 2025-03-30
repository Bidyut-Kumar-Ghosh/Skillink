import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define theme type
type ThemeType = {
    background: string;
    cardBackground: string;
    primary: string;
    secondary: string;
    text: string;
    textLight: string;
    buttonText: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    border: string;
};

// Define the light theme
const lightTheme: ThemeType = {
    background: '#FFFFFF',
    cardBackground: '#FFFFFF',
    primary: '#3366FF',
    secondary: '#8F9BB3',
    text: '#222B45',
    textLight: '#8F9BB3',
    buttonText: '#FFFFFF',
    error: '#FF3D71',
    success: '#00E096',
    warning: '#FFAA00',
    info: '#0095FF',
    border: '#EDF1F7',
};

// Update the dark theme to use pure black
const darkTheme: ThemeType = {
    background: '#000000',
    cardBackground: '#121212',
    primary: '#3366FF',
    secondary: '#8F9BB3',
    text: '#FFFFFF',
    textLight: '#E4E9F2',
    buttonText: '#FFFFFF',
    error: '#FF3D71',
    success: '#00E096',
    warning: '#FFAA00',
    info: '#0095FF',
    border: '#222222',
};

// Define Theme Context type
type ThemeContextType = {
    theme: ThemeType;
    isDarkMode: boolean;
    toggleTheme: () => void;
};

// Create context for theme
const ThemeContext = createContext<ThemeContextType>({
    theme: lightTheme,
    isDarkMode: false,
    toggleTheme: () => { },
});

// Create hook for easy theme usage
export const useTheme = () => useContext(ThemeContext);

// Define ThemeProvider props type
interface ThemeProviderProps {
    children: ReactNode;
}

// Theme provider component
export function ThemeProvider({ children }: ThemeProviderProps) {
    const colorScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Load theme preference from storage
    useEffect(() => {
        loadThemePreference();
    }, []);

    // Set initial theme based on device preference if no stored preference
    useEffect(() => {
        if (colorScheme) {
            setIsDarkMode(colorScheme === 'dark');
        }
    }, [colorScheme]);

    // Toggle between dark and light theme
    const toggleTheme = () => {
        setIsDarkMode(prevMode => {
            const newMode = !prevMode;
            saveThemePreference(newMode);
            return newMode;
        });
    };

    // Save theme preference to AsyncStorage
    const saveThemePreference = async (isDark: boolean) => {
        try {
            await AsyncStorage.setItem('isDarkMode', JSON.stringify(isDark));
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    };

    // Load theme preference from AsyncStorage
    const loadThemePreference = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('isDarkMode');
            if (savedTheme !== null) {
                setIsDarkMode(JSON.parse(savedTheme));
            }
        } catch (error) {
            console.error('Error loading theme preference:', error);
        }
    };

    // Value provided to consuming components
    const themeContextValue: ThemeContextType = {
        theme: isDarkMode ? darkTheme : lightTheme,
        isDarkMode,
        toggleTheme,
    };

    return (
        <ThemeContext.Provider value={themeContextValue}>
            {children}
        </ThemeContext.Provider>
    );
}

export default ThemeProvider; 