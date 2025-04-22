import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ScrollView,
    Switch,
    Alert,
    Platform,
    Animated,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions } from 'react-native';
import ProtectedRoute from './components/ProtectedRoute';
import LogoutDialog from '@/app/components/LogoutDialog';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

function SettingsContent() {
    const { user, logOut, setUser } = useAuth();
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [name, setName] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Animation values
    const buttonScale = useRef(new Animated.Value(1)).current;

    // Initialize form fields
    useEffect(() => {
        if (user) {
            setName(user.name || '');
        }
    }, [user]);

    // Update profile info (name)
    const updateProfile = async () => {
        try {
            setIsSubmitting(true);

            if (!user || !user.id) {
                Alert.alert("Error", "User not found");
                setIsSubmitting(false);
                return;
            }

            // Check if name is empty
            if (!name.trim()) {
                Alert.alert("Error", "Name cannot be empty");
                setIsSubmitting(false);
                return;
            }

            // Prepare update data
            const updateData = {
                name: name,
            };

            // Update user's data in Firestore
            const userRef = doc(db, "users", user.id);
            await updateDoc(userRef, updateData);

            // Update local user state with the new data
            const updatedUser = {
                ...user,
                name: name,
            };

            setUser(updatedUser);

            // Update AsyncStorage
            await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

            Alert.alert("Success", "Profile updated successfully!");
            setIsSubmitting(false);
            setIsEditingName(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            Alert.alert("Error", "Failed to update profile");
            setIsSubmitting(false);
        }
    };

    // Handle logout function
    const handleLogout = async () => {
        try {
            await logOut();
            router.replace('/authentication/login');
        } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
        }
    };

    // Animation for button press
    const animateButtonPress = () => {
        Animated.sequence([
            Animated.timing(buttonScale, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(buttonScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    return (
        <SafeAreaView style={[
            styles.container,
            { backgroundColor: isDarkMode ? '#000000' : '#F8F9FA' }
        ]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <View style={[
                styles.header,
                {
                    backgroundColor: isDarkMode ? '#121212' : '#3366FF',
                    borderBottomColor: isDarkMode ? '#1E1E1E' : '#2952CC'
                }
            ]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content}>
                <View style={[
                    styles.section,
                    { backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }
                ]}>
                    <View style={[
                        styles.sectionHeader,
                        { borderBottomColor: isDarkMode ? '#1E1E1E' : '#EDF1F7' }
                    ]}>
                        <Ionicons name="color-palette" size={20} color="#3366FF" />
                        <Text style={[
                            styles.sectionTitle,
                            { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                        ]}>Theme Settings</Text>
                    </View>

                    <Text style={[
                        styles.sectionDescription,
                        { color: isDarkMode ? '#AAAAAA' : '#8F9BB3' }
                    ]}>
                        Choose your preferred theme appearance:
                    </Text>

                    <View style={styles.themeContainer}>
                        <Text style={[
                            styles.themeLabel,
                            { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                        ]}>
                            {isDarkMode ? 'Dark Mode (Pitch Black)' : 'Light Mode'}
                        </Text>
                        <Switch
                            value={isDarkMode}
                            onValueChange={toggleTheme}
                            trackColor={{ false: "#DEE2E6", true: "#3366FF" }}
                            thumbColor="#FFFFFF"
                            ios_backgroundColor={isDarkMode ? "#333333" : "#DEE2E6"}
                        />
                    </View>

                    <Text style={[
                        styles.sectionDescription,
                        styles.themeHint,
                        { color: isDarkMode ? '#AAAAAA' : '#8F9BB3' }
                    ]}>
                        {isDarkMode
                            ? 'Dark mode uses a pitch black background for better eye comfort during night study sessions.'
                            : 'Light mode provides better visibility in bright environments.'}
                    </Text>
                </View>

                <View style={[
                    styles.section,
                    { backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }
                ]}>
                    <View style={[
                        styles.sectionHeader,
                        { borderBottomColor: isDarkMode ? '#1E1E1E' : '#EDF1F7' }
                    ]}>
                        <Ionicons name="notifications" size={20} color="#3366FF" />
                        <Text style={[
                            styles.sectionTitle,
                            { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                        ]}>Notification Settings</Text>
                    </View>

                    <View style={styles.settingItem}>
                        <View>
                            <Text style={[
                                styles.settingLabel,
                                { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                            ]}>
                                Push Notifications
                            </Text>
                            <Text style={[
                                styles.settingDescription,
                                { color: isDarkMode ? '#AAAAAA' : '#8F9BB3' }
                            ]}>
                                Receive notifications about updates
                            </Text>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            trackColor={{ false: isDarkMode ? "#333333" : "#DEE2E6", true: "#3366FF" }}
                            thumbColor="#FFFFFF"
                        />
                    </View>
                </View>

                <View style={[
                    styles.section,
                    { backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }
                ]}>
                    <View style={[
                        styles.sectionHeader,
                        { borderBottomColor: isDarkMode ? '#1E1E1E' : '#EDF1F7' }
                    ]}>
                        <Ionicons name="person" size={20} color="#3366FF" />
                        <Text style={[
                            styles.sectionTitle,
                            { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                        ]}>Account Information</Text>
                    </View>

                    <View style={styles.settingItem}>
                        <View>
                            <Text style={[
                                styles.settingLabel,
                                { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                            ]}>
                                Name
                            </Text>
                            {isEditingName ? (
                                <View style={styles.nameEditContainer}>
                                    <TextInput
                                        style={[
                                            styles.nameInput,
                                            { color: isDarkMode ? '#FFFFFF' : '#333333', borderColor: isDarkMode ? '#3D435C' : '#e0e0e0' }
                                        ]}
                                        value={name}
                                        onChangeText={setName}
                                        autoFocus={true}
                                        placeholder="Enter your name"
                                        placeholderTextColor={isDarkMode ? "#8F96AB" : "#AAAAAA"}
                                    />
                                    <View style={styles.nameEditActions}>
                                        <TouchableOpacity
                                            style={[styles.nameEditButton, styles.cancelButton, { backgroundColor: isDarkMode ? '#333333' : '#EEEEEE' }]}
                                            onPress={() => {
                                                setName(user?.name || '');
                                                setIsEditingName(false);
                                            }}
                                            disabled={isSubmitting}
                                        >
                                            <Ionicons name="close" size={20} color={isDarkMode ? '#FFFFFF' : '#666666'} />
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.nameEditButton, styles.saveButton, { backgroundColor: '#3366FF' }]}
                                            onPress={updateProfile}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <ActivityIndicator size="small" color="#FFFFFF" />
                                            ) : (
                                                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.nameValueContainer}>
                                    <Text style={[
                                        styles.nameValue,
                                        { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                                    ]}>
                                        {user?.name || 'User'}
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.editNameButton}
                                        onPress={() => setIsEditingName(true)}
                                    >
                                        <Ionicons name="create-outline" size={18} color="#3366FF" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.settingItem}>
                        <View>
                            <Text style={[
                                styles.settingLabel,
                                { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                            ]}>
                                Email
                            </Text>
                            <Text style={[
                                styles.emailValue,
                                { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                            ]}>
                                {user?.email}
                            </Text>
                            <Text style={[
                                styles.settingDescription,
                                { color: isDarkMode ? '#AAAAAA' : '#8F9BB3' }
                            ]}>
                                Contact support to change your email address
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={[
                    styles.section,
                    { backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }
                ]}>
                    <View style={[
                        styles.sectionHeader,
                        { borderBottomColor: isDarkMode ? '#1E1E1E' : '#EDF1F7' }
                    ]}>
                        <Ionicons name="shield-checkmark" size={20} color="#3366FF" />
                        <Text style={[
                            styles.sectionTitle,
                            { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                        ]}>Privacy & Security</Text>
                    </View>

                    <TouchableOpacity style={[
                        styles.menuItem,
                        { borderBottomColor: isDarkMode ? '#1E1E1E' : '#EDF1F7' }
                    ]}>
                        <Text style={[
                            styles.menuItemText,
                            { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                        ]}>
                            Privacy Policy
                        </Text>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={isDarkMode ? '#AAAAAA' : '#8F9BB3'}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={[
                        styles.menuItem,
                        { borderBottomColor: isDarkMode ? '#1E1E1E' : '#EDF1F7' }
                    ]}>
                        <Text style={[
                            styles.menuItemText,
                            { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                        ]}>
                            Terms of Service
                        </Text>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={isDarkMode ? '#AAAAAA' : '#8F9BB3'}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.menuItem,
                            { borderBottomColor: isDarkMode ? '#1E1E1E' : '#EDF1F7' }
                        ]}
                        onPress={() => router.push('/change-password')}
                    >
                        <Text style={[
                            styles.menuItemText,
                            { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                        ]}>
                            Change Password
                        </Text>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={isDarkMode ? '#AAAAAA' : '#8F9BB3'}
                        />
                    </TouchableOpacity>
                </View>

                <View style={[
                    styles.section,
                    { backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }
                ]}>
                    <View style={[
                        styles.sectionHeader,
                        { borderBottomColor: isDarkMode ? '#1E1E1E' : '#EDF1F7' }
                    ]}>
                        <Ionicons name="information-circle" size={20} color="#3366FF" />
                        <Text style={[
                            styles.sectionTitle,
                            { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                        ]}>About</Text>
                    </View>

                    <TouchableOpacity style={[
                        styles.menuItem,
                        { borderBottomColor: 'transparent' }
                    ]}>
                        <Text style={[
                            styles.menuItemText,
                            { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                        ]}>
                            App Version
                        </Text>
                        <Text style={[
                            styles.versionText,
                            { color: isDarkMode ? '#AAAAAA' : '#8F9BB3' }
                        ]}>1.0.0</Text>
                    </TouchableOpacity>
                </View>

                <View style={[
                    styles.section,
                    { backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }
                ]}>
                    <View style={[
                        styles.sectionHeader,
                        { borderBottomColor: isDarkMode ? '#1E1E1E' : '#EDF1F7' }
                    ]}>
                        <Ionicons name="help-circle" size={20} color="#3366FF" />
                        <Text style={[
                            styles.sectionTitle,
                            { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                        ]}>Help & Support</Text>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.menuItem,
                            { borderBottomColor: 'transparent' }
                        ]}
                        onPress={() => router.push('/help')}
                    >
                        <Text style={[
                            styles.menuItemText,
                            { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                        ]}>
                            Help Center
                        </Text>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={isDarkMode ? '#AAAAAA' : '#8F9BB3'}
                        />
                    </TouchableOpacity>
                </View>

                <View style={[
                    styles.section,
                    { backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }
                ]}>
                    <View style={[
                        styles.sectionHeader,
                        { borderBottomColor: isDarkMode ? '#1E1E1E' : '#EDF1F7' }
                    ]}>
                        <Ionicons name="log-out" size={20} color="#FF3B30" />
                        <Text style={[
                            styles.sectionTitle,
                            { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                        ]}>Account Actions</Text>
                    </View>

                    <Animated.View
                        style={[
                            { transform: [{ scale: buttonScale }] }
                        ]}
                    >
                        <TouchableOpacity
                            style={[
                                styles.logoutButton,
                                { backgroundColor: isDarkMode ? '#1E1E1E' : '#FEE8E8' }
                            ]}
                            activeOpacity={0.7}
                            onPress={() => {
                                animateButtonPress();
                                if (Platform.OS === "web") {
                                    setShowLogoutDialog(true);
                                } else {
                                    Alert.alert("Logout", "Are you sure you want to logout?", [
                                        {
                                            text: "Cancel",
                                            style: "cancel",
                                        },
                                        {
                                            text: "Logout",
                                            onPress: handleLogout,
                                            style: "destructive",
                                        },
                                    ]);
                                }
                            }}
                        >
                            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                            <Text style={[
                                styles.logoutText,
                                { color: "#FF3B30" }
                            ]}>Logout</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>

            </ScrollView>

            <LogoutDialog
                visible={showLogoutDialog}
                onClose={() => setShowLogoutDialog(false)}
                onConfirm={handleLogout}
            />
        </SafeAreaView>
    );
}

export default function Settings() {
    return (
        <ProtectedRoute>
            <SettingsContent />
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
        color: '#FFFFFF',
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
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        paddingBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
        fontFamily: 'Inter-SemiBold',
    },
    sectionDescription: {
        fontSize: 14,
        marginBottom: 15,
        fontFamily: 'Inter-Regular',
    },
    themeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    themeLabel: {
        fontSize: 16,
        fontFamily: 'Inter-Regular',
    },
    themeHint: {
        fontStyle: 'italic',
        marginTop: 10,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    settingLabel: {
        fontSize: 16,
        fontFamily: 'Inter-Regular',
    },
    settingDescription: {
        fontSize: 14,
        marginTop: 4,
        fontFamily: 'Inter-Regular',
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    menuItemText: {
        fontSize: 16,
        fontFamily: 'Inter-Regular',
    },
    versionText: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
    },
    emailValue: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 10,
    },
    logoutText: {
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        marginLeft: 10,
    },
    nameEditContainer: {
        marginTop: 5,
        marginBottom: 5,
    },
    nameInput: {
        height: 40,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginRight: 10,
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        width: '100%',
    },
    nameEditActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    nameEditButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        marginRight: 10,
    },
    saveButton: {
        backgroundColor: '#3366FF',
    },
    nameValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    nameValue: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
    },
    editNameButton: {
        padding: 5,
    },
}); 