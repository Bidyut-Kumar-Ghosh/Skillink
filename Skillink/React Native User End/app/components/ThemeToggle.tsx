import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text, ViewStyle, Animated } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface ThemeToggleProps {
    showLabel?: boolean;
    style?: ViewStyle;
}

function ThemeToggle({ showLabel = false, style = {} }: ThemeToggleProps) {
    const { isDarkMode, toggleTheme } = useTheme();
    const [animValue] = React.useState(new Animated.Value(isDarkMode ? 1 : 0));

    React.useEffect(() => {
        Animated.timing(animValue, {
            toValue: isDarkMode ? 1 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [isDarkMode]);

    const handleToggle = () => {
        toggleTheme();
    };

    const toggleBackgroundColor = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['#F0F0F0', '#333333'],
    });

    const moveThumbTranslate = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-12, 12],
    });

    return (
        <View style={[styles.container, style]}>
            {showLabel && (
                <Text style={[styles.label, isDarkMode && styles.darkLabel]}>
                    {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </Text>
            )}
            <Animated.View
                style={[
                    styles.toggleContainer,
                    { backgroundColor: toggleBackgroundColor },
                ]}
            >
                <TouchableOpacity
                    onPress={handleToggle}
                    activeOpacity={0.8}
                    style={styles.toggleButton}
                >
                    <Animated.View
                        style={[
                            styles.toggleThumb,
                            { transform: [{ translateX: moveThumbTranslate }] },
                        ]}
                    >
                        <Ionicons
                            name={isDarkMode ? 'moon' : 'sunny'}
                            size={18}
                            color={isDarkMode ? '#FFFFFF' : '#FFA500'}
                        />
                    </Animated.View>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toggleContainer: {
        width: 60,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        padding: 2,
    },
    toggleButton: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
    },
    toggleThumb: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
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