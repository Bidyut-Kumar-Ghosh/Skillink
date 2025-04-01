import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface ThemeToggleProps {
    showLabel?: boolean;
    style?: ViewStyle;
}

function ThemeToggle({ showLabel = false, style = {} }: ThemeToggleProps) {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <View style={[styles.container, style]}>
            {showLabel && (
                <Text style={[styles.label, isDarkMode && styles.darkLabel]}>
                    {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </Text>
            )}
            <TouchableOpacity
                style={[styles.toggle, isDarkMode && styles.darkToggle]}
                onPress={toggleTheme}
                activeOpacity={0.7}
            >
                <Ionicons
                    name={isDarkMode ? 'moon' : 'sunny'}
                    size={24}
                    color={isDarkMode ? '#FFFFFF' : '#3366FF'}
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toggle: {
        width: 45,
        height: 45,
        borderRadius: 23,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    darkToggle: {
        backgroundColor: '#121212',
    },
    label: {
        fontSize: 16,
        marginRight: 10,
        color: '#333333',
    },
    darkLabel: {
        color: '#FFFFFF',
    },
});

export default ThemeToggle; 