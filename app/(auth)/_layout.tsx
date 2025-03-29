import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export default function AuthLayout() {
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
                    contentStyle: { backgroundColor: theme.background },
                    animation: 'slide_from_right',
                    presentation: 'card',
                }}>
                <Stack.Screen
                    name="signup"
                    options={{
                        title: 'Sign Up',
                        headerShown: false,
                    }}
                />
            </Stack>
        </>
    );
} 