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
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
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

export default function SignupScreen() {
    const { theme } = useTheme();
    const { signUp, signInWithGoogle, authLoading } = useAuth();

    // Use fallback theme if the real theme is not available
    const activeTheme = theme || fallbackTheme;

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSignup = async () => {
        try {
            setError('');

            if (!name || !email || !password || !confirmPassword) {
                setError('Please fill in all fields');
                return;
            }

            if (password !== confirmPassword) {
                setError('Passwords do not match');
                return;
            }

            if (password.length < 6) {
                setError('Password must be at least 6 characters');
                return;
            }

            await signUp(email, password, name);
        } catch (error: any) {
            // Error is already handled in AuthContext
            console.error('Signup error:', error);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <View style={styles.backgroundContainer}>
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
                                    <Text style={styles.logoText}>S</Text>
                                </View>
                                <Text style={styles.appName}>Skillink</Text>
                                <Text style={styles.tagline}>Join our community of skilled professionals</Text>
                            </View>

                            <View style={styles.formContainer}>
                                <Text style={styles.welcomeBack}>Create Account</Text>
                                <Text style={styles.loginPrompt}>Please fill in your details to register</Text>

                                <View style={styles.inputContainer}>
                                    <Ionicons name="person-outline" size={20} color={activeTheme.textLight} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Full Name"
                                        placeholderTextColor={activeTheme.textLight}
                                        value={name}
                                        onChangeText={setName}
                                    />
                                </View>

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
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Ionicons name="lock-closed-outline" size={20} color={activeTheme.textLight} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Password"
                                        placeholderTextColor={activeTheme.textLight}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                        <Ionicons
                                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                                            size={20}
                                            color={activeTheme.textLight}
                                        />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.inputContainer}>
                                    <Ionicons name="lock-closed-outline" size={20} color={activeTheme.textLight} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Confirm Password"
                                        placeholderTextColor={activeTheme.textLight}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!showConfirmPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                                        <Ionicons
                                            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                            size={20}
                                            color={activeTheme.textLight}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {error ? (
                                    <Text style={styles.errorText}>{error}</Text>
                                ) : null}

                                <TouchableOpacity
                                    style={styles.signupButton}
                                    onPress={handleSignup}
                                    disabled={authLoading}
                                >
                                    {authLoading ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.signupButtonText}>SIGN UP</Text>
                                    )}
                                </TouchableOpacity>

                                <View style={styles.dividerContainer}>
                                    <View style={styles.divider} />
                                    <Text style={styles.dividerText}>OR</Text>
                                    <View style={styles.divider} />
                                </View>

                                <TouchableOpacity
                                    style={styles.googleButton}
                                    onPress={signInWithGoogle}
                                    disabled={authLoading}
                                >
                                    <View style={styles.googleIconCircle}>
                                        <Text style={{ color: '#4285F4', fontWeight: 'bold' }}>G</Text>
                                    </View>
                                    <Text style={styles.googleButtonText}>
                                        Sign up with Google
                                    </Text>
                                </TouchableOpacity>

                                <View style={styles.footer}>
                                    <Text style={styles.footerText}>
                                        Already have an account?
                                    </Text>
                                    <Link href="/authentication/login" asChild>
                                        <TouchableOpacity>
                                            <Text style={styles.loginLink}>
                                                Login
                                            </Text>
                                        </TouchableOpacity>
                                    </Link>
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
        backgroundColor: '#3366FF',
    },
    container: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 20,
        marginVertical: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    logoText: {
        fontSize: 50,
        fontWeight: 'bold',
        color: '#3366FF',
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
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 15,
        height: 55,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: '#333333',
    },
    eyeIcon: {
        padding: 10,
    },
    errorText: {
        color: '#ff3d71',
        marginBottom: 15,
        textAlign: 'center',
    },
    signupButton: {
        backgroundColor: '#3366FF',
        borderRadius: 8,
        height: 55,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    signupButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    dividerText: {
        marginHorizontal: 15,
        color: '#777777',
        fontSize: 14,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        height: 55,
        marginBottom: 25,
    },
    googleIconCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#4285F4',
    },
    googleButtonText: {
        fontSize: 16,
        color: '#333333',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#777777',
        marginRight: 5,
    },
    loginLink: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#3366FF',
    },
}); 