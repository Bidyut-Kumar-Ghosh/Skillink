import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Animated,
    Easing,
    Dimensions,
    Vibration,
    Alert,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import Toast from 'react-native-toast-message';

// Message mapping for user-friendly messages
const messages = {
    // Success notifications
    'auth/login-success': 'Welcome back! Login successful.',
    'auth/login-welcome-back': 'Welcome back!',
    'auth/register-success': 'Welcome! Account created successfully.',
    'profile/update-success': 'Profile updated successfully!',
    'password/update-success': 'Password changed successfully!',

    // Firebase auth errors
    'auth/user-not-found': 'Account not found. Need to sign up?',
    'auth/wrong-password': 'Incorrect password. Try again or reset your password.',
    'auth/email-already-in-use': 'Email already in use. Try signing in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
    'auth/api-key-not-valid': 'App configuration error. Please restart the app.',
    'auth/empty-email': 'Please enter your email address.',
    'auth/empty-password': 'Please enter your password.',
    'auth/account-suspended': 'Your account has been suspended. Please contact Skillink Support for assistance.',

    // Firebase storage errors
    'storage/unauthorized': 'You don\'t have permission to access this file.',
    'storage/canceled': 'Upload was canceled.',
    'storage/retry-limit-exceeded': 'Upload failed. Please try again.',

    // Generic error messages
    'network-error': 'Network connection lost. Please check your internet.',
    'server-error': 'Something went wrong on our servers. Try again later.',
    'default-error': 'An error occurred. Please try again.',
    'unknown-error': 'An error occurred. Please try again.',
    'auth/error': 'Authentication error. Please try again.',
};

// Notification interface for handling notifications
export interface Notification {
    id: string;  // Unique identifier for the notification
    code: string;
    message: string;
    timestamp: number;
    seen?: boolean;
    type: 'success' | 'error';
}

// Global notification handler
let globalNotificationCallback: ((notification: Notification) => void) | null = null;

// Function to generate unique ID
const generateUniqueId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Function to show a success notification
export const showSuccess = (code: string, message?: string) => {
    const finalMessage = message || messages[code as keyof typeof messages] || 'Operation successful';

    // Use Toast Message
    Toast.show({
        type: 'success',
        text1: 'Success',
        text2: finalMessage,
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
    });

    // Also use component notification if callback exists
    if (globalNotificationCallback) {
        globalNotificationCallback({
            id: generateUniqueId(),
            code,
            message: finalMessage,
            timestamp: Date.now(),
            type: 'success'
        });
    }
};

// Function to show an error notification
export const showError = (code: string, message?: string) => {
    const finalMessage = message || messages[code as keyof typeof messages] || messages['default-error'];

    // Use Toast Message
    Toast.show({
        type: 'error',
        text1: 'Error',
        text2: finalMessage,
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 50,
    });

    // Also use component notification if callback exists
    if (globalNotificationCallback) {
        globalNotificationCallback({
            id: generateUniqueId(),
            code,
            message: finalMessage,
            timestamp: Date.now(),
            type: 'error'
        });
    }
};

// Extract error code from various error types
export const getErrorCode = (error: any): string => {
    if (typeof error === 'string') {
        return error;
    }

    if (error?.code) {
        return error.code;
    }

    // Check for specific error messages that should be mapped to specific codes
    if (error?.message) {
        // Common custom error messages
        if (error.message.includes('No user found with this email')) {
            return 'auth/user-not-found';
        }
        if (error.message.includes('Incorrect email or password')) {
            return 'auth/wrong-password';
        }

        // Firebase error messages in the format 'auth/error-type'
        if (error.message.includes('auth/')) {
            const match = error.message.match(/auth\/[\w-]+/);
            if (match) return match[0];
        }
    }

    return 'unknown-error';
};

// Get user-friendly message
export const getUserFriendlyMessage = (code: string): string => {
    return (messages as Record<string, string>)[code] ||
        'Operation completed';
};

// Get icon name based on notification code and type
const getIconForNotification = (code: string, type: 'success' | 'error'): string => {
    if (type === 'success') {
        if (code.includes('login')) return 'log-in-outline';
        if (code.includes('register')) return 'person-add-outline';
        if (code.includes('profile')) return 'person-outline';
        if (code.includes('password')) return 'key-outline';
        return 'checkmark-circle-outline';
    }

    // Error icons
    if (code.includes('auth/')) {
        if (code === 'auth/network-request-failed') return 'wifi-outline';
        if (code === 'auth/too-many-requests') return 'time-outline';
        if (code === 'auth/empty-email' || code === 'auth/empty-password') return 'information-circle-outline';
        return 'shield-outline';
    }

    if (code.includes('storage/')) return 'cloud-offline-outline';
    if (code === 'network-error') return 'globe-outline';

    return 'alert-circle-outline';
};

