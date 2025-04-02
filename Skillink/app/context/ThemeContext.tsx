import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useColorScheme, Platform, Appearance } from 'react-native';
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
    background: '#F8F9FA',
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
    textLight: '#AAAAAA',
    buttonText: '#FFFFFF',
    error: '#FF3D71',
    success: '#00E096',
    warning: '#FFAA00',
    info: '#0095FF',
    border: '#1E1E1E',
};

// Define Theme Context type
type ThemeContextType = {
    theme: ThemeType;
    isDarkMode: boolean;
    toggleTheme: () => void;
    followDeviceTheme: boolean;
    setFollowDeviceTheme: (follow: boolean) => void;
};

// Create context for theme
const ThemeContext = createContext<ThemeContextType>({
    theme: lightTheme,
    isDarkMode: false,
    toggleTheme: () => { },
    followDeviceTheme: true,
    setFollowDeviceTheme: () => { }
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
    const [followDeviceTheme, setFollowDeviceTheme] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);

    // Function to get current device theme
    const getDeviceTheme = () => {
        // Use Appearance API as fallback for web
        if (Platform.OS === 'web') {
            return Appearance.getColorScheme() === 'dark';
        }
        return colorScheme === 'dark';
    };

    // Load theme preference from storage
    useEffect(() => {
        const loadThemePreference = async () => {
            try {
                // Load follow device preference first
                const followDevice = await AsyncStorage.getItem('followDeviceTheme');
                const shouldFollowDevice = followDevice === null ? true : JSON.parse(followDevice);
                setFollowDeviceTheme(shouldFollowDevice);

                // Then load manual theme preference
                const savedTheme = await AsyncStorage.getItem('isDarkMode');

                if (shouldFollowDevice) {
                    // If following device theme, use system preference
                    setIsDarkMode(getDeviceTheme());
                } else if (savedTheme !== null) {
                    // Otherwise use saved preference
                    setIsDarkMode(JSON.parse(savedTheme));
                } else {
                    // Default to device theme if no preference is saved
                    setIsDarkMode(getDeviceTheme());
                }

                setIsInitialized(true);
            } catch (error) {
                console.error('Error loading theme preference:', error);
                // Default to device theme if there's an error
                setIsDarkMode(getDeviceTheme());
                setIsInitialized(true);
            }
        };

        loadThemePreference();
    }, []);

    // Listen for device theme changes when following device theme
    useEffect(() => {
        if (!isInitialized) return;

        if (followDeviceTheme) {
            const subscription = Appearance.addChangeListener(({ colorScheme }) => {
                setIsDarkMode(colorScheme === 'dark');
            });

            return () => {
                subscription.remove();
            };
        }
    }, [followDeviceTheme, isInitialized]);

    // Toggle between dark and light theme
    const toggleTheme = () => {
        setIsDarkMode(prevMode => {
            const newMode = !prevMode;
            saveThemePreference(newMode);

            // When manually toggling, stop following device theme
            if (followDeviceTheme) {
                setFollowDeviceTheme(false);
                saveFollowDevicePreference(false);
            }

            return newMode;
        });
    };

    // Set whether to follow device theme
    const handleSetFollowDeviceTheme = (follow: boolean) => {
        setFollowDeviceTheme(follow);
        saveFollowDevicePreference(follow);

        if (follow) {
            // Update to match device immediately when enabling follow device
            setIsDarkMode(getDeviceTheme());
        }
    };

    // Save theme preference to AsyncStorage
    const saveThemePreference = async (isDark: boolean) => {
        try {
            await AsyncStorage.setItem('isDarkMode', JSON.stringify(isDark));
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    };

    // Save follow device preference to AsyncStorage
    const saveFollowDevicePreference = async (follow: boolean) => {
        try {
            await AsyncStorage.setItem('followDeviceTheme', JSON.stringify(follow));
        } catch (error) {
            console.error('Error saving follow device preference:', error);
        }
    };

    // Value provided to consuming components
    const themeContextValue: ThemeContextType = {
        theme: isDarkMode ? darkTheme : lightTheme,
        isDarkMode,
        toggleTheme,
        followDeviceTheme,
        setFollowDeviceTheme: handleSetFollowDeviceTheme
    };

    return (
        <ThemeContext.Provider value={themeContextValue}>
            {children}
        </ThemeContext.Provider>
    );
}

export default ThemeProvider; 