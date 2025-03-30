import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import Profile from './Profile';
import { Redirect } from 'expo-router';

export default function ProfilePage() {
    const { isLoggedIn, loading } = useAuth();

    // Show loading state or redirect to login if not logged in
    if (loading) {
        return <View style={containerStyle.container} />;
    }

    if (!isLoggedIn) {
        return <Redirect href="/authentication/login" />;
    }

    // If logged in, show the profile page
    return <Profile />;
}

const containerStyle = StyleSheet.create({
    container: {
        flex: 1,
    },
}); 