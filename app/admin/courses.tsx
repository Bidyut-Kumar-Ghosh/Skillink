import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/config/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

interface Course {
    id: string;
    title: string;
    description: string;
    duration: string;
    price: string;
    relatedBooks: string[];
}

export default function CoursesManagement() {
    const { theme } = useTheme();
    const { isAdmin } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [newCourse, setNewCourse] = useState({
        title: '',
        description: '',
        duration: '',
        price: '',
        relatedBooks: '',
    });
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isAdmin) {
            Alert.alert('Unauthorized', 'You do not have access to this page.');
            router.replace('/');
            return;
        }
        loadCourses();
    }, [isAdmin]);

    const loadCourses = async () => {
        try {
            setLoading(true);
            const coursesCollection = collection(db, 'courses');
            const coursesSnapshot = await getDocs(coursesCollection);
            const coursesList = coursesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Course[];
            setCourses(coursesList);
        } catch (error) {
            console.error('Error loading courses:', error);
            Alert.alert('Error', 'Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCourse = async () => {
        try {
            if (!newCourse.title || !newCourse.description) {
                Alert.alert('Error', 'Please fill in all required fields');
                return;
            }

            setLoading(true);
            const coursesCollection = collection(db, 'courses');
            await addDoc(coursesCollection, {
                ...newCourse,
                relatedBooks: newCourse.relatedBooks.split(',').map(book => book.trim()),
            });

            setNewCourse({
                title: '',
                description: '',
                duration: '',
                price: '',
                relatedBooks: '',
            });
            loadCourses();
        } catch (error) {
            console.error('Error adding course:', error);
            Alert.alert('Error', 'Failed to add course');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCourse = async () => {
        if (!editingCourse) return;

        try {
            setLoading(true);
            const courseRef = doc(db, 'courses', editingCourse.id);
            await updateDoc(courseRef, {
                ...editingCourse,
                relatedBooks: typeof editingCourse.relatedBooks === 'string'
                    ? editingCourse.relatedBooks.split(',').map(book => book.trim())
                    : editingCourse.relatedBooks,
            });

            setEditingCourse(null);
            loadCourses();
        } catch (error) {
            console.error('Error updating course:', error);
            Alert.alert('Error', 'Failed to update course');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCourse = async (courseId: string) => {
        try {
            setLoading(true);
            await deleteDoc(doc(db, 'courses', courseId));
            loadCourses();
        } catch (error) {
            console.error('Error deleting course:', error);
            Alert.alert('Error', 'Failed to delete course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <ThemedView style={styles.content}>
                    <ThemedText type="title" style={styles.title}>Manage Courses</ThemedText>

                    <ThemedView style={styles.section}>
                        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                            {editingCourse ? 'Edit Course' : 'Add New Course'}
                        </ThemedText>

                        <TextInput
                            style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text }]}
                            placeholder="Course Title"
                            placeholderTextColor={theme.textLight}
                            value={editingCourse ? editingCourse.title : newCourse.title}
                            onChangeText={(text) => editingCourse
                                ? setEditingCourse({ ...editingCourse, title: text })
                                : setNewCourse({ ...newCourse, title: text })
                            }
                        />

                        <TextInput
                            style={[styles.input, styles.textArea, { backgroundColor: theme.cardBackground, color: theme.text }]}
                            placeholder="Course Description"
                            placeholderTextColor={theme.textLight}
                            value={editingCourse ? editingCourse.description : newCourse.description}
                            onChangeText={(text) => editingCourse
                                ? setEditingCourse({ ...editingCourse, description: text })
                                : setNewCourse({ ...newCourse, description: text })
                            }
                            multiline
                            numberOfLines={4}
                        />

                        <TextInput
                            style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text }]}
                            placeholder="Duration (e.g., 8 weeks)"
                            placeholderTextColor={theme.textLight}
                            value={editingCourse ? editingCourse.duration : newCourse.duration}
                            onChangeText={(text) => editingCourse
                                ? setEditingCourse({ ...editingCourse, duration: text })
                                : setNewCourse({ ...newCourse, duration: text })
                            }
                        />

                        <TextInput
                            style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text }]}
                            placeholder="Price"
                            placeholderTextColor={theme.textLight}
                            value={editingCourse ? editingCourse.price : newCourse.price}
                            onChangeText={(text) => editingCourse
                                ? setEditingCourse({ ...editingCourse, price: text })
                                : setNewCourse({ ...newCourse, price: text })
                            }
                            keyboardType="numeric"
                        />

                        <TextInput
                            style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text }]}
                            placeholder="Related Books (comma-separated)"
                            placeholderTextColor={theme.textLight}
                            value={editingCourse
                                ? (Array.isArray(editingCourse.relatedBooks)
                                    ? editingCourse.relatedBooks.join(', ')
                                    : editingCourse.relatedBooks)
                                : newCourse.relatedBooks
                            }
                            onChangeText={(text) => editingCourse
                                ? setEditingCourse({ ...editingCourse, relatedBooks: text })
                                : setNewCourse({ ...newCourse, relatedBooks: text })
                            }
                        />

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: theme.primary }]}
                                onPress={editingCourse ? handleUpdateCourse : handleAddCourse}
                                disabled={loading}
                            >
                                <ThemedText style={[styles.buttonText, { color: theme.buttonText }]}>
                                    {editingCourse ? 'Update Course' : 'Add Course'}
                                </ThemedText>
                            </TouchableOpacity>

                            {editingCourse && (
                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: theme.error }]}
                                    onPress={() => setEditingCourse(null)}
                                    disabled={loading}
                                >
                                    <ThemedText style={[styles.buttonText, { color: theme.buttonText }]}>
                                        Cancel
                                    </ThemedText>
                                </TouchableOpacity>
                            )}
                        </View>
                    </ThemedView>

                    <ThemedView style={styles.section}>
                        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                            Existing Courses
                        </ThemedText>

                        {courses.map((course) => (
                            <ThemedView
                                key={course.id}
                                style={[styles.courseCard, { backgroundColor: theme.cardBackground }]}
                            >
                                <ThemedText type="defaultSemiBold">{course.title}</ThemedText>
                                <ThemedText style={styles.description}>{course.description}</ThemedText>
                                <ThemedText>Duration: {course.duration}</ThemedText>
                                <ThemedText>Price: {course.price}</ThemedText>
                                <ThemedText>Related Books: {Array.isArray(course.relatedBooks)
                                    ? course.relatedBooks.join(', ')
                                    : course.relatedBooks}</ThemedText>

                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={[styles.button, { backgroundColor: theme.primary }]}
                                        onPress={() => setEditingCourse(course)}
                                    >
                                        <ThemedText style={[styles.buttonText, { color: theme.buttonText }]}>
                                            Edit
                                        </ThemedText>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.button, { backgroundColor: theme.error }]}
                                        onPress={() => {
                                            Alert.alert(
                                                'Delete Course',
                                                'Are you sure you want to delete this course?',
                                                [
                                                    { text: 'Cancel', style: 'cancel' },
                                                    {
                                                        text: 'Delete',
                                                        style: 'destructive',
                                                        onPress: () => handleDeleteCourse(course.id),
                                                    },
                                                ]
                                            );
                                        }}
                                    >
                                        <ThemedText style={[styles.buttonText, { color: theme.buttonText }]}>
                                            Delete
                                        </ThemedText>
                                    </TouchableOpacity>
                                </View>
                            </ThemedView>
                        ))}
                    </ThemedView>
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
    content: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 32,
        textAlign: 'center',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        marginBottom: 16,
    },
    input: {
        width: '100%',
        height: 48,
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    button: {
        flex: 1,
        height: 48,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 4,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    courseCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    description: {
        marginVertical: 8,
    },
}); 