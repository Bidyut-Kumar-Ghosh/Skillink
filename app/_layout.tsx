import { Stack } from 'expo-router';
import React from 'react';
import { Platform, StatusBar } from 'react-native';
import { useTheme, ThemeProvider } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { AuthProvider } from '@/context/AuthContext';
import { useFonts } from 'expo-font';

function StackLayoutContent() {
    const { theme, isDarkMode } = useTheme();

    return (
        <>
            <StatusBar
                barStyle={isDarkMode ? "light-content" : "dark-content"}
                backgroundColor={theme.background}
            />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: {
                        backgroundColor: theme.background,
                    }
                }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="dashboard" />
                <Stack.Screen name="explore" />
                <Stack.Screen name="(auth)" options={{
                    headerShown: false,
                    animation: 'fade',
                }} />
            </Stack>
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
                <StackLayoutContent />
            </AuthProvider>
        </ThemeProvider>
    );
} 