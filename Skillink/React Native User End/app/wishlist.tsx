import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Platform,
    ActivityIndicator,
    Image,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore/lite';
import Dashboard from './components/Dashboard';

type WishlistCourse = {
    id: string;
        backgroundColor: 'transparent',
    author: string;
    category: string;
    imageUrl?: string;
    rating: number;
};

export default function Wishlist() {
    const { isDarkMode } = useTheme();
    const { user } = useAuth();
    const [wishlistCourses, setWishlistCourses] = useState<WishlistCourse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadWishlistCourses = async () => {
            if (!user?.id) {
                setWishlistCourses([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const userSnapshot = await getDoc(doc(db, 'users', user.id));
                if (!userSnapshot.exists()) {
                    setWishlistCourses([]);
                    return;
                }

                const userData = userSnapshot.data();
                const wishlistIds = Array.isArray(userData?.wishlistCourseIds)
                    ? userData.wishlistCourseIds.filter((item: unknown): item is string => typeof item === 'string')
                    : [];

                if (wishlistIds.length === 0) {
                    setWishlistCourses([]);
                    return;
                }

                const courseSnapshots = await Promise.all(
                    wishlistIds.map((courseId: string) => getDoc(doc(db, 'courses', courseId)))
                );

                const courses = courseSnapshots
                    .filter((snapshot) => snapshot.exists())
                    .map((snapshot) => {
                        const data = snapshot.data();
                        return {
                            id: snapshot.id,
                            title: data.title || 'Untitled Course',
                            author: data.author || data.instructor || 'Course Instructor',
                            category: data.category || 'Course',
                            imageUrl: data.imageUrl || data.image || data.thumbnail,
                            rating: typeof data.rating === 'number' ? data.rating : 4.5,
                        };
                    });

                setWishlistCourses(courses);
            } catch (error) {
                console.error('Error loading wishlist courses:', error);
                setWishlistCourses([]);
            } finally {
                setLoading(false);
            }
        };

        loadWishlistCourses();
    }, [user?.id]);

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
            <StatusBar
                backgroundColor={isDarkMode ? '#000000' : '#FFFFFF'}
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            />

            <View style={[styles.header, isDarkMode && styles.darkHeader]}>
                <View style={styles.headerTopRow}>
                    <View style={[styles.headerIconWrap, isDarkMode && styles.darkHeaderIconWrap]}>
                        <Ionicons name="bookmark" size={18} color={isDarkMode ? '#EAF0FF' : '#0F172A'} />
                    </View>
                    <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Wishlist</Text>
                </View>
                <Text style={[styles.headerSubtitle, isDarkMode && styles.darkMutedText]}>
                    A refined place to collect courses worth revisiting.
                </Text>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {loading ? (
                    <View style={[styles.loadingWrap, isDarkMode && styles.darkEmptyStateCard]}>
                        <ActivityIndicator size="large" color={isDarkMode ? '#B9C7FF' : '#0F172A'} />
                        <Text style={[styles.loadingText, isDarkMode && styles.darkMutedText]}>
                            Loading your wishlist...
                        </Text>
                    </View>
                ) : wishlistCourses.length > 0 ? (
                    <View style={styles.listWrap}>
                        {wishlistCourses.map((course) => (
                            <TouchableOpacity
                                key={course.id}
                                style={[styles.courseCard, isDarkMode && styles.darkCourseCard]}
                                onPress={() => router.push(`/course/${course.id}`)}
                                activeOpacity={0.88}
                            >
                                <View style={styles.courseImageWrap}>
                                    {course.imageUrl ? (
                                        <Image source={{ uri: course.imageUrl }} style={styles.courseImage} />
                                    ) : (
                                        <View style={[styles.courseImagePlaceholder, isDarkMode && styles.darkIconCore]}>
                                            <Ionicons name="school-outline" size={28} color={isDarkMode ? '#B9C7FF' : '#5B6BFF'} />
                                        </View>
                                    )}
                                </View>

                                <View style={styles.courseInfo}>
                                    <Text style={[styles.courseTitle, isDarkMode && styles.darkText]} numberOfLines={2}>
                                        {course.title}
                                    </Text>
                                    <Text style={[styles.courseMeta, isDarkMode && styles.darkMutedText]}>
                                        by {course.author}
                                    </Text>
                                    <View style={styles.courseFooter}>
                                        <View style={styles.ratingRow}>
                                            <Ionicons name="star" size={14} color="#F59E0B" />
                                            <Text style={[styles.ratingText, isDarkMode && styles.darkMutedText]}>
                                                {course.rating.toFixed(1)}
                                            </Text>
                                        </View>
                                        <View style={[styles.categoryChip, isDarkMode && styles.darkFeatureChip]}>
                                            <Text style={[styles.categoryChipText, isDarkMode && styles.darkChipText]}>
                                                {course.category}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <View style={[styles.emptyStateCard, isDarkMode && styles.darkEmptyStateCard]}>
                        <View style={styles.iconBackdrop}>
                            <View style={[styles.iconRing, isDarkMode && styles.darkIconRing]} />
                            <View style={[styles.iconCore, isDarkMode && styles.darkIconCore]}>
                                <Ionicons name="bookmark" size={46} color={isDarkMode ? '#F3F6FF' : '#0F172A'} />
                            </View>
                            <View style={styles.sparkleOne}>
                                <Ionicons name="sparkles" size={16} color={isDarkMode ? '#B9C7FF' : '#5B6BFF'} />
                            </View>
                            <View style={styles.sparkleTwo}>
                                <Ionicons name="sparkles" size={12} color={isDarkMode ? '#B9C7FF' : '#5B6BFF'} />
                            </View>
                        </View>

                        <Text style={[styles.emptyStateTitle, isDarkMode && styles.darkText]}>
                            Your wishlist is empty
                        </Text>
                        <Text style={[styles.emptyStateDescription, isDarkMode && styles.darkMutedText]}>
                            Save courses that stand out, keep your shortlist organized, and return when the timing is right.
                        </Text>

                        <View style={styles.featureRow}>
                            <View style={[styles.featureChip, isDarkMode && styles.darkFeatureChip]}>
                                <Ionicons name="time-outline" size={14} color={isDarkMode ? '#C7D2FE' : '#475569'} />
                                <Text style={[styles.featureChipText, isDarkMode && styles.darkChipText]}>
                                    Quick access later
                                </Text>
                            </View>
                            <View style={[styles.featureChip, isDarkMode && styles.darkFeatureChip]}>
                                <Ionicons name="star-outline" size={14} color={isDarkMode ? '#C7D2FE' : '#475569'} />
                                <Text style={[styles.featureChipText, isDarkMode && styles.darkChipText]}>
                                    Curate top picks
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.browseButton}
                            onPress={() => router.push('/')}
                            activeOpacity={0.88}
                        >
                            <Ionicons name="compass-outline" size={18} color="#FFFFFF" />
                            <Text style={styles.browseButtonText}>Explore Courses</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            <Dashboard isNested={true} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    darkContainer: {
        backgroundColor: 'transparent',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 15 : 18,
        paddingBottom: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.56)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(148, 163, 184, 0.20)',
    },
    darkHeader: {
        backgroundColor: 'rgba(10, 16, 30, 0.62)',
        borderBottomColor: 'rgba(100, 116, 139, 0.24)',
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EEF2FF',
    },
    darkHeaderIconWrap: {
        backgroundColor: '#1B2440',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.3,
    },
    headerSubtitle: {
        marginTop: 8,
        color: '#64748B',
        fontSize: 13,
        lineHeight: 18,
    },
    darkText: {
        color: '#FFFFFF',
    },
    darkMutedText: {
        color: '#94A3B8',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        padding: 20,
        paddingBottom: 84,
    },
    loadingWrap: {
        flex: 1,
        minHeight: 260,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8EDF5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#475569',
        fontSize: 14,
        fontWeight: '600',
    },
    listWrap: {
        gap: 12,
    },
    courseCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E8EDF5',
        padding: 10,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 2,
    },
    darkCourseCard: {
        backgroundColor: '#0F1320',
        borderColor: '#1F2940',
    },
    courseImageWrap: {
        width: 96,
        height: 96,
        borderRadius: 12,
        overflow: 'hidden',
        marginRight: 12,
    },
    courseImage: {
        width: '100%',
        height: '100%',
    },
    courseImagePlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EEF2FF',
    },
    courseInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    courseTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        lineHeight: 22,
    },
    courseMeta: {
        marginTop: 4,
        fontSize: 12,
        color: '#64748B',
    },
    courseFooter: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 12,
        color: '#475569',
        fontWeight: '600',
    },
    categoryChip: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: '#F4F7FC',
        borderWidth: 1,
        borderColor: '#E5EBF5',
    },
    categoryChipText: {
        fontSize: 11,
        color: '#475569',
        fontWeight: '700',
    },
    emptyStateCard: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 28,
        marginTop: 22,
        borderRadius: 28,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8EDF5',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 4,
        overflow: 'hidden',
    },
    darkEmptyStateCard: {
        backgroundColor: '#0F1320',
        borderColor: '#1F2940',
    },
    iconBackdrop: {
        width: 160,
        height: 160,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    iconRing: {
        position: 'absolute',
        width: 148,
        height: 148,
        borderRadius: 74,
        borderWidth: 1,
        borderColor: '#D9E0EE',
        backgroundColor: '#F8FAFF',
    },
    darkIconRing: {
        borderColor: '#24314A',
        backgroundColor: '#141B2C',
    },
    iconCore: {
        width: 92,
        height: 92,
        borderRadius: 28,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#5B6BFF',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.14,
        shadowRadius: 18,
        elevation: 3,
    },
    darkIconCore: {
        backgroundColor: '#18213A',
        shadowColor: '#000000',
    },
    sparkleOne: {
        position: 'absolute',
        top: 24,
        right: 36,
    },
    sparkleTwo: {
        position: 'absolute',
        bottom: 28,
        left: 34,
    },
    emptyStateTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0F172A',
        marginTop: 8,
        marginBottom: 12,
        letterSpacing: -0.3,
        textAlign: 'center',
    },
    emptyStateDescription: {
        fontSize: 15,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 22,
        lineHeight: 22,
        maxWidth: 310,
    },
    featureRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'center',
        marginBottom: 26,
    },
    featureChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: '#F4F7FC',
        borderWidth: 1,
        borderColor: '#E5EBF5',
    },
    darkFeatureChip: {
        backgroundColor: '#151D31',
        borderColor: '#24314A',
    },
    featureChipText: {
        fontSize: 12,
        color: '#475569',
        fontWeight: '600',
    },
    darkChipText: {
        color: '#D1D9EA',
    },
    browseButton: {
        backgroundColor: '#0F172A',
        paddingHorizontal: 22,
        paddingVertical: 14,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.18,
        shadowRadius: 18,
        elevation: 4,
    },
    browseButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
    },
});