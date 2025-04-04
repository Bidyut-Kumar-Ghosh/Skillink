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
import ProtectedRoute from './components/ProtectedRoute';

const { width } = Dimensions.get('window');

function SettingsContent() {
    const { user } = useAuth();
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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
            </ScrollView>
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
}); 