import React from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { StatusBar } from 'react-native';

// Layout component that will include the dynamic StatusBar
function RootLayoutNav() {
    const { isDarkMode } = useTheme();

    return (
        <>
            <StatusBar
                barStyle={isDarkMode ? "light-content" : "dark-content"}
                backgroundColor={isDarkMode ? "#000000" : "#ffffff"}
            />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: 'transparent' }
                }}
            />
        </>
    );
}

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        'Inter-Regular': require('@/assets/fonts/Inter-Regular.ttf'),
        'Inter-Medium': require('@/assets/fonts/Inter-Medium.ttf'),
        'Inter-SemiBold': require('@/assets/fonts/Inter-SemiBold.ttf'),
        'Inter-Bold': require('@/assets/fonts/Inter-Bold.ttf'),
    });

    if (!fontsLoaded) {
        return null; // Return a loading indicator if you prefer
    }

    return (
        <ThemeProvider>
            <AuthProvider>
                <RootLayoutNav />
            </AuthProvider>
        </ThemeProvider>
    );
} 