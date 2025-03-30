import React from 'react';
import { Stack } from 'expo-router';

function ProfileLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' }
            }}
        />
    );
}

export default ProfileLayout; 