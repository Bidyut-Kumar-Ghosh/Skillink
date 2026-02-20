import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ScrollView,
    Linking,
    Animated,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

function Help() {
    const { theme, isDarkMode } = useTheme();
    const [expandedItems, setExpandedItems] = useState<{ [key: number]: boolean }>({});

    const toggleExpand = (index: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedItems(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const faqData: FAQItem[] = [
        {
            category: 'Account Management',
            question: 'How do I update my profile information?',
            answer: 'Navigate to Profile → Edit Profile. You can update your name, email, phone number, bio, and profile picture. Changes are saved automatically when you tap the "Save Changes" button.',
        },
        {
            category: 'Account Management',
            question: 'How can I change my password?',
            answer: 'Go to Settings → Privacy & Security → Change Password. Enter your current password, then your new password twice to confirm. Your password must be at least 8 characters long.',
        },
        {
            category: 'Account Management',
            question: 'I forgot my password. What should I do?',
            answer: 'On the login screen, tap "Forgot Password?". Enter your registered email address, and we\'ll send you a password reset link. Follow the instructions in the email to create a new password.',
        },
        {
            category: 'Learning & Courses',
            question: 'How do I enroll in a course?',
            answer: 'Browse courses from the Learning tab, select a course you\'re interested in, and tap "Enroll Now". Some courses may require payment, while others are free. Once enrolled, the course will appear in your "My Courses" section.',
        },
        {
            category: 'Learning & Courses',
            question: 'Can I access courses offline?',
            answer: 'Yes! Premium users can download course materials and videos for offline viewing. Look for the download icon next to each lesson. Downloaded content can be accessed from the "Downloads" section.',
        },
        {
            category: 'Learning & Courses',
            question: 'How do I track my learning progress?',
            answer: 'Your dashboard displays an overview of your progress across all enrolled courses. Each course page also shows detailed progress, including completed lessons, quiz scores, and estimated time to completion.',
        },
        {
            category: 'Appearance & Settings',
            question: 'How do I switch between dark and light mode?',
            answer: 'Go to Settings → Appearance → Theme. Choose between Light Mode, Dark Mode, or System Default (which follows your device settings). The change applies immediately across the entire app.',
        },
        {
            category: 'Appearance & Settings',
            question: 'Can I customize notifications?',
            answer: 'Yes! Navigate to Settings → Notifications. You can customize which notifications you receive, including course updates, new messages, reminders, and promotional content. You can also set quiet hours.',
        },
        {
            category: 'Payments & Subscriptions',
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit/debit cards (Visa, MasterCard, American Express), UPI, net banking, and digital wallets. All payments are processed securely through encrypted channels.',
        },
        {
            category: 'Payments & Subscriptions',
            question: 'How do I cancel my subscription?',
            answer: 'Go to Profile → Purchases → Manage Subscription. Select the subscription you want to cancel and tap "Cancel Subscription". You\'ll continue to have access until the end of your billing period.',
        },
        {
            category: 'Technical Issues',
            question: 'The app is running slowly. What can I do?',
            answer: 'Try clearing the app cache (Settings → Storage → Clear Cache), closing other apps, ensuring you have a stable internet connection, and updating to the latest version of the app. Restart your device if issues persist.',
        },
        {
            category: 'Technical Issues',
            question: 'Videos won\'t play or keep buffering',
            answer: 'Check your internet connection speed. For HD video, a minimum of 5 Mbps is recommended. Try lowering the video quality in Settings → Video Quality. Clear app cache or try downloading the video for offline viewing.',
        },
    ];

    const handleEmailPress = () => {
        Linking.openURL('mailto:bidyutghoshoffice@yahoo.com');
    };

    const handlePhonePress = () => {
        Linking.openURL('tel:+916290728881');
    };

    const handleLiveChat = () => {
        // Implement live chat functionality
        console.log('Opening live chat...');
    };

    const renderFAQItem = (item: FAQItem, index: number) => {
        const isExpanded = expandedItems[index];

        return (
            <TouchableOpacity
                key={index}
                style={[
                    styles.faqCard,
                    {
                        backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
                        borderColor: isExpanded ? '#3366FF' : (isDarkMode ? '#2A2A2A' : '#E4E9F2'),
                    }
                ]}
                onPress={() => toggleExpand(index)}
                activeOpacity={0.7}
            >
                <View style={styles.faqHeader}>
                    <View style={styles.faqTitleContainer}>
                        <View style={[
                            styles.categoryBadge,
                            { backgroundColor: isDarkMode ? '#3366FF20' : '#3366FF15' }
                        ]}>
                            <Text style={styles.categoryText}>{item.category}</Text>
                        </View>
                        <Text style={[
                            styles.question,
                            { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                        ]}>
                            {item.question}
                        </Text>
                    </View>
                    <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={24}
                        color="#3366FF"
                    />
                </View>
                {isExpanded && (
                    <View style={styles.faqAnswerContainer}>
                        <View style={[
                            styles.divider,
                            { backgroundColor: isDarkMode ? '#2A2A2A' : '#E4E9F2' }
                        ]} />
                        <Text style={[
                            styles.answer,
                            { color: isDarkMode ? '#AAAAAA' : '#8F9BB3' }
                        ]}>
                            {item.answer}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[
            styles.container,
            { backgroundColor: isDarkMode ? '#000000' : '#F8F9FA' }
        ]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            {/* Premium Header */}
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
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Premium Help</Text>
                    <View style={styles.premiumBadge}>
                        <Ionicons name="star" size={12} color="#FFD700" />
                        <Text style={styles.premiumBadgeText}>PRO</Text>
                    </View>
                </View>
                <View style={styles.placeholder} />
            </View>

            <ScrollView 
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Priority Support Banner */}
                <View style={[
                    styles.priorityBanner,
                    {
                        backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
                        borderColor: '#3366FF'
                    }
                ]}>
                    <View style={styles.priorityIconContainer}>
                        <Ionicons name="flash" size={28} color="#FFD700" />
                    </View>
                    <View style={styles.priorityTextContainer}>
                        <Text style={[
                            styles.priorityTitle,
                            { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                        ]}>
                            Priority Support Active
                        </Text>
                        <Text style={[
                            styles.prioritySubtitle,
                            { color: isDarkMode ? '#AAAAAA' : '#8F9BB3' }
                        ]}>
                            Get responses within 2 hours
                        </Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={[
                    styles.section,
                    { backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }
                ]}>
                    <Text style={[
                        styles.sectionTitle,
                        { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                    ]}>
                        Quick Actions
                    </Text>

                    <View style={styles.quickActionsGrid}>
                        <TouchableOpacity
                            style={[
                                styles.quickActionCard,
                                {
                                    backgroundColor: isDarkMode ? '#1A1A1A' : '#F8F9FA',
                                }
                            ]}
                            onPress={handleLiveChat}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: '#3366FF15' }]}>
                                <Ionicons name="chatbubbles" size={24} color="#3366FF" />
                            </View>
                            <Text style={[
                                styles.quickActionText,
                                { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                            ]}>
                                Live Chat
                            </Text>
                            <View style={styles.liveIndicator}>
                                <View style={styles.liveDot} />
                                <Text style={styles.liveText}>Online</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.quickActionCard,
                                {
                                    backgroundColor: isDarkMode ? '#1A1A1A' : '#F8F9FA',
                                }
                            ]}
                            onPress={handleEmailPress}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: '#00E09615' }]}>
                                <Ionicons name="mail" size={24} color="#00E096" />
                            </View>
                            <Text style={[
                                styles.quickActionText,
                                { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                            ]}>
                                Email Us
                            </Text>
                            <Text style={[
                                styles.quickActionSubtext,
                                { color: isDarkMode ? '#666666' : '#8F9BB3' }
                            ]}>
                                2-4 hr response
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.quickActionCard,
                                {
                                    backgroundColor: isDarkMode ? '#1A1A1A' : '#F8F9FA',
                                }
                            ]}
                            onPress={handlePhonePress}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: '#FFAA0015' }]}>
                                <Ionicons name="call" size={24} color="#FFAA00" />
                            </View>
                            <Text style={[
                                styles.quickActionText,
                                { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                            ]}>
                                Call Us
                            </Text>
                            <Text style={[
                                styles.quickActionSubtext,
                                { color: isDarkMode ? '#666666' : '#8F9BB3' }
                            ]}>
                                9 AM - 5 PM
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.quickActionCard,
                                {
                                    backgroundColor: isDarkMode ? '#1A1A1A' : '#F8F9FA',
                                }
                            ]}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: '#0095FF15' }]}>
                                <Ionicons name="document-text" size={24} color="#0095FF" />
                            </View>
                            <Text style={[
                                styles.quickActionText,
                                { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                            ]}>
                                Guides
                            </Text>
                            <Text style={[
                                styles.quickActionSubtext,
                                { color: isDarkMode ? '#666666' : '#8F9BB3' }
                            ]}>
                                Learn more
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* FAQ Section */}
                <View style={[
                    styles.section,
                    { backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }
                ]}>
                    <View style={styles.sectionHeaderRow}>
                        <View style={styles.sectionHeaderLeft}>
                            <Ionicons name="help-circle" size={24} color="#3366FF" />
                            <Text style={[
                                styles.sectionTitle,
                                { color: isDarkMode ? '#FFFFFF' : '#222B45', marginLeft: 10 }
                            ]}>
                                Frequently Asked Questions
                            </Text>
                        </View>
                    </View>

                    <Text style={[
                        styles.sectionSubtitle,
                        { color: isDarkMode ? '#AAAAAA' : '#8F9BB3' }
                    ]}>
                        Find quick answers to common questions
                    </Text>

                    <View style={styles.faqList}>
                        {faqData.map((item, index) => renderFAQItem(item, index))}
                    </View>
                </View>

                {/* Contact Information */}
                <View style={[
                    styles.section,
                    { backgroundColor: isDarkMode ? '#121212' : '#FFFFFF' }
                ]}>
                    <View style={styles.sectionHeaderRow}>
                        <View style={styles.sectionHeaderLeft}>
                            <Ionicons name="headset" size={24} color="#3366FF" />
                            <Text style={[
                                styles.sectionTitle,
                                { color: isDarkMode ? '#FFFFFF' : '#222B45', marginLeft: 10 }
                            ]}>
                                Premium Support Channels
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.contactCard,
                            { backgroundColor: isDarkMode ? '#1A1A1A' : '#F8F9FA' }
                        ]}
                        onPress={handleEmailPress}
                    >
                        <View style={[styles.contactIconContainer, { backgroundColor: '#3366FF15' }]}>
                            <Ionicons name="mail" size={24} color="#3366FF" />
                        </View>
                        <View style={styles.contactInfo}>
                            <Text style={[
                                styles.contactLabel,
                                { color: isDarkMode ? '#AAAAAA' : '#8F9BB3' }
                            ]}>
                                Email Support
                            </Text>
                            <Text style={[
                                styles.contactValue,
                                { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                            ]}>
                                bidyutghoshoffice@yahoo.com
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#8F9BB3" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.contactCard,
                            { backgroundColor: isDarkMode ? '#1A1A1A' : '#F8F9FA' }
                        ]}
                        onPress={handlePhonePress}
                    >
                        <View style={[styles.contactIconContainer, { backgroundColor: '#00E09615' }]}>
                            <Ionicons name="call" size={24} color="#00E096" />
                        </View>
                        <View style={styles.contactInfo}>
                            <Text style={[
                                styles.contactLabel,
                                { color: isDarkMode ? '#AAAAAA' : '#8F9BB3' }
                            ]}>
                                Priority Phone Line
                            </Text>
                            <Text style={[
                                styles.contactValue,
                                { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                            ]}>
                                +91 6290728881
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#8F9BB3" />
                    </TouchableOpacity>

                    <View style={[
                        styles.availabilityCard,
                        { backgroundColor: isDarkMode ? '#3366FF10' : '#3366FF08' }
                    ]}>
                        <Ionicons name="time" size={20} color="#3366FF" />
                        <Text style={[
                            styles.availabilityText,
                            { color: isDarkMode ? '#FFFFFF' : '#222B45' }
                        ]}>
                            Available Monday - Friday, 9:00 AM - 5:00 PM (IST)
                        </Text>
                    </View>
                </View>

                {/* Footer Note */}
                <View style={styles.footer}>
                    <Text style={[
                        styles.footerText,
                        { color: isDarkMode ? '#666666' : '#8F9BB3' }
                    ]}>
                        Still need help? Our premium support team is here 24/7 to assist you.
                    </Text>
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
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
    },
    backButton: {
        padding: 5,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: 'Inter-SemiBold',
    },
    premiumBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFD70020',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        gap: 4,
    },
    premiumBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#FFD700',
        fontFamily: 'Inter-Bold',
    },
    placeholder: {
        width: 34,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    priorityBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 2,
        shadowColor: '#3366FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    priorityIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#3366FF15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    priorityTextContainer: {
        flex: 1,
    },
    priorityTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Inter-Bold',
        marginBottom: 4,
    },
    prioritySubtitle: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
    },
    section: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    sectionHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Inter-Bold',
    },
    sectionSubtitle: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        marginBottom: 20,
        marginTop: 4,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 4,
    },
    quickActionCard: {
        width: '48%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        minHeight: 120,
        justifyContent: 'space-between',
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionText: {
        fontSize: 15,
        fontWeight: '600',
        fontFamily: 'Inter-SemiBold',
        marginBottom: 4,
    },
    quickActionSubtext: {
        fontSize: 12,
        fontFamily: 'Inter-Regular',
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#00E096',
    },
    liveText: {
        fontSize: 11,
        color: '#00E096',
        fontFamily: 'Inter-Medium',
    },
    faqList: {
        gap: 12,
    },
    faqCard: {
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        marginBottom: 12,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    faqTitleContainer: {
        flex: 1,
        marginRight: 12,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        marginBottom: 10,
    },
    categoryText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#3366FF',
        fontFamily: 'Inter-SemiBold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    question: {
        fontSize: 15,
        fontWeight: '600',
        fontFamily: 'Inter-SemiBold',
        lineHeight: 22,
    },
    faqAnswerContainer: {
        marginTop: 12,
    },
    divider: {
        height: 1,
        marginBottom: 12,
    },
    answer: {
        fontSize: 14,
        lineHeight: 22,
        fontFamily: 'Inter-Regular',
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    contactIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contactInfo: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 12,
        fontFamily: 'Inter-Regular',
        marginBottom: 4,
    },
    contactValue: {
        fontSize: 15,
        fontWeight: '600',
        fontFamily: 'Inter-SemiBold',
    },
    availabilityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 10,
        marginTop: 8,
        gap: 10,
    },
    availabilityText: {
        fontSize: 13,
        fontFamily: 'Inter-Medium',
        flex: 1,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 20,
    },
    footerText: {
        fontSize: 13,
        textAlign: 'center',
        fontFamily: 'Inter-Regular',
        lineHeight: 20,
    },
});

export default Help; 