import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { Fonts } from '@/constants/Fonts';
import ThemeToggle from '@/components/ThemeToggle';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

// Suggested books data
const suggestedBooks = [
    {
        id: '1',
        title: 'React Native in Action',
        author: 'Nader Dabit',
        price: '$39.99',
        rating: 4.5,
        description: 'A practical guide to building React Native applications',
    },
    {
        id: '2',
        title: 'JavaScript: The Good Parts',
        author: 'Douglas Crockford',
        price: '$29.99',
        rating: 4.8,
        description: 'A guide to JavaScript best practices and patterns',
    },
    {
        id: '3',
        title: 'Eloquent JavaScript',
        author: 'Marijn Haverbeke',
        price: '$34.99',
        rating: 4.7,
        description: 'A modern introduction to programming with JavaScript',
    }
];

// Course data
const enrolledCourses = [
    {
        id: 1,
        title: 'Introduction to React Native',
        progress: 65,
        totalLessons: 12,
        completedLessons: 8,
        relatedBooks: ['React Native in Action', 'Learning React Native']
    },
    {
        id: 2,
        title: 'Advanced JavaScript Patterns',
        progress: 30,
        totalLessons: 16,
        completedLessons: 5,
        relatedBooks: ['JavaScript: The Good Parts', 'Eloquent JavaScript']
    },
    {
        id: 3,
        title: 'UI/UX Design Fundamentals',
        progress: 10,
        totalLessons: 14,
        completedLessons: 1,
        relatedBooks: []
    }
];

// Sample data - replace with actual data from your backend
const sampleCourses = [
    { id: 1, title: 'Introduction to Programming', progress: 30 },
    { id: 2, title: 'Web Development Basics', progress: 45 },
    { id: 3, title: 'Data Structures', progress: 15 },
];

const sampleBooks = [
    { id: 1, title: 'JavaScript: The Good Parts', author: 'Douglas Crockford' },
    { id: 2, title: 'Clean Code', author: 'Robert C. Martin' },
    { id: 3, title: 'Design Patterns', author: 'Gang of Four' },
];

export default function DashboardScreen() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'courses' | 'books'>('courses');

    const navigateToCourse = (courseId: number) => {
        router.push('/');  // Replace with actual course route when available
    };

    const navigateToBook = (bookId: number) => {
        router.push('/');  // Replace with actual book route when available
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <ThemedView style={styles.header}>
                    <ThemedText type="title">Welcome back!</ThemedText>
                    <ThemedText type="subtitle" style={styles.name}>
                        {user?.name || 'Student'}
                    </ThemedText>
                </ThemedView>

                <ThemedView style={styles.section}>
                    <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                        Your Courses
                    </ThemedText>
                    {sampleCourses.map(course => (
                        <TouchableOpacity
                            key={course.id}
                            style={[styles.card, { backgroundColor: theme.cardBackground }]}
                            onPress={() => navigateToCourse(course.id)}
                        >
                            <ThemedText type="defaultSemiBold">{course.title}</ThemedText>
                            <ThemedText type="subtitle">Progress: {course.progress}%</ThemedText>
                        </TouchableOpacity>
                    ))}
                </ThemedView>

                <ThemedView style={styles.section}>
                    <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                        Your Books
                    </ThemedText>
                    {sampleBooks.map(book => (
                        <TouchableOpacity
                            key={book.id}
                            style={[styles.card, { backgroundColor: theme.cardBackground }]}
                            onPress={() => navigateToBook(book.id)}
                        >
                            <ThemedText type="defaultSemiBold">{book.title}</ThemedText>
                            <ThemedText type="subtitle">By {book.author}</ThemedText>
                        </TouchableOpacity>
                    ))}
                </ThemedView>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        padding: 20,
        marginBottom: 20,
    },
    name: {
        marginTop: 8,
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        marginBottom: 16,
    },
    card: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    welcomeText: {
        marginBottom: 4,
    },
    subtitle: {
        opacity: 0.7,
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
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
    footer: {
        marginTop: 24,
        marginBottom: 24,
        alignItems: 'center',
    },
    logoutButton: {
        borderWidth: 1,
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
    },
    bookIntro: {
        marginBottom: 16,
        lineHeight: 22,
    },
    bookCard: {
        borderRadius: 12,
        marginBottom: 16,
        flexDirection: 'row',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    bookImageContainer: {
        width: 100,
        height: 180,
    },
    bookImagePlaceholder: {
        width: '100%',
        height: '100%',
    },
    bookInfo: {
        flex: 1,
        padding: 12,
    },
    bookTitle: {
        fontSize: Fonts.sizes.large,
        marginBottom: 4,
    },
    bookAuthor: {
        fontSize: Fonts.sizes.small,
        marginBottom: 8,
        opacity: 0.7,
    },
    bookDescription: {
        fontSize: Fonts.sizes.small,
        lineHeight: 20,
        marginBottom: 12,
    },
    bookPriceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    bookRating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bookPrice: {
        fontSize: Fonts.sizes.medium,
    },
    buyButton: {
        borderWidth: 1,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    infoCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    infoTitle: {
        fontFamily: Fonts.primary.semiBold,
        fontSize: Fonts.sizes.medium,
        marginBottom: 8,
    },
    infoText: {
        lineHeight: 22,
    },
    relatedBooksContainer: {
        backgroundColor: '#F5F5F5',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    relatedBooksTitle: {
        marginBottom: 8,
    },
    relatedBook: {
        marginLeft: 8,
        marginBottom: 4,
    },
}); 