import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { ThemedText } from '@/components/ThemedText';
import { Svg, Path } from 'react-native-svg';

interface ThemeToggleProps {
    size?: number;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ size = 24 }) => {
    const { theme } = useTheme();
    // We're only using light mode now
    const isDarkMode = false;

    return (
        <TouchableOpacity
            style={[
                styles.toggleButton,
                {
                    backgroundColor: theme.background,
                    ...(Platform.OS === 'ios' || Platform.OS === 'web'
                        ? {
                            boxShadow: `0px 1px 3px ${theme.shadow}`,
                        }
                        : {
                            elevation: 2,
                        }),
                },
            ]}
            activeOpacity={0.7}
        >
            {/* Only showing light mode icon */}
            <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
                <Path
                    d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z"
                    fill="#FFC107"
                />
                <Path
                    d="M12 2V4M12 20V22M4 12H2M6.31412 6.31412L4.8999 4.8999M17.6859 6.31412L19.1001 4.8999M6.31412 17.69L4.8999 19.1042M17.6859 17.69L19.1001 19.1042M22 12H20"
                    stroke="#FFC107"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </Svg>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    toggleButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 999,
    },
});

export default ThemeToggle; 