import React, { useState } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
    TextInput,
    KeyboardAvoidingView,
    ScrollView,
    ActivityIndicator,
    SafeAreaView,
    Platform,
    Text,
    Image,
    Dimensions,
    Alert,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { router, Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Fallback theme for safety
const fallbackTheme = {
    background: '#f8f9fa',
    primary: '#3366FF',
    buttonText: '#ffffff',
    text: '#333333',
    textLight: '#8f9bb3',
    textMuted: '#6c757d',
    cardBackground: '#ffffff',
    error: '#ff3d71',
    border: '#e4e9f2',
};

export default function ForgotPasswordScreen() {
    const { theme } = useTheme();

    // Use fallback theme if the real theme is not available
    const activeTheme = theme || fallbackTheme;

    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    // Debounce navigation to prevent multiple clicks
    const navigateToLogin = () => {
        if (isNavigating) return;
        setIsNavigating(true);
        router.replace('/authentication/login');
        // Reset after a delay to allow navigation to complete
        setTimeout(() => setIsNavigating(false), 1000);
    };

    // Mock function for reset password - to be replaced with Firebase
    const handleResetPassword = async () => {
        try {
            setError('');
            setLoading(true);

            if (!email) {
                setError('Please enter your email address');
                setLoading(false);
                return;
            }

            // Email validation regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setError('Please enter a valid email address');
                setLoading(false);
                return;
            }

            // TODO: Replace with actual Firebase implementation
            // Simulate API call
            setTimeout(() => {
                setLoading(false);
                setResetSent(true);
                Alert.alert(
                    "Password Reset Email Sent",
                    "Check your email for instructions to reset your password."
                );
            }, 1500);

        } catch (error: any) {
            setLoading(false);
            setError(error.message || 'Failed to send reset email. Please try again.');
            console.error('Reset password error:', error);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <View style={styles.backgroundContainer}>
                <Image
                    source={require('@/assets/images/landing.png')}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                />
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.overlay}>
                            <View style={styles.logoContainer}>
                                <View style={styles.logoCircle}>
                                    <Image
                                        source={require('@/assets/images/logo.png')}
                                        style={styles.logoImage}
                                        resizeMode="contain"
                                    />
                                </View>
                                <Text style={styles.appName}>Skillink</Text>
                                <Text style={styles.tagline}>Password Recovery</Text>
                            </View>

                            <View style={styles.formContainer}>
                                <Text style={styles.welcomeBack}>Forgot Password?</Text>
                                <Text style={styles.loginPrompt}>
                                    Enter your email address and we'll send you instructions to reset your password
                                </Text>

                                <View style={styles.inputContainer}>
                                    <Ionicons name="mail-outline" size={20} color={activeTheme.textLight} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email"
                                        placeholderTextColor={activeTheme.textLight}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        editable={!resetSent}
                                    />
                                </View>

                                {error ? (
                                    <Text style={styles.errorText}>{error}</Text>
                                ) : null}

                                {resetSent ? (
                                    <View style={styles.sentContainer}>
                                        <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
                                        <Text style={styles.sentText}>
                                            Password reset email sent!
                                        </Text>
                                        <Text style={styles.sentSubText}>
                                            Check your inbox for further instructions
                                        </Text>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.resetButton}
                                        onPress={handleResetPassword}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#FFFFFF" />
                                        ) : (
                                            <Text style={styles.resetButtonText}>RESET PASSWORD</Text>
                                        )}
                                    </TouchableOpacity>
                                )}

                                <View style={styles.footer}>
                                    <TouchableOpacity
                                        style={styles.backButton}
                                        onPress={navigateToLogin}
                                        disabled={isNavigating}
                                    >
                                        <Ionicons name="arrow-back" size={20} color={activeTheme.primary} />
                                        <Text style={styles.backText}>
                                            Back to Login
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    backgroundContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    backgroundImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    overlay: {
        flex: 1,
        borderRadius: 20,
        padding: 20,
        marginVertical: 40,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        overflow: 'hidden',
    },
    logoImage: {
        width: 70,
        height: 70,
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    tagline: {
        fontSize: 14,
        color: '#E0E0E0',
        textAlign: 'center',
    },
    formContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    welcomeBack: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 8,
    },
    loginPrompt: {
        fontSize: 14,
        color: '#777777',
        marginBottom: 25,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E4E9F2',
        borderRadius: 10,
        marginBottom: 15,
        height: 55,
        paddingHorizontal: 15,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: '100%',
        color: '#333333',
        fontSize: 16,
    },
    eyeIcon: {
        padding: 10,
    },
    errorText: {
        color: '#ff3d71',
        marginBottom: 15,
        fontSize: 14,
    },
    resetButton: {
        height: 55,
        backgroundColor: '#3366FF',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    resetButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    backText: {
        color: '#3366FF',
        fontWeight: 'bold',
        marginLeft: 5,
    },
    sentContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    sentText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        marginTop: 15,
        marginBottom: 5,
    },
    sentSubText: {
        fontSize: 14,
        color: '#777777',
        textAlign: 'center',
        marginBottom: 20,
    },
}); 