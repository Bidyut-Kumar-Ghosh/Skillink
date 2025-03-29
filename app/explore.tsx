import React from 'react';
import { StyleSheet, View, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import { Fonts } from '@/constants/Fonts';
import ThemeToggle from '@/components/ThemeToggle';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const ExploreScreen = () => {
    const { theme } = useTheme();

    const categories = [
        { id: 1, title: 'Programming', courses: 156 },
        { id: 2, title: 'Design', courses: 98 },
        { id: 3, title: 'Business', courses: 204 },
        { id: 4, title: 'Marketing', courses: 142 },
        { id: 5, title: 'Photography', courses: 87 },
        { id: 6, title: 'Music', courses: 63 }
    ];

    return (
        <ThemedView style={styles.container}>
            <View style={styles.themeToggleContainer}>
                <ThemeToggle size={32} />
            </View>

            <View style={styles.header}>
                <ThemedText type="title" style={{ color: theme.primary }}>Explore</ThemedText>
                <TouchableOpacity onPress={() => router.back()}>
                    <ThemedText type="link">Back to Home</ThemedText>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                    Discover Categories
                </ThemedText>

                <View style={styles.categoriesContainer}>
                    {categories.map(category => (
                        <TouchableOpacity
                            key={category.id}
                            style={[styles.categoryCard, { backgroundColor: theme.cardBackground }]}
                            onPress={() => console.log(`Selected category: ${category.title}`)}
                        >
                            <ThemedText type="defaultSemiBold">{category.title}</ThemedText>
                            <ThemedText style={styles.courseCount}>{category.courses} courses</ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>

                <ThemedText type="subtitle" style={styles.sectionTitle}>
                    Popular Courses
                </ThemedText>

                <View style={styles.coursesList}>
                    {[1, 2, 3].map(id => (
                        <ThemedView
                            key={id}
                            style={[styles.courseCard, { backgroundColor: theme.cardBackground }]}
                        >
                            <View style={[styles.courseImage, { backgroundColor: theme.border }]} />
                            <View style={styles.courseInfo}>
                                <ThemedText type="defaultSemiBold">Course Title #{id}</ThemedText>
                                <ThemedText style={styles.courseDescription}>
                                    A brief description of this amazing course that will help you learn new skills.
                                </ThemedText>
                                <View style={styles.courseStats}>
                                    <ThemedText style={styles.courseRating}>⭐ 4.8</ThemedText>
                                    <ThemedText style={styles.courseDuration}>8 hours</ThemedText>
                                </View>
                            </View>
                        </ThemedView>
                    ))}
                </View>
            </ScrollView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    themeToggleContainer: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 10,
    },
    header: {
        marginTop: 60,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        marginTop: 24,
        marginBottom: 16,
    },
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryCard: {
        width: '48%',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    courseCount: {
        marginTop: 8,
        opacity: 0.7,
        fontSize: Fonts.sizes.small,
    },
    coursesList: {
        marginBottom: 40,
    },
    courseCard: {
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    courseImage: {
        height: 160,
        width: '100%',
    },
    courseInfo: {
        padding: 16,
    },
    courseDescription: {
        marginTop: 8,
        marginBottom: 12,
        opacity: 0.7,
        fontSize: isSmallDevice ? Fonts.sizes.small : Fonts.sizes.medium,
    },
    courseStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    courseRating: {
        fontSize: Fonts.sizes.small,
    },
    courseDuration: {
        fontSize: Fonts.sizes.small,
        opacity: 0.7,
    },
});

export default ExploreScreen; 