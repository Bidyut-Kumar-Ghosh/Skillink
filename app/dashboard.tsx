import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { Fonts } from '@/constants/Fonts';
import ThemeToggle from '@/components/ThemeToggle';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

export default function DashboardScreen() {
    const { theme, isDarkMode } = useTheme();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        router.replace('/');
    };

    const enrolledCourses = [
        { id: 1, title: 'Introduction to React Native', progress: 65, totalLessons: 12, completedLessons: 8 },
        { id: 2, title: 'Advanced JavaScript Patterns', progress: 30, totalLessons: 16, completedLessons: 5 },
        { id: 3, title: 'UI/UX Design Fundamentals', progress: 10, totalLessons: 14, completedLessons: 1 }
    ];

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <ThemedText type="title" style={styles.welcomeText}>
                        Welcome{user?.name ? ', ' + user.name : ''}!
                    </ThemedText>
                    <ThemedText style={styles.subtitle}>
                        Track your learning progress
                    </ThemedText>
                </View>
                <View style={styles.themeToggleContainer}>
                    <ThemeToggle size={32} />
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
                        <ThemedText style={styles.statNumber}>3</ThemedText>
                        <ThemedText style={styles.statLabel}>Courses</ThemedText>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
                        <ThemedText style={styles.statNumber}>14</ThemedText>
                        <ThemedText style={styles.statLabel}>Hours</ThemedText>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
                        <ThemedText style={styles.statNumber}>35%</ThemedText>
                        <ThemedText style={styles.statLabel}>Overall</ThemedText>
                    </View>
                </View>

                <ThemedText type="subtitle" style={styles.sectionTitle}>
                    Your Courses
                </ThemedText>

                {enrolledCourses.map((course) => (
                    <View
                        key={course.id}
                        style={[styles.courseCard, { backgroundColor: theme.cardBackground }]}
                    >
                        <ThemedText type="defaultSemiBold" style={styles.courseTitle}>{course.title}</ThemedText>
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBarBackground}>
                                <View
                                    style={[
                                        styles.progressBar,
                                        {
                                            width: `${course.progress}%`,
                                            backgroundColor: theme.primary
                                        }
                                    ]}
                                />
                            </View>
                            <ThemedText style={styles.progressText}>
                                {course.progress}% complete ({course.completedLessons}/{course.totalLessons} lessons)
                            </ThemedText>
                        </View>
                        <TouchableOpacity
                            style={[styles.continueButton, { backgroundColor: theme.primary }]}
                            onPress={() => console.log(`Continue course ${course.id}`)}
                        >
                            <ThemedText style={[styles.buttonText, { color: theme.buttonText }]}>Continue Learning</ThemedText>
                        </TouchableOpacity>
                    </View>
                ))}

                <ThemedText type="subtitle" style={styles.sectionTitle}>
                    Recommended Next
                </ThemedText>

                <View style={[styles.recommendedCard, { backgroundColor: theme.cardBackground }]}>
                    <View style={[styles.recommendedImage, { backgroundColor: theme.border }]} />
                    <View style={styles.recommendedDetails}>
                        <ThemedText type="defaultSemiBold">Mobile App Testing Strategies</ThemedText>
                        <ThemedText style={styles.recommendedDescription}>
                            Learn best practices for testing mobile applications and ensuring quality releases.
                        </ThemedText>
                        <TouchableOpacity
                            style={[styles.enrollButton, { borderColor: theme.primary }]}
                            onPress={() => console.log('Enroll in recommended course')}
                        >
                            <ThemedText style={{ color: theme.primary }}>Enroll Now</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.navigationButtons}>
                    <TouchableOpacity
                        style={styles.navButton}
                        onPress={() => router.push('/explore')}
                    >
                        <ThemedText type="link" style={{ color: theme.primary }}>Explore Courses</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.navButton}
                        onPress={() => router.push('/')}
                    >
                        <ThemedText type="link">Home</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.logoutButton, { borderColor: theme.error }]}
                        onPress={handleLogout}
                    >
                        <ThemedText style={{ color: theme.error }}>Logout</ThemedText>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginTop: 60,
        marginBottom: 24,
    },
    welcomeText: {
        marginBottom: 4,
    },
    subtitle: {
        opacity: 0.7,
    },
    themeToggleContainer: {
        alignSelf: 'flex-start',
    },
    scrollView: {
        flex: 1,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        width: '30%',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    statNumber: {
        fontSize: 24,
        fontFamily: Fonts.primary.bold,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: Fonts.sizes.small,
        opacity: 0.7,
    },
    sectionTitle: {
        marginTop: 12,
        marginBottom: 16,
    },
    courseCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    courseTitle: {
        marginBottom: 12,
    },
    progressContainer: {
        marginBottom: 16,
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        marginBottom: 8,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: Fonts.sizes.small,
        opacity: 0.7,
    },
    continueButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        fontFamily: Fonts.primary.medium,
    },
    recommendedCard: {
        borderRadius: 12,
        marginBottom: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    recommendedImage: {
        height: 140,
        width: '100%',
    },
    recommendedDetails: {
        padding: 16,
    },
    recommendedDescription: {
        marginTop: 8,
        marginBottom: 16,
        opacity: 0.7,
    },
    enrollButton: {
        borderWidth: 1,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    navigationButtons: {
        marginTop: 8,
        marginBottom: 32,
    },
    navButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    logoutButton: {
        marginTop: 16,
        borderWidth: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
}); 