import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ScrollView,
    TextInput,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { hashPassword, verifyPassword } from '@/utils/crypto';
import ProtectedRoute from './components/ProtectedRoute';

function ChangePasswordContent() {
    const { user } = useAuth();
    const { theme, isDarkMode } = useTheme();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false
    });

    // Validate password as user types
    React.useEffect(() => {
        setPasswordRequirements({
            length: newPassword.length >= 8,
            uppercase: /[A-Z]/.test(newPassword),
            lowercase: /[a-z]/.test(newPassword),
            number: /[0-9]/.test(newPassword)
        });
    }, [newPassword]);

    // Function to get user data from Firestore
    const getUserData = async (uid: string) => {
        try {
            const userDocRef = doc(db, 'users', uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                return userDoc.data();
            }
            return null;
        } catch (error) {
            console.error('Error retrieving user data:', error);
            return null;
        }
    };

    const changePassword = async () => {
        try {
            setIsSubmitting(true);

            if (!user || !user.id) {
                Alert.alert('Error', 'User not found');
                setIsSubmitting(false);
                return;
            }

            // Validate passwords
            if (!currentPassword) {
                Alert.alert('Error', 'Please enter your current password');
                setIsSubmitting(false);
                return;
            }

            if (!newPassword) {
                Alert.alert('Error', 'Please enter a new password');
                setIsSubmitting(false);
                return;
            }

            if (newPassword !== confirmPassword) {
                Alert.alert('Error', 'New password and confirmation do not match');
                setIsSubmitting(false);
                return;
            }

            if (newPassword.length < 8) {
                Alert.alert('Error', 'Password must be at least 8 characters long');
                setIsSubmitting(false);
                return;
            }

            // Check if new password meets requirements
            if (!passwordRequirements.uppercase || !passwordRequirements.lowercase || !passwordRequirements.number) {
                Alert.alert('Error', 'Password must include uppercase, lowercase letters and numbers');
                setIsSubmitting(false);
                return;
            }

            // Get user document to verify current password
            const userRef = doc(db, 'users', user.id);
            const firestoreUser = await getUserData(user.id);

            if (!firestoreUser) {
                Alert.alert('Error', 'User data not found');
                setIsSubmitting(false);
                return;
            }

            // Verify current password
            const passwordMatches = await verifyPassword(
                currentPassword,
                firestoreUser.password
            );

            if (!passwordMatches) {
                Alert.alert('Error', 'Current password is incorrect');
                setIsSubmitting(false);
                return;
            }

            // Hash new password
            const hashedPassword = await hashPassword(newPassword);

            // Update password in Firestore
            await updateDoc(userRef, {
                password: hashedPassword,
            });

            Alert.alert(
                'Success',
                'Password changed successfully',
                [{ text: 'OK', onPress: () => router.back() }]
            );

            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setIsSubmitting(false);
        } catch (error) {
            console.error('Error changing password:', error);
            Alert.alert('Error', 'Failed to change password');
            setIsSubmitting(false);
        }
    };

    const backgroundStyle = {
        backgroundColor: isDarkMode ? '#000000' : '#F8F9FA'
    };

    const cardStyle = {
        backgroundColor: isDarkMode ? '#121212' : '#FFFFFF'
    };

    const textStyle = {
        color: isDarkMode ? '#FFFFFF' : '#222B45'
    };

    const textLightStyle = {
        color: isDarkMode ? '#AAAAAA' : '#8F9BB3'
    };

    return (
        <SafeAreaView style={[styles.container, backgroundStyle]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <View style={[styles.header, { borderBottomColor: isDarkMode ? '#1E1E1E' : '#EDF1F7' }]}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color={textStyle.color} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, textStyle]}>Change Password</Text>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView style={styles.content}>
                    <View style={[styles.section, cardStyle]}>
                        <Text style={[styles.sectionDescription, textLightStyle]}>
                            Create a strong, unique password that's different from what you've used before.
                        </Text>

                        <View style={styles.formSection}>
                            <Text style={[styles.label, textLightStyle]}>CURRENT PASSWORD</Text>
                            <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5' }]}>
                                <TextInput
                                    style={[styles.input, textStyle]}
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    placeholder="Enter current password"
                                    placeholderTextColor={textLightStyle.color}
                                    secureTextEntry={!showCurrentPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                    <Ionicons
                                        name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={textLightStyle.color}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.formSection}>
                            <Text style={[styles.label, textLightStyle]}>NEW PASSWORD</Text>
                            <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5' }]}>
                                <TextInput
                                    style={[styles.input, textStyle]}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholder="Enter new password"
                                    placeholderTextColor={textLightStyle.color}
                                    secureTextEntry={!showNewPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowNewPassword(!showNewPassword)}
                                >
                                    <Ionicons
                                        name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={textLightStyle.color}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.passwordRequirements}>
                            <Text style={[styles.requirementsTitle, textLightStyle]}>Password must have:</Text>
                            <View style={styles.requirementItem}>
                                <Ionicons
                                    name={passwordRequirements.length ? 'checkmark-circle' : 'ellipse-outline'}
                                    size={16}
                                    color={passwordRequirements.length ? '#00E096' : textLightStyle.color}
                                />
                                <Text style={[styles.requirementText, textLightStyle]}>At least 8 characters</Text>
                            </View>
                            <View style={styles.requirementItem}>
                                <Ionicons
                                    name={passwordRequirements.uppercase ? 'checkmark-circle' : 'ellipse-outline'}
                                    size={16}
                                    color={passwordRequirements.uppercase ? '#00E096' : textLightStyle.color}
                                />
                                <Text style={[styles.requirementText, textLightStyle]}>At least one uppercase letter</Text>
                            </View>
                            <View style={styles.requirementItem}>
                                <Ionicons
                                    name={passwordRequirements.lowercase ? 'checkmark-circle' : 'ellipse-outline'}
                                    size={16}
                                    color={passwordRequirements.lowercase ? '#00E096' : textLightStyle.color}
                                />
                                <Text style={[styles.requirementText, textLightStyle]}>At least one lowercase letter</Text>
                            </View>
                            <View style={styles.requirementItem}>
                                <Ionicons
                                    name={passwordRequirements.number ? 'checkmark-circle' : 'ellipse-outline'}
                                    size={16}
                                    color={passwordRequirements.number ? '#00E096' : textLightStyle.color}
                                />
                                <Text style={[styles.requirementText, textLightStyle]}>At least one number</Text>
                            </View>
                        </View>

                        <View style={styles.formSection}>
                            <Text style={[styles.label, textLightStyle]}>CONFIRM NEW PASSWORD</Text>
                            <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5' }]}>
                                <TextInput
                                    style={[styles.input, textStyle]}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Confirm new password"
                                    placeholderTextColor={textLightStyle.color}
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <Ionicons
                                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={textLightStyle.color}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.updateButton, { backgroundColor: theme.primary }]}
                            onPress={changePassword}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.updateButtonText}>UPDATE PASSWORD</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export default function ChangePassword() {
    return (
        <ProtectedRoute>
            <ChangePasswordContent />
        </ProtectedRoute>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Inter-SemiBold',
    },
    placeholder: {
        width: 34,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    sectionDescription: {
        fontSize: 14,
        marginBottom: 25,
        fontFamily: 'Inter-Regular',
        lineHeight: 20,
    },
    formSection: {
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        marginBottom: 5,
        letterSpacing: 1,
        fontFamily: 'Inter-Medium',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderRadius: 8,
        paddingHorizontal: 15,
    },
    input: {
        flex: 1,
        fontFamily: 'Inter-Regular',
        fontSize: 16,
    },
    passwordRequirements: {
        marginBottom: 20,
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#EDF1F7',
    },
    requirementsTitle: {
        fontSize: 14,
        marginBottom: 10,
        fontFamily: 'Inter-Medium',
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    requirementText: {
        fontSize: 13,
        marginLeft: 8,
        fontFamily: 'Inter-Regular',
    },
    updateButton: {
        borderRadius: 8,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    updateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Inter-SemiBold',
    },
}); 