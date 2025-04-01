import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ScrollView,
    Linking,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

function Help() {
    const { theme, isDarkMode } = useTheme();

    const handleEmailPress = () => {
        Linking.openURL('mailto:bidyutghoshoffice@yahoo.com');
    };

    const handlePhonePress = () => {
        Linking.openURL('tel:+916290728881');
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
                <Text style={styles.headerTitle}>Help & Support</Text>
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
                        <Ionicons name="information-circle" size={24} color="#3366FF" />
                        <Text style={[
                            styles.sectionTitle,
                            { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                        ]}>Frequently Asked Questions</Text>
                    </View>

                    <View style={styles.faqItem}>
                        <Text style={[
                            styles.question,
                            { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                        ]}>
                            How do I update my profile?
                        </Text>
                        <Text style={[
                            styles.answer,
                            { color: isDarkMode ? '#AAAAAA' : '#8F9BB3' }
                        ]}>
                            You can update your profile by tapping on "Update Profile" in the Quick Actions section of your dashboard.
                        </Text>
                    </View>

                    <View style={styles.faqItem}>
                        <Text style={[
                            styles.question,
                            { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                        ]}>
                            How do I change my password?
                        </Text>
                        <Text style={[
                            styles.answer,
                            { color: isDarkMode ? '#AAAAAA' : '#8F9BB3' }
                        ]}>
                            You can change your password in Settings {"->"} Privacy & Security {"->"} Change Password.
                        </Text>
                    </View>

                    <View style={styles.faqItem}>
                        <Text style={[
                            styles.question,
                            { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                        ]}>
                            How do I switch between dark and light mode?
                        </Text>
                        <Text style={[
                            styles.answer,
                            { color: isDarkMode ? '#AAAAAA' : '#8F9BB3' }
                        ]}>
                            You can change the app theme in Settings {"->"} Theme Settings.
                        </Text>
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
                        <Ionicons name="call" size={24} color="#3366FF" />
                        <Text style={[
                            styles.sectionTitle,
                            { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                        ]}>Contact Support</Text>
                    </View>

                    <Text style={[
                        styles.contactText,
                        { color: isDarkMode ? '#AAAAAA' : '#8F9BB3' }
                    ]}>
                        If you need additional help, please contact our support team:
                    </Text>

                    <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
                        <Ionicons
                            name="mail"
                            size={20}
                            color={isDarkMode ? '#AAAAAA' : '#8F9BB3'}
                        />
                        <Text style={[
                            styles.contactDetail,
                            { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                        ]}>
                            bidyutghoshoffice@yahoo.com
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.contactItem} onPress={handlePhonePress}>
                        <Ionicons
                            name="call"
                            size={20}
                            color={isDarkMode ? '#AAAAAA' : '#8F9BB3'}
                        />
                        <Text style={[
                            styles.contactDetail,
                            { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                        ]}>
                            +91 6290728881,7076754831
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.contactItem}>
                        <Ionicons
                            name="time"
                            size={20}
                            color={isDarkMode ? '#AAAAAA' : '#8F9BB3'}
                        />
                        <Text style={[
                            styles.contactDetail,
                            { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                        ]}>
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
        marginBottom: 20,
        borderBottomWidth: 1,
        paddingBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
        fontFamily: 'Inter-SemiBold',
    },
    faqItem: {
        marginBottom: 20,
    },
    question: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        fontFamily: 'Inter-SemiBold',
    },
    answer: {
        fontSize: 14,
        lineHeight: 20,
        fontFamily: 'Inter-Regular',
    },
    contactText: {
        fontSize: 14,
        marginBottom: 15,
        fontFamily: 'Inter-Regular',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    contactDetail: {
        fontSize: 15,
        marginLeft: 10,
        fontFamily: 'Inter-Regular',
    },
});

export default Help; 