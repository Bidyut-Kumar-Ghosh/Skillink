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

interface Book {
    id: string;
    title: string;
    author: string;
    description: string;
    isbn: string;
    price: string;
    relatedCourses: string[];
}

interface NewBook {
    title: string;
    author: string;
    description: string;
    isbn: string;
    price: string;
    relatedCourses: string;
}

export default function BooksManagement() {
    const { theme } = useTheme();
    const { isAdmin } = useAuth();
    const [books, setBooks] = useState<Book[]>([]);
    const [newBook, setNewBook] = useState<NewBook>({
        title: '',
        author: '',
        description: '',
        isbn: '',
        price: '',
        relatedCourses: '',
    });
    const [editingBook, setEditingBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isAdmin) {
            Alert.alert('Unauthorized', 'You do not have access to this page.');
            router.replace('/');
            return;
        }
        loadBooks();
    }, [isAdmin]);

    const loadBooks = async () => {
        try {
            setLoading(true);
            const booksCollection = collection(db, 'books');
            const booksSnapshot = await getDocs(booksCollection);
            const booksList = booksSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Book[];
            setBooks(booksList);
        } catch (error) {
            console.error('Error loading books:', error);
            Alert.alert('Error', 'Failed to load books');
        } finally {
            setLoading(false);
        }
    };

    const handleAddBook = async () => {
        try {
            if (!newBook.title || !newBook.author) {
                Alert.alert('Error', 'Please fill in all required fields');
                return;
            }

            setLoading(true);
            const booksCollection = collection(db, 'books');
            const relatedCourses = newBook.relatedCourses
                ? newBook.relatedCourses.split(',').map(course => course.trim())
                : [];

            await addDoc(booksCollection, {
                ...newBook,
                relatedCourses,
            });

            setNewBook({
                title: '',
                author: '',
                description: '',
                isbn: '',
                price: '',
                relatedCourses: '',
            });
            loadBooks();
        } catch (error) {
            console.error('Error adding book:', error);
            Alert.alert('Error', 'Failed to add book');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateBook = async () => {
        if (!editingBook) return;

        try {
            setLoading(true);
            const bookRef = doc(db, 'books', editingBook.id);
            const updatedBook = {
                ...editingBook,
                relatedCourses: Array.isArray(editingBook.relatedCourses)
                    ? editingBook.relatedCourses
                    : editingBook.relatedCourses.split(',').map(course => course.trim())
            };

            await updateDoc(bookRef, updatedBook);
            setEditingBook(null);
            loadBooks();
        } catch (error) {
            console.error('Error updating book:', error);
            Alert.alert('Error', 'Failed to update book');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBook = async (bookId: string) => {
        try {
            setLoading(true);
            await deleteDoc(doc(db, 'books', bookId));
            loadBooks();
        } catch (error) {
            console.error('Error deleting book:', error);
            Alert.alert('Error', 'Failed to delete book');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <ThemedView style={styles.content}>
                    <ThemedText type="title" style={styles.title}>Manage Books</ThemedText>

                    <ThemedView style={styles.section}>
                        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                            {editingBook ? 'Edit Book' : 'Add New Book'}
                        </ThemedText>

                        <TextInput
                            style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text }]}
                            placeholder="Book Title"
                            placeholderTextColor={theme.textLight}
                            value={editingBook ? editingBook.title : newBook.title}
                            onChangeText={(text) => editingBook
                                ? setEditingBook({ ...editingBook, title: text })
                                : setNewBook({ ...newBook, title: text })
                            }
                        />

                        <TextInput
                            style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text }]}
                            placeholder="Author"
                            placeholderTextColor={theme.textLight}
                            value={editingBook ? editingBook.author : newBook.author}
                            onChangeText={(text) => editingBook
                                ? setEditingBook({ ...editingBook, author: text })
                                : setNewBook({ ...newBook, author: text })
                            }
                        />

                        <TextInput
                            style={[styles.input, styles.textArea, { backgroundColor: theme.cardBackground, color: theme.text }]}
                            placeholder="Book Description"
                            placeholderTextColor={theme.textLight}
                            value={editingBook ? editingBook.description : newBook.description}
                            onChangeText={(text) => editingBook
                                ? setEditingBook({ ...editingBook, description: text })
                                : setNewBook({ ...newBook, description: text })
                            }
                            multiline
                            numberOfLines={4}
                        />

                        <TextInput
                            style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text }]}
                            placeholder="ISBN"
                            placeholderTextColor={theme.textLight}
                            value={editingBook ? editingBook.isbn : newBook.isbn}
                            onChangeText={(text) => editingBook
                                ? setEditingBook({ ...editingBook, isbn: text })
                                : setNewBook({ ...newBook, isbn: text })
                            }
                        />

                        <TextInput
                            style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text }]}
                            placeholder="Price"
                            placeholderTextColor={theme.textLight}
                            value={editingBook ? editingBook.price : newBook.price}
                            onChangeText={(text) => editingBook
                                ? setEditingBook({ ...editingBook, price: text })
                                : setNewBook({ ...newBook, price: text })
                            }
                            keyboardType="numeric"
                        />

                        <TextInput
                            style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.text }]}
                            placeholder="Related Courses (comma-separated)"
                            placeholderTextColor={theme.textLight}
                            value={editingBook
                                ? (Array.isArray(editingBook.relatedCourses)
                                    ? editingBook.relatedCourses.join(', ')
                                    : editingBook.relatedCourses || '')
                                : newBook.relatedCourses
                            }
                            onChangeText={(text) => editingBook
                                ? setEditingBook({ ...editingBook, relatedCourses: text.split(',').map(t => t.trim()) })
                                : setNewBook({ ...newBook, relatedCourses: text })
                            }
                        />

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: theme.primary }]}
                                onPress={editingBook ? handleUpdateBook : handleAddBook}
                                disabled={loading}
                            >
                                <ThemedText style={[styles.buttonText, { color: theme.buttonText }]}>
                                    {editingBook ? 'Update Book' : 'Add Book'}
                                </ThemedText>
                            </TouchableOpacity>

                            {editingBook && (
                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: theme.error }]}
                                    onPress={() => setEditingBook(null)}
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
                            Existing Books
                        </ThemedText>

                        {books.map((book) => (
                            <ThemedView
                                key={book.id}
                                style={[styles.bookCard, { backgroundColor: theme.cardBackground }]}
                            >
                                <ThemedText type="defaultSemiBold">{book.title}</ThemedText>
                                <ThemedText>Author: {book.author}</ThemedText>
                                <ThemedText style={styles.description}>{book.description}</ThemedText>
                                <ThemedText>ISBN: {book.isbn}</ThemedText>
                                <ThemedText>Price: {book.price}</ThemedText>
                                <ThemedText>Related Courses: {Array.isArray(book.relatedCourses)
                                    ? book.relatedCourses.join(', ')
                                    : book.relatedCourses}</ThemedText>

                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={[styles.button, { backgroundColor: theme.primary }]}
                                        onPress={() => setEditingBook(book)}
                                    >
                                        <ThemedText style={[styles.buttonText, { color: theme.buttonText }]}>
                                            Edit
                                        </ThemedText>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.button, { backgroundColor: theme.error }]}
                                        onPress={() => {
                                            Alert.alert(
                                                'Delete Book',
                                                'Are you sure you want to delete this book?',
                                                [
                                                    { text: 'Cancel', style: 'cancel' },
                                                    {
                                                        text: 'Delete',
                                                        style: 'destructive',
                                                        onPress: () => handleDeleteBook(book.id),
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
    bookCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    description: {
        marginVertical: 8,
    },
}); 