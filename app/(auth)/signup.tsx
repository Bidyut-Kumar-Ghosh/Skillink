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
    SafeAreaView
} from 'react-native';
import { Link } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { FacebookIcon, GithubIcon, GoogleIcon } from '@/components/SocialIcons';
import { Fonts } from '@/constants/Fonts';
import ThemeToggle from '@/components/ThemeToggle';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isTablet = width > 768;

export default function SignupScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const { theme, isDarkMode } = useTheme();

    const { isLoading, register } = useAuth();

    const handleSignup = async () => {
        // Basic validation
        if (!name || !email || !password || !confirmPassword) {
            setError('All fields are required');
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

        try {
            setError('');
            // Use the register function from AuthContext
            await register({ name, email, password });
            // Navigation is handled in the register function
        } catch (err) {
            setError('Registration failed. Please try again.');
            console.error('Signup error:', err);
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <View style={styles.themeToggleContainer}>
                <ThemeToggle size={32} />
            </View>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={[styles.container, { backgroundColor: theme.background }]}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <ThemedView style={styles.header}>
                        <ThemedText type="title" style={[styles.title, isSmallDevice && styles.smallTitle, { color: theme.primary }]}>Join Skillink</ThemedText>
                        <ThemedText type="subtitle" style={[styles.subtitle, isSmallDevice && styles.smallSubtitle]}>Create your account to start learning</ThemedText>
                    </ThemedView>

                    <ThemedView style={[styles.formContainer, isTablet && styles.tabletFormContainer, { backgroundColor: isDarkMode ? theme.cardBackground : theme.surface }]}>
                        {error ? (
                            <ThemedView style={[styles.errorContainer, { backgroundColor: isDarkMode ? 'rgba(211, 47, 47, 0.2)' : 'rgba(211, 47, 47, 0.1)' }]}>
                                <ThemedText style={[styles.errorText, isSmallDevice && styles.smallText, { color: theme.error }]}>{error}</ThemedText>
                            </ThemedView>
                        ) : null}

                        <View style={styles.inputContainer}>
                            <ThemedText style={[styles.label, isSmallDevice && styles.smallLabel]}>Full Name</ThemedText>
                            <TextInput
                                style={[styles.input, isSmallDevice && styles.smallInput,
                                {
                                    backgroundColor: isDarkMode ? theme.surface : '#fff',
                                    color: theme.text,
                                    borderColor: theme.border
                                }
                                ]}
                                placeholder="Enter your full name"
                                placeholderTextColor={theme.textLight}
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <ThemedText style={[styles.label, isSmallDevice && styles.smallLabel]}>Email</ThemedText>
                            <TextInput
                                style={[styles.input, isSmallDevice && styles.smallInput,
                                {
                                    backgroundColor: isDarkMode ? theme.surface : '#fff',
                                    color: theme.text,
                                    borderColor: theme.border
                                }
                                ]}
                                placeholder="Enter your email"
                                placeholderTextColor={theme.textLight}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <ThemedText style={[styles.label, isSmallDevice && styles.smallLabel]}>Password</ThemedText>
                            <TextInput
                                style={[styles.input, isSmallDevice && styles.smallInput,
                                {
                                    backgroundColor: isDarkMode ? theme.surface : '#fff',
                                    color: theme.text,
                                    borderColor: theme.border
                                }
                                ]}
                                placeholder="Create a password"
                                placeholderTextColor={theme.textLight}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <ThemedText style={[styles.label, isSmallDevice && styles.smallLabel]}>Confirm Password</ThemedText>
                            <TextInput
                                style={[styles.input, isSmallDevice && styles.smallInput,
                                {
                                    backgroundColor: isDarkMode ? theme.surface : '#fff',
                                    color: theme.text,
                                    borderColor: theme.border
                                }
                                ]}
                                placeholder="Confirm your password"
                                placeholderTextColor={theme.textLight}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.signupButton, isTablet && styles.tabletButton, { backgroundColor: theme.primary }]}
                            onPress={handleSignup}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={theme.buttonText} />
                            ) : (
                                <ThemedText style={[styles.signupButtonText, isSmallDevice && styles.smallButtonText, { color: theme.buttonText }]}>Create Account</ThemedText>
                            )}
                        </TouchableOpacity>

                        <View style={styles.dividerContainer}>
                            <View style={[styles.divider, { backgroundColor: theme.border }]} />
                            <ThemedText style={[styles.dividerText, { color: theme.textLight }]}>or sign up with</ThemedText>
                            <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        </View>

                        <View style={styles.socialButtonsContainer}>
                            <TouchableOpacity
                                style={[styles.socialButton, { backgroundColor: '#fff', borderColor: theme.border }]}
                                onPress={() => register({ name: 'Google User', email: 'google@example.com', password: 'password123' })}
                            >
                                <GoogleIcon size={24} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.socialButton, { backgroundColor: theme.facebook }]}
                                onPress={() => register({ name: 'Facebook User', email: 'facebook@example.com', password: 'password123' })}
                            >
                                <FacebookIcon size={24} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.socialButton, { backgroundColor: theme.github }]}
                                onPress={() => register({ name: 'GitHub User', email: 'github@example.com', password: 'password123' })}
                            >
                                <GithubIcon size={24} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.loginContainer}>
                            <ThemedText style={isSmallDevice && styles.smallText}>Already have an account?</ThemedText>
                            <Link href="/" asChild>
                                <TouchableOpacity>
                                    <ThemedText type="link" style={[styles.loginText, isSmallDevice && styles.smallText, { color: theme.primary }]}> Log in</ThemedText>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </ThemedView>
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
        padding: isSmallDevice ? 16 : 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: Fonts.sizes.title,
        marginBottom: 8,
    },
    smallTitle: {
        fontSize: 28,
    },
    subtitle: {
        textAlign: 'center',
    },
    smallSubtitle: {
        fontSize: Fonts.sizes.medium,
    },
    formContainer: {
        borderRadius: 12,
        padding: isSmallDevice ? 16 : 24,
        ...(Platform.OS === 'ios'
            ? {
                boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)'
            }
            : {
                elevation: 3
            }
        ),
    },
    tabletFormContainer: {
        width: '80%',
        alignSelf: 'center',
        maxWidth: 600,
    },
    errorContainer: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorText: {
        fontSize: Fonts.sizes.medium,
        fontFamily: Fonts.primary.medium,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: Fonts.sizes.medium,
        fontFamily: Fonts.primary.medium,
        marginBottom: 8,
    },
    smallLabel: {
        fontSize: Fonts.sizes.small,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: Fonts.sizes.medium,
        fontFamily: Fonts.primary.regular,
    },
    smallInput: {
        height: 40,
        fontSize: Fonts.sizes.small,
        paddingHorizontal: 10,
    },
    signupButton: {
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        ...(Platform.OS === 'ios'
            ? {
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)'
            }
            : {
                elevation: 2
            }
        ),
    },
    tabletButton: {
        width: '60%',
        alignSelf: 'center',
    },
    signupButtonText: {
        fontSize: Fonts.sizes.medium,
        fontFamily: Fonts.primary.semiBold,
    },
    smallButtonText: {
        fontSize: Fonts.sizes.small,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    divider: {
        height: 1,
        flex: 1,
    },
    dividerText: {
        marginHorizontal: 12,
        fontSize: Fonts.sizes.small,
        fontFamily: Fonts.primary.regular,
    },
    socialButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginBottom: 24,
    },
    socialButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        ...(Platform.OS === 'ios'
            ? {
                boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)'
            }
            : {
                elevation: 1
            }
        ),
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    loginText: {
        fontFamily: Fonts.primary.semiBold,
    },
    smallText: {
        fontSize: Fonts.sizes.small,
    },
}); 