import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

type CourseData = {
    title?: string;
    author?: string;
    instructor?: string;
    category?: string;
    description?: string;
    imageUrl?: string;
    image?: string;
    thumbnail?: string;
    rating?: number;
    price?: number | string;
    level?: string;
    difficulty?: string;
    duration?: string;
};

export default function CourseDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [course, setCourse] = useState<CourseData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCourse = async () => {
            if (!id || Array.isArray(id)) {
                setError('Invalid course route.');
                setLoading(false);
                return;
            }

            try {
                const snapshot = await getDoc(doc(db, 'courses', id));
                if (!snapshot.exists()) {
                    setError('Course not found.');
                    setCourse(null);
                } else {
                    setCourse(snapshot.data() as CourseData);
                }
            } catch (fetchError) {
                setError('Failed to load course details.');
            } finally {
                setLoading(false);
            }
        };

        loadCourse();
    }, [id]);

    const imageUrl = course?.imageUrl || course?.image || course?.thumbnail;
    const title = course?.title || 'Course Details';
    const author = course?.author || course?.instructor || 'Course Instructor';
    const category = course?.category || 'Course';
    const rating = typeof course?.rating === 'number' ? course.rating.toFixed(1) : '4.5';
    const level = course?.level || course?.difficulty || 'All Levels';
    const duration = course?.duration || 'Self-paced';
    const priceValue = course?.price;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F6F8FC" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={20} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Course</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {loading ? (
                    <View style={styles.stateContainer}>
                        <ActivityIndicator size="large" color="#0F172A" />
                        <Text style={styles.stateText}>Loading course details...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.stateContainer}>
                        <View style={styles.stateIconWrap}>
                            <Ionicons name="alert-circle-outline" size={30} color="#0F172A" />
                        </View>
                        <Text style={styles.stateTitle}>{error}</Text>
                        <Text style={styles.stateText}>This route now exists, but the record could not be loaded.</Text>
                        <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
                            <Text style={styles.primaryButtonText}>Go Back</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <View style={styles.heroCard}>
                            {imageUrl ? (
                                <Image source={{ uri: imageUrl }} style={styles.heroImage} />
                            ) : (
                                <View style={styles.heroPlaceholder}>
                                    <Ionicons name="school-outline" size={42} color="#5B6BFF" />
                                </View>
                            )}
                            <View style={styles.heroOverlay} />
                        </View>

                        <View style={styles.detailsCard}>
                            <View style={styles.pillRow}>
                                <View style={styles.pill}>
                                    <Text style={styles.pillText}>{category}</Text>
                                </View>
                                <View style={styles.pillAlt}>
                                    <Ionicons name="star" size={12} color="#F59E0B" />
                                    <Text style={styles.pillAltText}>{rating}</Text>
                                </View>
                            </View>

                            <Text style={styles.title}>{title}</Text>
                            <Text style={styles.subtitle}>By {author}</Text>

                            <View style={styles.metaRow}>
                                <View style={styles.metaItem}>
                                    <Ionicons name="time-outline" size={16} color="#64748B" />
                                    <Text style={styles.metaText}>{duration}</Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <Ionicons name="layers-outline" size={16} color="#64748B" />
                                    <Text style={styles.metaText}>{level}</Text>
                                </View>
                            </View>

                            {priceValue !== undefined && priceValue !== null && (
                                <View style={styles.priceRow}>
                                    <Text style={styles.priceLabel}>Price</Text>
                                    <Text style={styles.priceValue}>
                                        ${Number(priceValue).toFixed(2)}
                                    </Text>
                                </View>
                            )}

                            <View style={styles.descriptionBlock}>
                                <Text style={styles.sectionTitle}>Overview</Text>
                                <Text style={styles.description}>
                                    {course?.description || 'No course description is available for this item yet.'}
                                </Text>
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F8FC',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F6F8FC',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5EBF5',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
    },
    headerSpacer: {
        width: 40,
    },
    content: {
        padding: 20,
        paddingBottom: 32,
    },
    stateContainer: {
        minHeight: 420,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    stateIconWrap: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#E5EBF5',
    },
    stateTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 8,
        textAlign: 'center',
    },
    stateText: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 20,
        maxWidth: 320,
        marginBottom: 18,
    },
    primaryButton: {
        backgroundColor: '#0F172A',
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 14,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    heroCard: {
        height: 250,
        borderRadius: 28,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5EBF5',
        marginBottom: 18,
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EEF2FF',
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.08)',
    },
    detailsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E5EBF5',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.06,
        shadowRadius: 20,
        elevation: 3,
    },
    pillRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 14,
    },
    pill: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
        backgroundColor: '#EEF2FF',
    },
    pillText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#334155',
    },
    pillAlt: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
        backgroundColor: '#FFF7ED',
    },
    pillAltText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#B45309',
    },
    title: {
        fontSize: 26,
        lineHeight: 32,
        fontWeight: '800',
        color: '#0F172A',
        letterSpacing: -0.4,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#64748B',
        marginBottom: 18,
    },
    metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 18,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E5EBF5',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 14,
    },
    metaText: {
        color: '#334155',
        fontSize: 13,
        fontWeight: '600',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#EEF2F7',
        marginBottom: 18,
    },
    priceLabel: {
        color: '#64748B',
        fontSize: 14,
        fontWeight: '600',
    },
    priceValue: {
        color: '#0F172A',
        fontSize: 20,
        fontWeight: '800',
    },
    descriptionBlock: {
        gap: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0F172A',
    },
    description: {
        color: '#475569',
        fontSize: 14,
        lineHeight: 22,
    },
});