// Main NotificationHandler component
export const NotificationHandler: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { isDarkMode } = useTheme();
    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideAnim = useState(new Animated.Value(-100))[0];
    const shakeAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        // Register the global notification callback
        globalNotificationCallback = (notification: Notification) => {
            // Mark all other notifications as seen
            setNotifications(prev => prev.map(n => ({ ...n, seen: true })));

            // Add the new notification
            setNotifications(prev => [...prev, notification]);

            // Vibration pattern for feedback (different for success vs error)
            if (notification.type === 'error') {
                Vibration.vibrate([0, 30, 10, 30]);
            } else {
                Vibration.vibrate(10);
            }

            // Auto-dismiss notifications after shorter times (1.5s for success, 2.5s for errors)
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.timestamp !== notification.timestamp));
            }, notification.type === 'success' ? 1500 : 2500);
        };

        return () => {
            globalNotificationCallback = null;
        };
    }, []);

    useEffect(() => {
        if (notifications.length > 0) {
            // Reset animations
            fadeAnim.setValue(0);
            slideAnim.setValue(-100);
            shakeAnim.setValue(0);

            // Animate in with bounce effect
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.quad),
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    friction: 6,
                    tension: 80,
                    useNativeDriver: true,
                }),
                // Add a subtle shake animation for newest error
                Animated.sequence([
                    Animated.delay(300),
                    Animated.timing(shakeAnim, {
                        toValue: 3,
                        duration: 400,
                        useNativeDriver: true,
                        easing: Easing.bezier(0.36, 0.07, 0.19, 0.97),
                    })
                ])
            ]).start();
        } else {
            // Animate out
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: -100,
                    duration: 200,
                    useNativeDriver: true,
                    easing: Easing.in(Easing.quad),
                })
            ]).start();
        }
    }, [notifications.length]);

    // Create a shake transform that oscillates between -2 and 2
    const shake = shakeAnim.interpolate({
        inputRange: [0, 1, 2, 3],
        outputRange: [0, -2, 2, 0]
    });

    const dismissNotification = (timestamp: number) => {
        setNotifications(prev => prev.filter(n => n.timestamp !== timestamp));
    };

    if (notifications.length === 0) return null;

    // Get newest notification (should be last in array)
    const newestNotification = notifications[notifications.length - 1];

    return (
        <View style={styles.container}>
            {notifications.map((notification, index) => {
                const isNewest = notification.timestamp === newestNotification.timestamp && !notification.seen;
                const isSuccess = notification.type === 'success';

                // Define theme-aware colors
                let backgroundColor, borderColor, textColor, iconColor;

                if (isSuccess) {
                    // Success notification colors
                    backgroundColor = isDarkMode
                        ? isNewest ? '#143d20' : '#0f2c16'
                        : isNewest ? '#E6F7EC' : '#EFF8F1';
                    borderColor = isDarkMode
                        ? isNewest ? '#30c060' : '#1e8040'
                        : isNewest ? '#4BB543' : '#6BCB5F';
                    textColor = isDarkMode ? '#FFF' : '#0C5C2C';
                    iconColor = isDarkMode ? '#4BB543' : '#2E8540';
                } else {
                    // Error notification colors
                    backgroundColor = isDarkMode
                        ? isNewest ? '#401a1a' : '#301212'
                        : isNewest ? '#FFE0E0' : '#FFE8E8';
                    borderColor = isDarkMode
                        ? isNewest ? '#FF6666' : '#CC5555'
                        : isNewest ? '#E88' : '#F99';
                    textColor = isDarkMode ? '#FFF' : '#600';
                    iconColor = isDarkMode ? '#FF6666' : '#CC0000';
                }

                // Get the appropriate icon
                const iconName = getIconForNotification(notification.code, notification.type);

                return (
                    <Animated.View
                        key={notification.id}
                        style={[
                            styles.notificationContainer,
                            {
                                opacity: fadeAnim,
                                transform: [
                                    { translateY: slideAnim },
                                    // Only apply shake to newest error
                                    ...(isNewest && !isSuccess ? [{ translateX: shake }] : [])
                                ],
                                backgroundColor,
                                borderColor,
                                marginBottom: index < notifications.length - 1 ? 10 : 0,
                                borderLeftWidth: isNewest ? 5 : 3,
                            }
                        ]}
                    >
                        <View style={styles.iconContainer}>
                            <Ionicons
                                name={iconName as any}
                                size={22}
                                color={iconColor}
                            />
                        </View>
                        <Text
                            style={[
                                styles.notificationText,
                                { color: textColor }
                            ]}
                        >
                            {notification.message || getUserFriendlyMessage(notification.code)}
                        </Text>
                        <TouchableOpacity
                            style={styles.dismissButton}
                            onPress={() => dismissNotification(notification.timestamp)}
                        >
                            <Ionicons
                                name="close-circle"
                                size={22}
                                color={isDarkMode ? '#AAA' : '#888'}
                            />
                        </TouchableOpacity>
                    </Animated.View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 80,
        width: '100%',
        zIndex: 1000,
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    notificationContainer: {
        width: '92%',
        minHeight: 60,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    iconContainer: {
        marginRight: 12,
    },
    notificationText: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Inter-Medium',
        lineHeight: 20,
    },
    dismissButton: {
        padding: 4,
    },
});

// Add default export to fix the conflict with NotificationHandler.js
export default NotificationHandler; 