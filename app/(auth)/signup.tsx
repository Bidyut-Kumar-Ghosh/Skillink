import React, { useState } from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
    Platform,
    TextInput,
    KeyboardAvoidingView,
    ScrollView,
    ActivityIndicator,
    Dimensions,
    SafeAreaView,
    Alert
} from 'react-native';
import { Link } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Fonts } from '@/constants/Fonts';
import ThemeToggle from '@/components/ThemeToggle';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

type SignupMethod = 'phone' | 'email';

export default function SignupScreen() {
    const { theme } = useTheme();
    const { signUpWithEmail, sendOTP, verifyOTP } = useAuth();

    const [method, setMethod] = useState<SignupMethod>('phone');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [verificationId, setVerificationId] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState('');

    const handleSendOTP = async () => {
        try {
            setError('');
            if (!phoneNumber) {
                setError('Please enter a phone number');
                return;
            }
            const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
            const vid = await sendOTP(formattedPhone);
            setVerificationId(vid);
            setOtpSent(true);
        } catch (error) {
            setError('Failed to send OTP. Please try again.');
            console.error(error);
        }
    };

    const handleVerifyOTP = async () => {
        try {
            setError('');
            if (!otp) {
                setError('Please enter the OTP');
                return;
            }
            await verifyOTP(verificationId, otp);
            router.replace('/dashboard');
        } catch (error) {
            setError('Invalid OTP. Please try again.');
            console.error(error);
        }
    };

    const handleEmailSignup = async () => {
        try {
            setError('');
            if (!email || !password) {
                setError('Please fill in all fields');
                return;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                return;
            }
            await signUpWithEmail(email, password);
            router.replace('/dashboard');
        } catch (error) {
            setError('Failed to sign up. Please try again.');
            console.error(error);
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: '#FFFFFF' }]}>
            <View style={styles.themeToggleContainer}>
                <ThemeToggle size={32} />
            </View>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={[styles.container, { backgroundColor: '#FFFFFF' }]}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <ThemedView style={styles.header}>
                        <ThemedText type="title" style={[styles.title, { color: theme.primary }]}>Join Skillink</ThemedText>
                        <ThemedText type="subtitle">Create your account to start learning</ThemedText>
                    </ThemedView>

                    <View style={styles.methodToggle}>
                        <TouchableOpacity
                            style={[
                                styles.methodButton,
                                method === 'phone' && { backgroundColor: theme.primary }
                            ]}
                            onPress={() => setMethod('phone')}
                        >
                            <ThemedText
                                style={[
                                    styles.methodButtonText,
                                    method === 'phone' && { color: theme.buttonText }
                                ]}
                            >
                                Phone
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.methodButton,
                                method === 'email' && { backgroundColor: theme.primary }
                            ]}
                            onPress={() => setMethod('email')}
                        >
                            <ThemedText
                                style={[
                                    styles.methodButtonText,
                                    method === 'email' && { color: theme.buttonText }
                                ]}
                            >
                                Email
                            </ThemedText>
                        </TouchableOpacity>
                    </View>

                    {method === 'phone' ? (
                        <>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text }]}
                                placeholder="Phone Number (with country code)"
                                placeholderTextColor={theme.textLight}
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                keyboardType="phone-pad"
                                editable={!otpSent}
                            />
                            {otpSent && (
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text }]}
                                    placeholder="Enter OTP"
                                    placeholderTextColor={theme.textLight}
                                    value={otp}
                                    onChangeText={setOtp}
                                    keyboardType="number-pad"
                                />
                            )}
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: theme.primary }]}
                                onPress={otpSent ? handleVerifyOTP : handleSendOTP}
                            >
                                <ThemedText style={[styles.buttonText, { color: theme.buttonText }]}>
                                    {otpSent ? 'Verify OTP' : 'Send OTP'}
                                </ThemedText>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text }]}
                                placeholder="Email"
                                placeholderTextColor={theme.textLight}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text }]}
                                placeholder="Password"
                                placeholderTextColor={theme.textLight}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text }]}
                                placeholder="Confirm Password"
                                placeholderTextColor={theme.textLight}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: theme.primary }]}
                                onPress={handleEmailSignup}
                            >
                                <ThemedText style={[styles.buttonText, { color: theme.buttonText }]}>
                                    Sign Up
                                </ThemedText>
                            </TouchableOpacity>
                        </>
                    )}

                    {error ? (
                        <ThemedText style={[styles.error, { color: theme.error }]}>
                            {error}
                        </ThemedText>
                    ) : null}

                    <TouchableOpacity
                        style={styles.loginLink}
                        onPress={() => router.push('/')}
                    >
                        <ThemedText style={styles.loginLinkText}>
                            Already have an account? Login
                        </ThemedText>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    themeToggleContainer: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: Fonts.sizes.title,
        marginBottom: 8,
    },
    methodToggle: {
        flexDirection: 'row',
        marginBottom: 24,
        borderRadius: 8,
        overflow: 'hidden',
    },
    methodButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    methodButtonText: {
        fontSize: 16,
    },
    input: {
        width: '100%',
        height: 48,
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
        fontSize: 16,
    },
    button: {
        width: '100%',
        height: 48,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    error: {
        marginTop: 16,
        textAlign: 'center',
    },
    loginLink: {
        marginTop: 24,
        alignItems: 'center',
    },
    loginLinkText: {
        fontSize: 16,
    },
}); 