import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ScrollView,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

function Help() {
    const { theme, isDarkMode } = useTheme();

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
                <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Help & Support</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content}>
                <View style={[styles.section, isDarkMode && styles.darkCard]}>
                    <View style={[styles.sectionHeader, isDarkMode && styles.darkBorder]}>
                        <Ionicons name="information-circle" size={24} color={theme.primary} />
                        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Frequently Asked Questions</Text>
                    </View>

                    <View style={styles.faqItem}>
                        <Text style={[styles.question, isDarkMode && styles.darkText]}>
                            How do I update my profile?
                        </Text>
                        <Text style={[styles.answer, isDarkMode && styles.darkTextLight]}>
                            You can update your profile by tapping on "Update Profile" in the Quick Actions section of your dashboard.
                        </Text>
                    </View>

                    <View style={styles.faqItem}>
                        <Text style={[styles.question, isDarkMode && styles.darkText]}>
                            How do I change my password?
                        </Text>
                        <Text style={[styles.answer, isDarkMode && styles.darkTextLight]}>
                            You can change your password in Settings {'->'} Privacy & Security {'->'} Change Password.
                        </Text>
                    </View>

                    <View style={styles.faqItem}>
                        <Text style={[styles.question, isDarkMode && styles.darkText]}>
                            How do I switch between dark and light mode?
                        </Text>
                        <Text style={[styles.answer, isDarkMode && styles.darkTextLight]}>
                            You can change the app theme in Settings {'->'} Theme Settings.
                        </Text>
                    </View>
                </View>

                <View style={[styles.section, isDarkMode && styles.darkCard]}>
                    <View style={[styles.sectionHeader, isDarkMode && styles.darkBorder]}>
                        <Ionicons name="call" size={24} color={theme.primary} />
                        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Contact Support</Text>
                    </View>

                    <Text style={[styles.contactText, isDarkMode && styles.darkTextLight]}>
                        If you need additional help, please contact our support team:
                    </Text>

                    <View style={styles.contactItem}>
                        <Ionicons name="mail" size={20} color={isDarkMode ? "#8F9BB3" : "#777777"} />
                        <Text style={[styles.contactDetail, isDarkMode && styles.darkText]}>
                            support@skillink.com
                        </Text>
                    </View>

                    <View style={styles.contactItem}>
                        <Ionicons name="call" size={20} color={isDarkMode ? "#8F9BB3" : "#777777"} />
                        <Text style={[styles.contactDetail, isDarkMode && styles.darkText]}>
                            +1 (555) 123-4567
                        </Text>
                    </View>

                    <View style={styles.contactItem}>
                        <Ionicons name="time" size={20} color={isDarkMode ? "#8F9BB3" : "#777777"} />
                        <Text style={[styles.contactDetail, isDarkMode && styles.darkText]}>
                            Monday - Friday, 9:00 AM - 5:00 PM
                        </Text>
                    </View>
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
    darkCard: {
        backgroundColor: '#1A2138',
    },
    darkText: {
        color: '#FFFFFF',
    },
    darkTextLight: {
        color: '#8F9BB3',
    },
    darkBorder: {
        borderBottomColor: '#323759',
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
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
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
    faqItem: {
        marginBottom: 20,
    },
    question: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 8,
    },
    answer: {
        fontSize: 14,
        color: '#777777',
        lineHeight: 20,
    },
    contactText: {
        fontSize: 14,
        color: '#777777',
        marginBottom: 15,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    contactDetail: {
        fontSize: 15,
        color: '#333333',
        marginLeft: 10,
    },
});

export default Help; 