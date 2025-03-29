import React from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { StatusBar } from 'react-native';

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
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <AuthProvider>
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: 'transparent' }
                    }}
                />
            </AuthProvider>
        </ThemeProvider>
    );
} 