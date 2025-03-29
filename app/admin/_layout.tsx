import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';

export default function AdminLayout() {
    const { theme } = useTheme();
    const { isAdmin, isLoggedIn } = useAuth();

    // Protect admin routes
    useEffect(() => {
        if (!isLoggedIn || !isAdmin) {
            // Redirect non-admin users to login
            router.replace('/');
        }
    }, [isAdmin, isLoggedIn]);

    return (
        <>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={theme.background}
            />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: theme.background },
                }}
            >
                <Stack.Screen
                    name="index"
                    options={{
                        title: 'Admin Dashboard',
                    }}
                />
                <Stack.Screen
                    name="courses"
                    options={{
                        title: 'Manage Courses',
                    }}
                />
                <Stack.Screen
                    name="books"
                    options={{
                        title: 'Manage Books',
                    }}
                />
            </Stack>
        </>
    );
} 