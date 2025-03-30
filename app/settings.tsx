import React, { useState } from 'react';
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
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

function Settings() {
    const { user, isLoggedIn } = useAuth();
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const handleToggleTheme = () => {
        toggleTheme();
        Alert.alert(
            'Theme Changed',
            `Theme has been changed to ${isDarkMode ? 'Light' : 'Dark'} mode.`,
            [{ text: 'OK' }]
        );
    };

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.darkBackground]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#FFFFFF" : "#333333"} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Settings</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content}>
                <View style={[styles.section, isDarkMode && styles.darkCard]}>
                    <View style={[styles.sectionHeader, isDarkMode && styles.darkBorder]}>
                        <Ionicons name="color-palette" size={20} color={theme.primary} />
                        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Theme Settings</Text>
                    </View>

                    <Text style={[styles.sectionDescription, isDarkMode && styles.darkTextLight]}>
                        Choose your preferred theme appearance:
                    </Text>

                    <View style={styles.themeButtonsContainer}>
                        <TouchableOpacity
                            style={[
                                styles.themeButton,
                                !isDarkMode && styles.activeThemeButton
                            ]}
                            onPress={() => isDarkMode && handleToggleTheme()}
                        >
                            <Ionicons
                                name="sunny"
                                size={24}
                                color={!isDarkMode ? "#FFFFFF" : "#3366FF"}
                            />
                            <Text style={[
                                styles.themeButtonText,
                                !isDarkMode && styles.activeThemeButtonText
                            ]}>
                                Light
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.themeButton,
                                isDarkMode && styles.activeThemeButton
                            ]}
                            onPress={() => !isDarkMode && handleToggleTheme()}
                        >
                            <Ionicons
                                name="moon"
                                size={24}
                                color={isDarkMode ? "#FFFFFF" : "#3366FF"}
                            />
                            <Text style={[
                                styles.themeButtonText,
                                isDarkMode && styles.activeThemeButtonText
                            ]}>
                                Dark
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.section, isDarkMode && styles.darkCard]}>
                    <View style={[styles.sectionHeader, isDarkMode && styles.darkBorder]}>
                        <Ionicons name="notifications" size={20} color={theme.primary} />
                        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Notification Settings</Text>
                    </View>

                    <View style={styles.settingItem}>
                        <View>
                            <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>
                                Push Notifications
                            </Text>
                            <Text style={[styles.settingDescription, isDarkMode && styles.darkTextLight]}>
                                Receive notifications about updates
                            </Text>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            trackColor={{ false: "#E4E9F2", true: "#3366FF" }}
                            thumbColor="#FFFFFF"
                        />
                    </View>
                </View>

                <View style={[styles.section, isDarkMode && styles.darkCard]}>
                    <View style={[styles.sectionHeader, isDarkMode && styles.darkBorder]}>
                        <Ionicons name="shield-checkmark" size={20} color={theme.primary} />
                        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Privacy & Security</Text>
                    </View>

                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={[styles.menuItemText, isDarkMode && styles.darkText]}>
                            Privacy Policy
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color={isDarkMode ? "#8F9BB3" : "#777777"} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={[styles.menuItemText, isDarkMode && styles.darkText]}>
                            Terms of Service
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color={isDarkMode ? "#8F9BB3" : "#777777"} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={[styles.menuItemText, isDarkMode && styles.darkText]}>
                            Change Password
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color={isDarkMode ? "#8F9BB3" : "#777777"} />
                    </TouchableOpacity>
                </View>

                <View style={[styles.section, isDarkMode && styles.darkCard]}>
                    <View style={[styles.sectionHeader, isDarkMode && styles.darkBorder]}>
                        <Ionicons name="information-circle" size={20} color={theme.primary} />
                        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>About</Text>
                    </View>

                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={[styles.menuItemText, isDarkMode && styles.darkText]}>
                            App Version
                        </Text>
                        <Text style={[styles.versionText, isDarkMode && styles.darkTextLight]}>1.0.0</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    darkBackground: {
        backgroundColor: '#222B45',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    darkBorder: {
        borderBottomColor: '#323759',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333333',
    },
    placeholder: {
        width: 34,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    darkCard: {
        backgroundColor: '#1A2138',
        shadowColor: '#000',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        marginLeft: 10,
    },
    sectionDescription: {
        fontSize: 14,
        color: '#777777',
        marginBottom: 15,
    },
    darkText: {
        color: '#FFFFFF',
    },
    darkTextLight: {
        color: '#8F9BB3',
    },
    themeButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    themeButton: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        padding: 15,
        width: width / 2.5,
        borderWidth: 1,
        borderColor: '#3366FF',
    },
    themeButtonText: {
        marginTop: 10,
        fontWeight: '500',
        color: '#3366FF',
    },
    activeThemeButton: {
        backgroundColor: '#3366FF',
    },
    activeThemeButtonText: {
        color: '#FFFFFF',
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333333',
    },
    settingDescription: {
        fontSize: 14,
        color: '#777777',
        marginTop: 4,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    menuItemText: {
        fontSize: 16,
        color: '#333333',
    },
    versionText: {
        fontSize: 14,
        color: '#777777',
    },
});

export default Settings; 