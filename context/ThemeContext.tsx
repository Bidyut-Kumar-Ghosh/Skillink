import React, { createContext, useContext, useState } from 'react';

// Define theme colors - Use only light theme now
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

// Theme context type
type ThemeContextType = {
    theme: typeof LightTheme;
    isDarkMode: boolean; // Keep for compatibility but always false
};

// Create the context
const ThemeContext = createContext<ThemeContextType>({
    theme: LightTheme,
    isDarkMode: false,
});

// Provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Always use light theme
    const theme = LightTheme;

    return (
        <ThemeContext.Provider value={{ theme, isDarkMode: false }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext); 