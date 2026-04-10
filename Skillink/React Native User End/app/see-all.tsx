import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore/lite';
import { db } from '@/config/firebase';
import { useTheme } from '@/context/ThemeContext';

interface CourseItem {
    id: string;
    title: string;
    author: string;
    rating: number;
    imageUrl?: string;
    category: string;
    level?: string;
    duration?: string;
}

const normalizeParam = (value: string | string[] | undefined) => {
    if (Array.isArray(value)) {
        return value[0] || '';
    }
    return value || '';
};

export default function SeeAllScreen() {
    const { isDarkMode } = useTheme();
    const params = useLocalSearchParams<{ category?: string | string[]; title?: string | string[] }>();
    const category = useMemo(() => normalizeParam(params.category), [params.category]);
    const title = useMemo(
        () => normalizeParam(params.title) || (category ? `Top courses in ${category}` : 'All Courses'),
        [params.title, category]
    );

    const [courses, setCourses] = useState<CourseItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            setIsLoading(true);
            try {
                const snapshot = await getDocs(collection(db, 'courses'));
                const allCourses: CourseItem[] = [];

                snapshot.forEach((itemDoc) => {
                    const data = itemDoc.data();
                    allCourses.push({
                        id: itemDoc.id,
                        title: data.title || 'Untitled Course',
                        author: data.author || data.instructor || 'Course Instructor',
                        rating: Number(data.rating || 0),
                        imageUrl: data.imageUrl,
                        category: data.category || 'Uncategorized',
                        level: data.level || 'All Levels',
                        duration: data.duration || 'Self-paced',
                    });
                });

                const filteredCourses = category
                    ? allCourses.filter((item) => item.category === category)
                    : allCourses;

                filteredCourses.sort((a, b) => b.rating - a.rating);
                setCourses(filteredCourses);
            } catch (error) {
                console.error('Error loading see-all courses:', error);
                setCourses([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourses();
    }, [category]);

    const renderItem = ({ item }: { item: CourseItem }) => (
        <TouchableOpacity
            style={[styles.courseCard, isDarkMode && styles.darkCard]}
            onPress={() => router.push(`/course/${item.id}`)}
            activeOpacity={0.85}
        >
            <View style={styles.imageWrap}>
                {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
                ) : (
                    <View style={[styles.placeholderImage, isDarkMode && styles.darkPlaceholderImage]}>
                        <Ionicons name="school" size={24} color={isDarkMode ? '#8FA3FF' : '#3366FF'} />
                    </View>
                )}
            </View>
            <View style={styles.metaWrap}>
                <Text style={[styles.title, isDarkMode && styles.darkText]} numberOfLines={2}>
                    {item.title}
                </Text>
                <Text style={[styles.author, isDarkMode && styles.darkSubText]} numberOfLines={1}>
                    by {item.author}
                </Text>
                <View style={styles.bottomRow}>
                    <View style={styles.ratingWrap}>
                        <Ionicons name="star" size={13} color="#FFD700" />
                        <Text style={[styles.rating, isDarkMode && styles.darkSubText]}>{item.rating.toFixed(1)}</Text>
                    </View>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.category}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
            <StatusBar
                backgroundColor={isDarkMode ? '#000000' : '#FFFFFF'}
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            />

            <View style={[styles.header, isDarkMode && styles.darkHeader]}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={20} color={isDarkMode ? '#E2E8F0' : '#1E293B'} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, isDarkMode && styles.darkText]} numberOfLines={1}>
                    {title}
                </Text>
                <View style={styles.headerSpacer} />
            </View>

            {isLoading ? (
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color="#3366FF" />
                    <Text style={[styles.stateText, isDarkMode && styles.darkSubText]}>Loading courses...</Text>
                </View>
            ) : courses.length === 0 ? (
                <View style={styles.centerState}>
                    <Ionicons name="search" size={38} color={isDarkMode ? '#7C8498' : '#94A3B8'} />
                    <Text style={[styles.stateText, isDarkMode && styles.darkSubText]}>No courses found</Text>
                </View>
            ) : (
                <FlatList
                    data={courses}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(148, 163, 184, 0.20)',
        backgroundColor: 'rgba(255, 255, 255, 0.54)',
    },
    darkHeader: {
        backgroundColor: 'rgba(10, 16, 30, 0.60)',
        borderBottomColor: 'rgba(100, 116, 139, 0.24)',
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(148, 163, 184, 0.14)',
    },
    headerTitle: {
        flex: 1,
        marginHorizontal: 12,
        fontSize: 17,
        fontWeight: '700',
        color: '#0F172A',
    },
    headerSpacer: {
        width: 36,
    },
    listContent: {
        padding: 16,
        paddingBottom: 24,
    },
    courseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    darkCard: {
        backgroundColor: '#121212',
        borderColor: '#2A2A2A',
    },
    imageWrap: {
        width: 90,
        height: 70,
        borderRadius: 10,
        overflow: 'hidden',
        marginRight: 12,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        flex: 1,
        backgroundColor: '#E6EEFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    darkPlaceholderImage: {
        backgroundColor: '#1E293B',
    },
    metaWrap: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 4,
    },
    author: {
        fontSize: 12,
        color: '#64748B',
        marginBottom: 8,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    ratingWrap: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rating: {
        marginLeft: 4,
        fontSize: 12,
        color: '#475569',
        fontWeight: '600',
    },
    badge: {
        backgroundColor: '#DBEAFE',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
    },
    badgeText: {
        fontSize: 10,
        color: '#1D4ED8',
        fontWeight: '700',
    },
    centerState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    stateText: {
        marginTop: 10,
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
    },
    darkText: {
        color: '#E2E8F0',
    },
    darkSubText: {
        color: '#A0AEC0',
    },
});
