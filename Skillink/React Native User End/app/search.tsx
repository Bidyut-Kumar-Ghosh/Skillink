import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Image,
    SafeAreaView,
    StatusBar,
    Keyboard,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import {
    collection,
    getDocs,
    query,
    where,
    limit,
    orderBy,
    startAt,
    endAt,
    doc,
    getDoc,
    DocumentData,
    QuerySnapshot,
    onSnapshot
} from 'firebase/firestore';
import { db } from '@/config/firebase';

// Define types for search results
interface SearchItem {
    id: string;
    title: string;
    author: string;
    category: string;
    imageUrl?: string;
    description?: string;
    rating?: number;
    price?: string;
    duration?: string;
    level?: string;
    type: 'book' | 'course';
}

export default function SearchScreen() {
    const { isDarkMode } = useTheme();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchType, setSearchType] = useState<'all' | 'books' | 'courses'>('all');

    // Reference to track current search
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    // Improved debounced auto-search as user types
    useEffect(() => {
        // Clear any existing timeout
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        if (searchQuery.trim().length < 2) {
            // Don't search for very short queries
            if (searchQuery.trim().length === 0) {
                setSearchResults([]);
                setHasSearched(false);
            }
            return;
        }

        // Start loading state immediately for better UX
        setIsLoading(true);

        // Set a timeout for the search
        searchTimeout.current = setTimeout(() => {
            searchFirebase(searchQuery, searchType);
        }, 300); // 300ms debounce

        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
    }, [searchQuery, searchType]);

    // Function to search Firebase for books and courses
    const searchFirebase = useCallback(async (text: string, type: 'all' | 'books' | 'courses' = 'all') => {
        if (!text.trim() || text.trim().length < 2) {
            setSearchResults([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setHasSearched(true);
        console.log(`Searching for "${text}" in ${type}...`);

        try {
            const results: SearchItem[] = [];
            const searchLower = text.toLowerCase();

            // Search in courses collection
            if (type === 'all' || type === 'courses') {
                try {
                    console.log("Searching courses collection...");
                    const coursesRef = collection(db, 'courses');

                    // Get all courses and filter client-side - most reliable approach
                    const allCoursesQuery = query(coursesRef, limit(100));
                    const coursesSnapshot = await getDocs(allCoursesQuery);
                    console.log(`Found ${coursesSnapshot.size} total courses to filter`);

                    coursesSnapshot.forEach(doc => {
                        const data = doc.data();
                        const title = String(data.title || '').toLowerCase();
                        const author = String(data.author || data.instructor || '').toLowerCase();
                        const description = String(data.description || '').toLowerCase();
                        const category = String(data.category || '').toLowerCase();

                        // Include if any field contains the search term
                        if (title.includes(searchLower) ||
                            author.includes(searchLower) ||
                            description.includes(searchLower) ||
                            category.includes(searchLower)) {

                            results.push({
                                id: doc.id,
                                title: data.title || 'Untitled Course',
                                author: data.author || data.instructor || 'Unknown Instructor',
                                category: data.category || 'Course',
                                imageUrl: data.imageUrl || data.image || data.thumbnail,
                                description: data.description,
                                rating: data.rating || 4.5,
                                price: data.price,
                                duration: data.duration,
                                level: data.level || data.difficulty || 'All Levels',
                                type: 'course'
                            });
                        }
                    });
                } catch (error) {
                    console.error('Error searching courses:', error);
                }
            }

            // Search in books collection
            if (type === 'all' || type === 'books') {
                try {
                    console.log("Searching books collection...");
                    const booksRef = collection(db, 'books');

                    // Get all books and filter client-side - most reliable approach
                    const allBooksQuery = query(booksRef, limit(100));
                    const booksSnapshot = await getDocs(allBooksQuery);
                    console.log(`Found ${booksSnapshot.size} total books to filter`);

                    booksSnapshot.forEach(doc => {
                        const data = doc.data();
                        const title = String(data.title || '').toLowerCase();
                        const author = String(data.author || '').toLowerCase();
                        const description = String(data.description || '').toLowerCase();
                        const category = String(data.category || '').toLowerCase();

                        // Include if any field contains the search term
                        if (title.includes(searchLower) ||
                            author.includes(searchLower) ||
                            description.includes(searchLower) ||
                            category.includes(searchLower)) {

                            results.push({
                                id: doc.id,
                                title: data.title || 'Untitled Book',
                                author: data.author || 'Unknown Author',
                                category: data.category || 'Book',
                                imageUrl: data.imageUrl || data.image || data.coverImage || data.thumbnail,
                                description: data.description,
                                rating: data.rating || 4.0,
                                price: data.price,
                                type: 'book'
                            });
                        }
                    });
                } catch (error) {
                    console.error('Error searching books:', error);
                }
            }

            console.log(`Total search results: ${results.length}`);

            // Sort by relevance (exact title match first, then alphabetically)
            const sortedResults = results.sort((a, b) => {
                const aTitle = a.title.toLowerCase();
                const bTitle = b.title.toLowerCase();

                // Exact matches first
                const aExactMatch = aTitle === searchLower;
                const bExactMatch = bTitle === searchLower;

                if (aExactMatch && !bExactMatch) return -1;
                if (!aExactMatch && bExactMatch) return 1;

                // Starts with matches next
                const aStartsWith = aTitle.startsWith(searchLower);
                const bStartsWith = bTitle.startsWith(searchLower);

                if (aStartsWith && !bStartsWith) return -1;
                if (!aStartsWith && bStartsWith) return 1;

                // Alphabetical sorting
                return aTitle.localeCompare(bTitle);
            });

            setSearchResults(sortedResults);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Handle user pressing search button
    const handleSearch = () => {
        Keyboard.dismiss();
        searchFirebase(searchQuery, searchType);
    };

    // Clear search results
    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setHasSearched(false);
    };

    // Navigate back to previous screen
    const goBack = () => {
        router.back();
    };

    // Handle item selection
    const handleItemSelect = (item: SearchItem) => {
        if (item.type === 'book') {
            router.push(`/book/${item.id}`);
        } else {
            router.push(`/course/${item.id}`);
        }
    };

    // Function to fetch all courses
    const fetchAllCourses = useCallback(async () => {
        setIsLoading(true);
        setHasSearched(true);

        try {
            console.log("Fetching all courses...");
            const coursesRef = collection(db, 'courses');
            const coursesQuery = query(coursesRef, limit(100));
            const coursesSnapshot = await getDocs(coursesQuery);

            console.log(`Found ${coursesSnapshot.size} courses`);
            const courseResults: SearchItem[] = [];

            coursesSnapshot.forEach(doc => {
                const data = doc.data();
                courseResults.push({
                    id: doc.id,
                    title: data.title || 'Untitled Course',
                    author: data.author || data.instructor || 'Unknown Instructor',
                    category: data.category || 'General',
                    imageUrl: data.imageUrl || data.image || data.thumbnail,
                    description: data.description,
                    rating: data.rating || 4.5,
                    price: data.price,
                    duration: data.duration,
                    level: data.level || data.difficulty || 'All Levels',
                    type: 'course'
                });
            });

            // Sort courses alphabetically by title
            setSearchResults(courseResults.sort((a, b) =>
                a.title.toLowerCase().localeCompare(b.title.toLowerCase())
            ));
        } catch (error) {
            console.error('Error fetching all courses:', error);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Function to fetch all books
    const fetchAllBooks = useCallback(async () => {
        setIsLoading(true);
        setHasSearched(true);

        try {
            console.log("Fetching all books...");
            const booksRef = collection(db, 'books');
            const booksQuery = query(booksRef, limit(100));
            const booksSnapshot = await getDocs(booksQuery);

            console.log(`Found ${booksSnapshot.size} books`);
            const bookResults: SearchItem[] = [];

            booksSnapshot.forEach(doc => {
                const data = doc.data();
                bookResults.push({
                    id: doc.id,
                    title: data.title || 'Untitled Book',
                    author: data.author || 'Unknown Author',
                    category: data.category || 'Literature',
                    imageUrl: data.imageUrl || data.image || data.coverImage || data.thumbnail,
                    description: data.description,
                    rating: data.rating || 4.0,
                    price: data.price,
                    type: 'book'
                });
            });

            // Sort books alphabetically by title
            setSearchResults(bookResults.sort((a, b) =>
                a.title.toLowerCase().localeCompare(b.title.toLowerCase())
            ));
        } catch (error) {
            console.error('Error fetching all books:', error);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Function to fetch all items (books and courses)
    const fetchAllItems = useCallback(async () => {
        setIsLoading(true);
        setHasSearched(true);

        try {
            const allResults: SearchItem[] = [];

            // Fetch courses
            console.log("Fetching all items...");
            const coursesRef = collection(db, 'courses');
            const coursesQuery = query(coursesRef, limit(50));
            const coursesSnapshot = await getDocs(coursesQuery);

            coursesSnapshot.forEach(doc => {
                const data = doc.data();
                allResults.push({
                    id: doc.id,
                    title: data.title || 'Untitled Course',
                    author: data.author || data.instructor || 'Unknown Instructor',
                    category: data.category || 'General',
                    imageUrl: data.imageUrl || data.image || data.thumbnail,
                    description: data.description,
                    rating: data.rating || 4.5,
                    price: data.price,
                    duration: data.duration,
                    level: data.level || data.difficulty || 'All Levels',
                    type: 'course'
                });
            });

            // Fetch books
            const booksRef = collection(db, 'books');
            const booksQuery = query(booksRef, limit(50));
            const booksSnapshot = await getDocs(booksQuery);

            booksSnapshot.forEach(doc => {
                const data = doc.data();
                allResults.push({
                    id: doc.id,
                    title: data.title || 'Untitled Book',
                    author: data.author || 'Unknown Author',
                    category: data.category || 'Literature',
                    imageUrl: data.imageUrl || data.image || data.coverImage || data.thumbnail,
                    description: data.description,
                    rating: data.rating || 4.0,
                    price: data.price,
                    type: 'book'
                });
            });

            // Sort all results alphabetically by title
            setSearchResults(allResults.sort((a, b) =>
                a.title.toLowerCase().localeCompare(b.title.toLowerCase())
            ));
        } catch (error) {
            console.error('Error fetching all items:', error);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Add useEffect to load initial content when the component mounts
    useEffect(() => {
        // Load all items when component mounts
        fetchAllItems();
    }, [fetchAllItems]);

    // Render an improved search result item
    const renderSearchItem = ({ item }: { item: SearchItem }) => (
        <TouchableOpacity
            style={[
                styles.searchResultItem,
                isDarkMode ? styles.darkSearchResultItem : null
            ]}
            onPress={() => handleItemSelect(item)}
            activeOpacity={0.7}
        >
            <View style={styles.searchItemImageContainer}>
                {item.imageUrl ? (
                    <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.searchItemImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[
                        styles.searchItemPlaceholder,
                        { backgroundColor: item.type === 'book' ? '#FFD6C9' : '#C9E7FF' }
                    ]}>
                        <Ionicons
                            name={item.type === 'book' ? 'book' : 'school'}
                            size={24}
                            color={item.type === 'book' ? '#FF6347' : '#4682B4'}
                        />
                    </View>
                )}

                {/* Category tag */}
                {item.category && (
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText} numberOfLines={1}>
                            {item.category}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.searchItemContent}>
                <View>
                    <Text
                        style={[
                            styles.searchItemTitle,
                            isDarkMode ? styles.darkText : null
                        ]}
                        numberOfLines={1}
                    >
                        {item.title}
                    </Text>

                    <Text style={styles.searchItemAuthor} numberOfLines={1}>
                        {item.author}
                    </Text>

                    {item.description ? (
                        <Text
                            style={[
                                styles.searchItemDescription,
                                isDarkMode ? { color: '#AAAAAA' } : null
                            ]}
                            numberOfLines={1}
                        >
                            {item.description.substring(0, 50)}
                            {item.description.length > 50 ? '...' : ''}
                        </Text>
                    ) : null}
                </View>

                <View style={styles.searchItemFooter}>
                    <View style={styles.searchItemMeta}>
                        {item.rating ? (
                            <View style={styles.searchItemRating}>
                                <Ionicons name="star" size={12} color="#FFD700" />
                                <Text style={styles.searchItemRatingText}>
                                    {item.rating.toFixed(1)}
                                </Text>
                            </View>
                        ) : null}

                        {item.price ? (
                            <View style={styles.priceContainer}>
                                <Text style={styles.searchItemPrice}>
                                    {typeof item.price === 'string' && item.price.includes('$')
                                        ? item.price
                                        : `$${item.price}`}
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.priceContainer}>
                                <Text style={styles.searchItemFreePrice}>Free</Text>
                            </View>
                        )}

                        {item.type === 'course' && (
                            <View style={styles.courseInfoContainer}>
                                {item.level && (
                                    <View style={styles.levelContainer}>
                                        <Ionicons name="fitness" size={10} color="#888888" />
                                        <Text style={styles.courseInfoText}>{item.level}</Text>
                                    </View>
                                )}

                                {item.duration && (
                                    <View style={styles.durationContainer}>
                                        <Ionicons name="time-outline" size={10} color="#888888" />
                                        <Text style={styles.courseInfoText}>{item.duration}</Text>
                                    </View>
                                )}
                            </View>
                        )}

                        <View style={[
                            styles.searchItemTypeTag,
                            {
                                backgroundColor: item.type === 'book'
                                    ? '#FFE4E1'
                                    : '#E1EFFE',
                                borderColor: item.type === 'book'
                                    ? '#FFB6C1'
                                    : '#ADD8E6'
                            }
                        ]}>
                            <Text style={{
                                fontSize: 10,
                                fontWeight: 'bold',
                                color: item.type === 'book' ? '#FF6347' : '#4682B4'
                            }}>
                                {item.type === 'book' ? 'Book' : 'Course'}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[
            styles.container,
            isDarkMode ? styles.darkContainer : null
        ]}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={isDarkMode ? '#000000' : '#FFFFFF'}
            />

            {/* Header with back button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={goBack} style={styles.backButton}>
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={isDarkMode ? '#FFFFFF' : '#000000'}
                    />
                </TouchableOpacity>
                <Text style={[
                    styles.headerTitle,
                    isDarkMode ? styles.darkText : null
                ]}>
                    Search
                </Text>
            </View>

            {/* Search input */}
            <View style={styles.searchInputContainer}>
                <View style={[
                    styles.searchBar,
                    isDarkMode ? styles.darkSearchBar : null
                ]}>
                    <Ionicons
                        name="search"
                        size={20}
                        color="#888888"
                        style={styles.searchIcon}
                    />
                    <TextInput
                        style={[
                            styles.searchInput,
                            isDarkMode ? styles.darkSearchInput : null
                        ]}
                        placeholder="Search for books and courses..."
                        placeholderTextColor="#888888"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                        autoFocus
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={clearSearch}>
                            <Ionicons name="close-circle" size={20} color="#888888" />
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={handleSearch}
                >
                    <Text style={styles.searchButtonText}>Search</Text>
                </TouchableOpacity>
            </View>

            {/* Filter tabs */}
            <View style={styles.filterContainerWrapper}>
                <Text style={[styles.filterTitle, isDarkMode && styles.darkText]}>
                    Browse Content
                </Text>
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[
                            styles.filterTab,
                            searchType === 'all' ? styles.activeFilterTab : null
                        ]}
                        onPress={() => {
                            setSearchType('all');
                            fetchAllItems();
                        }}
                    >
                        <Ionicons
                            name="grid-outline"
                            size={14}
                            color={searchType === 'all' ? '#FFFFFF' : '#666666'}
                            style={styles.filterIcon}
                        />
                        <Text style={[
                            styles.filterTabText,
                            searchType === 'all' ? styles.activeFilterTabText : null
                        ]}>
                            All
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.filterTab,
                            searchType === 'courses' ? styles.activeFilterTab : null
                        ]}
                        onPress={() => {
                            setSearchType('courses');
                            fetchAllCourses();
                        }}
                    >
                        <Ionicons
                            name="school-outline"
                            size={14}
                            color={searchType === 'courses' ? '#FFFFFF' : '#666666'}
                            style={styles.filterIcon}
                        />
                        <Text style={[
                            styles.filterTabText,
                            searchType === 'courses' ? styles.activeFilterTabText : null
                        ]}>
                            Courses
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.filterTab,
                            searchType === 'books' ? styles.activeFilterTab : null
                        ]}
                        onPress={() => {
                            setSearchType('books');
                            fetchAllBooks();
                        }}
                    >
                        <Ionicons
                            name="book-outline"
                            size={14}
                            color={searchType === 'books' ? '#FFFFFF' : '#666666'}
                            style={styles.filterIcon}
                        />
                        <Text style={[
                            styles.filterTabText,
                            searchType === 'books' ? styles.activeFilterTabText : null
                        ]}>
                            Books
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Results area */}
            <View style={styles.resultsContainer}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#3366FF" />
                        <Text style={[
                            styles.loadingText,
                            isDarkMode ? styles.darkText : null
                        ]}>
                            {searchQuery ? 'Searching...' : 'Loading...'}
                        </Text>
                    </View>
                ) : searchResults.length > 0 ? (
                    <FlatList
                        data={searchResults}
                        renderItem={renderSearchItem}
                        keyExtractor={item => `${item.type}-${item.id}`}
                        contentContainerStyle={styles.resultsList}
                        showsVerticalScrollIndicator={false}
                        initialNumToRender={10}
                        maxToRenderPerBatch={20}
                    />
                ) : (
                    <View style={styles.noResultsContainer}>
                        <Ionicons name="search-outline" size={60} color="#CCCCCC" />
                        <Text style={[
                            styles.noResultsText,
                            isDarkMode ? styles.darkText : null
                        ]}>
                            No results found
                        </Text>
                        <Text style={styles.noResultsSubtitle}>
                            Try different keywords or browse by category
                        </Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    darkContainer: {
        backgroundColor: '#121212',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 16,
    },
    darkText: {
        color: '#FFFFFF',
    },
    searchInputContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 16,
        alignItems: 'center',
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginRight: 8,
    },
    darkSearchBar: {
        backgroundColor: '#2A2A2A',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333333',
    },
    darkSearchInput: {
        color: '#FFFFFF',
    },
    searchButton: {
        backgroundColor: '#3366FF',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    searchButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    filterContainerWrapper: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    filterTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333333',
    },
    filterContainer: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    filterTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
    },
    filterIcon: {
        marginRight: 4,
    },
    activeFilterTab: {
        backgroundColor: '#3366FF',
    },
    filterTabText: {
        fontSize: 14,
        color: '#666666',
    },
    activeFilterTabText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    resultsContainer: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
    },
    resultsList: {
        padding: 16,
    },
    noResultsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    noResultsText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    noResultsSubtitle: {
        fontSize: 14,
        color: '#888888',
        textAlign: 'center',
    },
    searchResultItem: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    darkSearchResultItem: {
        backgroundColor: '#1E1E1E',
    },
    searchItemImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: 12,
    },
    searchItemImage: {
        width: '100%',
        height: '100%',
    },
    searchItemPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    searchItemContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    searchItemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    searchItemAuthor: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 4,
    },
    searchItemDescription: {
        fontSize: 12,
        color: '#888888',
        marginBottom: 8,
    },
    searchItemFooter: {
        marginTop: 4,
    },
    searchItemMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginTop: 4,
    },
    searchItemRating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
    },
    searchItemRatingText: {
        fontSize: 12,
        color: '#888888',
        marginLeft: 4,
    },
    priceContainer: {
        marginRight: 8,
        padding: 2,
    },
    searchItemPrice: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2A9D4A',
    },
    searchItemFreePrice: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2A9D4A',
    },
    courseInfoContainer: {
        flexDirection: 'row',
        marginRight: 8,
    },
    levelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
    },
    durationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    courseInfoText: {
        fontSize: 10,
        color: '#777777',
        marginLeft: 3,
    },
    searchItemTypeTag: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
    },
    categoryBadge: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingVertical: 3,
        paddingHorizontal: 6,
    },
    categoryText: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: 'bold',
        textAlign: 'center',
    },
}); 