import React, { useState, useRef } from 'react';
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

export default function LoginScreen() {
    const { theme } = useTheme();
    const { signIn, signInWithGoogle, authLoading } = useAuth();

    // Use fallback theme if the real theme is not available
    const activeTheme = theme || fallbackTheme;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    // Debounce navigation to prevent multiple clicks
    const navigateToSignup = () => {
        if (isNavigating) return;
        setIsNavigating(true);
        router.replace('/authentication/signup');
        // Reset after a delay to allow navigation to complete
        setTimeout(() => setIsNavigating(false), 1000);
    };

    const handleLogin = async () => {
        try {
            setError('');
            if (!email || !password) {
                setError('Please fill in all fields');
                return;
            }
            await signIn(email, password);
        } catch (error: any) {
            // Error is already handled in AuthContext
            console.error('Login error:', error);
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
                                <Text style={styles.tagline}>Unlock Your Potential, Connect With Skills</Text>
                            </View>

                            <View style={styles.formContainer}>
                                <Text style={styles.welcomeBack}>Welcome Back!</Text>
                                <Text style={styles.loginPrompt}>Please sign in to continue</Text>

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

                                <View style={styles.forgotPasswordContainer}>
                                    <Link href="/authentication/forgot-password" asChild>
                                        <TouchableOpacity>
                                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                                        </TouchableOpacity>
                                    </Link>
                                </View>

                                {error ? (
                                    <Text style={styles.errorText}>{error}</Text>
                                ) : null}

                                <TouchableOpacity
                                    style={styles.loginButton}
                                    onPress={handleLogin}
                                    disabled={authLoading}
                                >
                                    {authLoading ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.loginButtonText}>SIGN IN</Text>
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
                                        Sign in with Google
                                    </Text>
                                </TouchableOpacity>

                                <View style={styles.footer}>
                                    <Text style={styles.footerText}>
                                        Don't have an account?
                                    </Text>
                                    <TouchableOpacity
                                        onPress={navigateToSignup}
                                        disabled={isNavigating}
                                    >
                                        <Text style={styles.signupLink}>
                                            Sign up
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
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginBottom: 20,
    },
    forgotPasswordText: {
        color: '#3366FF',
        fontSize: 14,
    },
    errorText: {
        color: '#ff3d71',
        marginBottom: 15,
        fontSize: 14,
    },
    loginButton: {
        height: 55,
        backgroundColor: '#3366FF',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#E4E9F2',
    },
    dividerText: {
        marginHorizontal: 10,
        color: '#6c757d',
        fontSize: 14,
    },
    googleButton: {
        flexDirection: 'row',
        height: 55,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E4E9F2',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    googleIconCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    googleButtonText: {
        color: '#333333',
        fontSize: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: '#6c757d',
        marginRight: 5,
    },
    signupLink: {
        color: '#3366FF',
        fontWeight: 'bold',
    },
}); 