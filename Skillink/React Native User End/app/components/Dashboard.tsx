import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    TextInput,
    Image,
    StatusBar,
    Dimensions,
    FlatList,
    Animated,
    NativeSyntheticEvent,
    NativeScrollEvent,
    Easing,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import {
    collection,
    getDocs,
    limit,
    orderBy,
    startAt,
    endAt,
    where,
    query as firestoreQuery,
    DocumentData
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Define slide item type - remove offer properties
interface SlideItem {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    color: string;
    gradientColors: string[];
    imageUrl?: string;
}

// Define course/book item type
interface CourseItem {
    id: string;
    title: string;
    author: string;
    rating: number;
    imageUrl?: string;
    category: string;
    type: 'course' | 'book';
    level?: string;
    duration?: string;
}

// Create a type for category data
interface CategoryCourses {
    name: string;
    courses: CourseItem[];
}

// Define the type for the Ionicons name prop
type IconName = ComponentProps<typeof Ionicons>['name'];

// Add a prop to customize the component's rendering
interface DashboardProps {
    isNested?: boolean;
}

const Dashboard = ({ isNested = false }: DashboardProps) => {
    const { user, isLoggedIn, loading } = useAuth();
    const { theme, isDarkMode } = useTheme();
    const currentPath = usePathname();
    const [storageUsed, setStorageUsed] = useState('2.8');
    const [totalStorage, setTotalStorage] = useState('10');
    const [firstName, setFirstName] = useState('');
    const [activeSlide, setActiveSlide] = useState(0);
    const [isManualScrolling, setIsManualScrolling] = useState(false);
    const [showNotificationBanner, setShowNotificationBanner] = useState(true);

    // Notification states
    const [notifications, setNotifications] = useState<CourseItem[]>([]);
    const [hasNewNotifications, setHasNewNotifications] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);

    // State for slider data from Firebase
    const [sliderData, setSliderData] = useState<SlideItem[]>([]);
    const [isBannerLoading, setIsBannerLoading] = useState(true);

    // Search functionality
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<CourseItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    // Refs for slider
    const sliderRef = useRef<FlatList<SlideItem>>(null);
    const scrollX = useRef(new Animated.Value(0)).current;
    const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);

    // Animation values for rotate effect
    const rotateAnim = useRef(new Animated.Value(0)).current;

    // Calculated dimensions for centering
    const sliderItemWidth = width - 60; // Slightly narrower for better centering
    const sliderItemMargin = 10;

    // Add state for editing courses
    const [editingCourses, setEditingCourses] = useState<CourseItem[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);

    // Replace the single category state with a dynamic categories state
    const [categoryData, setCategoryData] = useState<CategoryCourses[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // Add code to fetch categories for the horizontal category buttons
    const [categories, setCategories] = useState<string[]>([]);

    // Add state for selected categories
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    // Add state for original unfiltered category data
    const [originalCategoryData, setOriginalCategoryData] = useState<CategoryCourses[]>([]);

    // Fetch banners from Firebase
    useEffect(() => {
        const fetchBanners = async () => {
            setIsBannerLoading(true);
            try {
                const bannersCollection = collection(db, "banners");
                const bannersQuery = firestoreQuery(bannersCollection, orderBy("position", "asc"));
                const snapshot = await getDocs(bannersQuery);

                if (!snapshot.empty) {
                    const bannersList: SlideItem[] = [];

                    snapshot.forEach((doc) => {
                        const data = doc.data();

                        bannersList.push({
                            id: doc.id,
                            title: data.title || 'Banner',
                            subtitle: data.subheading || data.description || '',
                            // Use heading as subtitle if no subheading
                            icon: 'images', // Default icon
                            color: 'linear-gradient(135deg, #6e8efb, #a777e3)', // Default gradient
                            gradientColors: ['#6e8efb', '#a777e3'], // Default colors
                            imageUrl: data.imageUrl // Store the image URL from Firebase
                        });
                    });

                    // Replace the slider data with Firebase data
                    setSliderData(bannersList);
                    console.log(`Loaded ${bannersList.length} banners from Firebase`);
                } else {
                    console.log("No banners found in Firebase");
                    setSliderData([]);
                }
            } catch (error) {
                console.error("Error fetching banners:", error);
                setSliderData([]);
            } finally {
                setIsBannerLoading(false);
            }
        };

        fetchBanners();
    }, []);

    // Start rotate animation
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 8000,
                    useNativeDriver: true,
                    easing: Easing.linear
                }),
                Animated.timing(rotateAnim, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true
                })
            ])
        ).start();
    }, []);

    // Auto-scroll function with improved looping
    const startAutoScroll = useCallback(() => {
        // Don't start auto-scroll if user is manually scrolling or if we have no slides
        if (isManualScrolling || sliderData.length === 0) return;

        // Clear any existing auto-scroll timer
        if (autoScrollTimer.current) {
            clearTimeout(autoScrollTimer.current);
        }

        // Set a new interval for auto-scrolling
        autoScrollTimer.current = setTimeout(() => {
            // Don't auto-scroll if user is manually scrolling
            if (isManualScrolling) return;

            const nextSlide = (activeSlide + 1) % sliderData.length;

            if (sliderRef.current) {
                // If moving from last slide to first, use scrollToOffset
                if (nextSlide === 0) {
                    sliderRef.current.scrollToOffset({
                        offset: 0,
                        animated: true
                    });
                } else {
                    // For all other transitions, use scrollToIndex
                    sliderRef.current.scrollToIndex({
                        index: nextSlide,
                        animated: true,
                        viewPosition: 0.5
                    });
                }
            }

            setActiveSlide(nextSlide);
        }, 2500);
    }, [activeSlide, isManualScrolling, sliderData.length]);

    // Start auto-scroll for slider
    useEffect(() => {
        startAutoScroll();
        return () => {
            if (autoScrollTimer.current) {
                clearTimeout(autoScrollTimer.current);
            }
        };
    }, [startAutoScroll, sliderData]); // Added sliderData as dependency to restart when data changes

    // Handler for when user starts dragging
    const handleScrollBegin = () => {
        setIsManualScrolling(true);

        // Clear auto-scroll when user starts manual scrolling
        if (autoScrollTimer.current) {
            clearTimeout(autoScrollTimer.current);
        }
    };

    // Handler for when touch ends on slider (separate from momentum scrolling)
    const handleTouchEnd = () => {
        // Add a slight delay before re-enabling auto-scroll
        // This allows other handlers to complete first
        setTimeout(() => {
            if (!isManualScrolling) return;
            setIsManualScrolling(false);
            startAutoScroll();
        }, 50);
    };

    // Helper function to reset auto-scroll timer
    const resetAutoScroll = () => {
        if (autoScrollTimer.current) {
            clearTimeout(autoScrollTimer.current);
        }
        startAutoScroll();
    };

    // Fetch user details
    useEffect(() => {
        if (user) {
            // Extract first name from full name
            if (user.name) {
                const firstNameOnly = user.name.split(' ')[0];
                setFirstName(firstNameOnly);
            }

            // Mock storage values - would come from backend in real app
            setStorageUsed('2.8');
            setTotalStorage('10');
        }
    }, [user]);

    // Get first letter of name or email for avatar
    const getInitial = () => {
        if (user?.name && user.name.length > 0) {
            return user.name.charAt(0).toUpperCase();
        } else if (user?.email && user.email.length > 0) {
            return user.email.charAt(0).toUpperCase();
        }
        return 'U';
    };

    const navigateToProfile = () => {
        router.push('/profile');
    };

    const navigateToMyLearning = () => {
        router.push('/learning');
    };

    const navigateToWishlist = () => {
        router.push('/wishlist');
    };

    // Update the renderSliderItem function
    const renderSliderItem = ({ item, index }: { item: SlideItem; index: number }) => {
        // Calculate animation values for current item
        const inputRange = [
            (index - 1) * (sliderItemWidth + sliderItemMargin * 2),
            index * (sliderItemWidth + sliderItemMargin * 2),
            (index + 1) * (sliderItemWidth + sliderItemMargin * 2)
        ];

        const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.9, 1, 0.9],
            extrapolate: 'clamp'
        });

        // Determine if we should show image from Firebase or use gradient background
        const useImageBackground = !!item.imageUrl;

        return (
            <Animated.View
                style={[
                    styles.sliderItemContainer,
                    { transform: [{ scale }] }
                ]}
            >
                <View style={[styles.sliderItem, { padding: 0 }]}>
                    {useImageBackground ? (
                        // Image-only display without any overlays
                        <Image
                            source={{ uri: item.imageUrl }}
                            style={styles.bannerImageFull}
                            resizeMode="cover"
                        />
                    ) : (
                        // Use gradient background for default slides (fallback)
                        <View style={[
                            StyleSheet.absoluteFillObject,
                            { backgroundColor: item.gradientColors[0] }
                        ]} />
                    )}
                </View>
            </Animated.View>
        );
    };

    // Handler for when scrolling ends
    const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        // Calculate current slide index based on scroll position
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const slideWidth = event.nativeEvent.layoutMeasurement.width;
        const newIndex = Math.round(contentOffsetX / slideWidth);

        // Handle bounds checking
        if (newIndex < 0 || newIndex >= sliderData.length) {
            // If out of bounds, reset to first slide
            if (sliderRef.current) {
                sliderRef.current.scrollToOffset({
                    offset: 0,
                    animated: false
                });
            }
            setActiveSlide(0);
        } else {
            setActiveSlide(newIndex);

            // If we've reached the last slide, wait a moment then loop back to first
            if (newIndex === sliderData.length - 1) {
                if (autoScrollTimer.current) {
                    clearTimeout(autoScrollTimer.current);
                }

                // Use a shorter timeout for better UX
                autoScrollTimer.current = setTimeout(() => {
                    if (sliderRef.current && !isManualScrolling) {
                        // Use a smoother transition to the first slide
                        sliderRef.current.scrollToOffset({
                            offset: 0,
                            animated: true
                        });
                        setActiveSlide(0);
                    }
                }, 2000);
            }
        }

        // Always reset manual scrolling flag and restart auto-scroll
        setIsManualScrolling(false);
        startAutoScroll();
    };

    // Function to search Firebase for courses and books
    const searchCoursesAndBooks = async (searchText: string) => {
        if (!searchText.trim()) {
            return [];
        }

        try {
            // Search in courses collection
            const courseRef = collection(db, 'courses');
            const searchLower = searchText.toLowerCase();

            // Create a query against the collection
            const q = firestoreQuery(
                courseRef,
                where('titleLowerCase', '>=', searchLower),
                where('titleLowerCase', '<=', searchLower + '\uf8ff'),
                limit(10)
            );

            const querySnapshot = await getDocs(q);
            const coursesResults: CourseItem[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                coursesResults.push({
                    id: doc.id,
                    title: data.title || '',
                    author: data.author || data.instructor || 'Course Instructor',
                    rating: data.rating || 4.5,
                    imageUrl: data.imageUrl,
                    category: data.category || 'Course',
                    type: 'course',
                    level: data.level || 'All Levels',
                    duration: data.duration || 'Self-paced'
                });
            });

            // Also search in books collection
            const booksRef = collection(db, 'books');
            const booksQ = firestoreQuery(
                booksRef,
                where('titleLowerCase', '>=', searchLower),
                where('titleLowerCase', '<=', searchLower + '\uf8ff'),
                limit(10)
            );

            const booksSnapshot = await getDocs(booksQ);
            const booksResults: CourseItem[] = [];

            booksSnapshot.forEach((doc) => {
                const data = doc.data();
                booksResults.push({
                    id: doc.id,
                    title: data.title || '',
                    author: data.author || 'Course Instructor',
                    rating: data.rating || 4.3,
                    imageUrl: data.imageUrl,
                    category: data.category || 'Books',
                    type: 'book',
                    level: data.level || 'All Levels',
                    duration: data.duration || 'Self-paced'
                });
            });

            // Combine and sort results
            return [...coursesResults, ...booksResults];
        } catch (error) {
            console.error("Error searching courses and books: ", error);
            return [];
        }
    };

    // Function to handle search 
    const handleSearch = useCallback(async (text: string) => {
        if (!text.trim()) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        setIsSearching(true);
        setShowSearchResults(true);

        try {
            const results = await searchCoursesAndBooks(text);
            setSearchResults(results);

            // Add to recent searches if we got results
            if (results.length > 0 && !recentSearches.includes(text)) {
                setRecentSearches(prev => [text, ...prev.slice(0, 4)]);
            }
        } catch (error) {
            console.error("Error in search:", error);
        } finally {
            setIsSearching(false);
        }
    }, [recentSearches]);

    // Debounce search to avoid too many requests
    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchQuery) {
                handleSearch(searchQuery);
            }
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery, handleSearch]);

    // Function to clear search
    const clearSearch = () => {
        setSearchQuery('');
        setShowSearchResults(false);
    };

    // Function to handle search item selection
    const handleSearchItemSelect = (item: CourseItem) => {
        // Navigate to course or book detail
        if (item.type === 'course') {
            router.push(`/course/${item.id}`);
        } else {
            router.push(`/book/${item.id}`);
        }
        clearSearch();
    };

    // Render search result item
    const renderSearchResultItem = ({ item }: { item: CourseItem }) => (
        <TouchableOpacity
            style={styles.searchResultItem}
            onPress={() => handleSearchItemSelect(item)}
        >
            <View style={styles.searchResultImageContainer}>
                {item.imageUrl ? (
                    <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.searchResultImage}
                    />
                ) : (
                    <View style={[
                        styles.searchResultImagePlaceholder,
                        { backgroundColor: item.type === 'course' ? '#3366FF20' : '#FF336620' }
                    ]}>
                        <Ionicons
                            name={item.type === 'course' ? 'school' : 'book'}
                            size={24}
                            color={item.type === 'course' ? "#3366FF" : "#FF3366"}
                        />
                    </View>
                )}
            </View>
            <View style={styles.searchResultContent}>
                <Text
                    style={[styles.searchResultTitle, isDarkMode && styles.darkText]}
                    numberOfLines={1}
                >
                    {item.title}
                </Text>
                <Text
                    style={styles.searchResultAuthor}
                    numberOfLines={1}
                >
                    {item.author}
                </Text>
                <View style={styles.searchResultMeta}>
                    <View style={styles.searchResultRating}>
                        <Ionicons name="star" size={12} color="#FFD700" />
                        <Text style={styles.searchResultRatingText}>{item.rating.toFixed(1)}</Text>
                    </View>
                    <View style={[
                        styles.searchResultType,
                        { backgroundColor: item.type === 'course' ? '#3366FF20' : '#FF336620' }
                    ]}>
                        <Text style={[
                            styles.searchResultTypeText,
                            { color: item.type === 'course' ? '#3366FF' : '#FF3366' }
                        ]}>
                            {item.type === 'course' ? 'Course' : 'Book'}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    // Navigate to search page
    const navigateToSearch = () => {
        router.push('/search');
    };

    // Add a function to fetch top editing courses from Firebase
    useEffect(() => {
        const fetchEditingCourses = async () => {
            setLoadingCourses(true);
            try {
                const coursesRef = collection(db, "courses");
                const editingCoursesQuery = firestoreQuery(
                    coursesRef,
                    where("category", "==", "Editing")
                );

                const snapshot = await getDocs(editingCoursesQuery);
                let coursesList: CourseItem[] = [];

                snapshot.forEach((doc) => {
                    const data = doc.data();
                    coursesList.push({
                        id: doc.id,
                        title: data.title || '',
                        author: data.author || data.instructor || 'Course Instructor',
                        rating: data.rating || 4.5,
                        imageUrl: data.imageUrl,
                        category: data.category || 'Editing',
                        type: 'course',
                        level: data.level || 'All Levels',
                        duration: data.duration || 'Self-paced'
                    });
                });

                // Sort by rating manually in memory (to avoid need for index)
                coursesList = coursesList
                    .sort((a, b) => b.rating - a.rating)
                    .slice(0, 5);

                setEditingCourses(coursesList);
                console.log(`Loaded ${coursesList.length} editing courses`);
            } catch (error) {
                console.error("Error fetching editing courses:", error);
            } finally {
                setLoadingCourses(false);
            }
        };

        fetchEditingCourses();
    }, []);

    // Update the fetchCategoriesAndCourses function to store original data
    useEffect(() => {
        const fetchCategoriesAndCourses = async () => {
            setLoadingCategories(true);
            try {
                // First, get all unique categories from courses
                const coursesRef = collection(db, "courses");
                const coursesSnapshot = await getDocs(coursesRef);

                // Create a map to store categories and their courses
                const categoriesMap = new Map<string, CourseItem[]>();

                // Process all courses and group them by category
                coursesSnapshot.forEach((doc) => {
                    const data = doc.data();
                    const category = data.category || 'Uncategorized';

                    const courseItem: CourseItem = {
                        id: doc.id,
                        title: data.title || '',
                        author: data.author || data.instructor || 'Course Instructor',
                        rating: data.rating || 4.5,
                        imageUrl: data.imageUrl,
                        category: category,
                        type: 'course',
                        level: data.level || 'All Levels',
                        duration: data.duration || 'Self-paced'
                    };

                    // Add course to its category in the map
                    if (!categoriesMap.has(category)) {
                        categoriesMap.set(category, []);
                    }
                    categoriesMap.get(category)?.push(courseItem);
                });

                // Convert map to array and sort courses by rating
                const categoriesArray: CategoryCourses[] = [];
                categoriesMap.forEach((courses, name) => {
                    // Sort courses by rating (highest first) - doing this in memory to avoid index issues
                    const sortedCourses = courses.sort((a, b) => b.rating - a.rating).slice(0, 5);
                    categoriesArray.push({
                        name,
                        courses: sortedCourses
                    });
                });

                // Sort categories alphabetically
                categoriesArray.sort((a, b) => a.name.localeCompare(b.name));

                // Store the original data
                setOriginalCategoryData(categoriesArray);
                setCategoryData(categoriesArray);
                console.log(`Loaded ${categoriesArray.length} categories`);
            } catch (error) {
                console.error("Error fetching categories and courses:", error);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategoriesAndCourses();
    }, []);

    // Add a function to fetch all categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // First, get all unique categories from courses
                const coursesRef = collection(db, "courses");
                const coursesSnapshot = await getDocs(coursesRef);

                // Create a set to store unique categories
                const uniqueCategories = new Set<string>();

                // Process all courses and collect categories
                coursesSnapshot.forEach((doc) => {
                    const data = doc.data();
                    const category = data.category || 'Uncategorized';
                    uniqueCategories.add(category);
                });

                // Convert set to array and sort alphabetically
                const categoriesArray = Array.from(uniqueCategories).sort();
                setCategories(categoriesArray);
                console.log(`Loaded ${categoriesArray.length} unique categories`);
            } catch (error) {
                console.error("Error fetching categories:", error);
                setCategories([]);
            }
        };

        fetchCategories();
    }, []);

    // Add a helper function to capitalize first letter only
    const capitalizeFirstLetter = (str: string) => {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    // Fix the icon type issue by returning valid IconName values
    const getCategoryIcon = (category: string): IconName => {
        // Return valid Ionicons names for each category
        switch (category.toLowerCase()) {
            case 'design':
                return 'brush';
            case 'development':
                return 'code-slash';
            case 'editing':
                return 'cut';
            case 'photography':
                return 'camera';
            case 'marketing':
                return 'megaphone';
            case 'business':
                return 'briefcase';
            case 'music':
                return 'musical-notes';
            default:
                return 'book';
        }
    };

    // Add a function to handle category selection
    const handleCategorySelect = (category: string) => {
        setSelectedCategories(prev => {
            // If category is already selected, remove it (toggle)
            if (prev.includes(category)) {
                // Deselect the category and show all categories
                setCategoryData(originalCategoryData);
                return [];
            } else {
                // Select only this category (replace previous selection)
                const filteredCategories = originalCategoryData.filter(cat =>
                    cat.name === category
                );
                setCategoryData(filteredCategories);

                // Return only the newly selected category
                return [category];
            }
        });
    };

    // Add function to check for new courses
    useEffect(() => {
        const checkForNewCourses = async () => {
            try {
                // Get last check time from storage or use current time if not available
                const now = new Date();
                let checkTime = lastCheckTime;

                if (!checkTime) {
                    // If first time, use current time minus 7 days
                    checkTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    setLastCheckTime(now);
                }

                // Query for courses created after the last check time
                const coursesRef = collection(db, "courses");
                const newCoursesQuery = firestoreQuery(
                    coursesRef,
                    where("createdAt", ">", checkTime),
                    orderBy("createdAt", "desc"),
                    limit(10)
                );

                const snapshot = await getDocs(newCoursesQuery);
                const newCourses: CourseItem[] = [];

                snapshot.forEach((doc) => {
                    const data = doc.data();
                    newCourses.push({
                        id: doc.id,
                        title: data.title || '',
                        author: data.author || data.instructor || 'Course Instructor',
                        rating: data.rating || 4.5,
                        imageUrl: data.imageUrl,
                        category: data.category || 'Course',
                        type: 'course',
                        level: data.level || 'All Levels',
                        duration: data.duration || 'Self-paced'
                    });
                });

                if (newCourses.length > 0) {
                    setNotifications(newCourses);
                    setHasNewNotifications(true);
                }

                // Update the last check time to now
                setLastCheckTime(now);

            } catch (error) {
                console.error("Error checking for new courses:", error);
            }
        };

        checkForNewCourses();

        // Check for new courses every 30 minutes
        const intervalId = setInterval(checkForNewCourses, 30 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, []);

    // Function to handle notification icon press
    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);

        // If opening notifications, mark as read
        if (!showNotifications) {
            setHasNewNotifications(false);
        }
    };

    // Function to navigate to a course from notification
    const navigateToCourse = (courseId: string) => {
        setShowNotifications(false);
        router.push(`/course/${courseId}`);
    };

    // If isNested is true, only render the bottom navigation part
    if (isNested) {
        return (
            <View style={[styles.bottomNavContainer, isDarkMode && styles.darkBottomNav]}>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/')}>
                    <Ionicons name="home" size={24} color={currentPath === '/' ? "#3366FF" : isDarkMode ? "#AAAAAA" : "#888"} />
                    <Text style={currentPath === '/' ? styles.navTextActive : [styles.navText, isDarkMode && styles.darkNavText]}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={navigateToSearch}>
                    <Ionicons name="search" size={24} color={currentPath === '/search' ? "#3366FF" : isDarkMode ? "#AAAAAA" : "#888"} />
                    <Text style={currentPath === '/search' ? styles.navTextActive : [styles.navText, isDarkMode && styles.darkNavText]}>Search</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={navigateToMyLearning}>
                    <Ionicons name="play-circle" size={24} color={currentPath === '/learning' ? "#3366FF" : isDarkMode ? "#AAAAAA" : "#888"} />
                    <Text style={currentPath === '/learning' ? styles.navTextActive : [styles.navText, isDarkMode && styles.darkNavText]}>My learning</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={navigateToWishlist}>
                    <Ionicons name="heart" size={24} color={currentPath === '/wishlist' ? "#3366FF" : isDarkMode ? "#AAAAAA" : "#888"} />
                    <Text style={currentPath === '/wishlist' ? styles.navTextActive : [styles.navText, isDarkMode && styles.darkNavText]}>Wishlist</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={navigateToProfile}>
                    <Ionicons name="person" size={24} color={currentPath === '/profile' ? "#3366FF" : isDarkMode ? "#AAAAAA" : "#888"} />
                    <Text style={currentPath === '/profile' ? styles.navTextActive : [styles.navText, isDarkMode && styles.darkNavText]}>Account</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Otherwise, render the full dashboard with all its content
    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.darkBackground]}>
            <View style={styles.header}>
                <View style={styles.headerLeftSection}>
                    <Text style={[styles.welcomeMessage, isDarkMode && styles.darkText]}>
                        Welcome
                        {firstName && (
                            <Text style={[styles.userName, isDarkMode && styles.userNameDark]}>
                                {' ' + firstName + '!'}
                            </Text>
                        )}
                    </Text>
                </View>
                <View style={styles.headerRightSection}>
                    <TouchableOpacity onPress={navigateToProfile}>
                        {user?.photoURL ? (
                            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatarPlaceholder, isDarkMode && styles.darkAvatarPlaceholder]}>
                                <Text style={styles.avatarText}>{getInitial()}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.searchContainer, isDarkMode && styles.darkSearchContainer]}
                onPress={navigateToSearch}
                activeOpacity={0.7}
            >
                <View style={[styles.searchInputContainer, isDarkMode && styles.darkSearchInputContainer]}>
                    <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
                    <Text style={[styles.searchPlaceholder, isDarkMode && styles.darkSearchPlaceholder]}>
                        Search courses and books...
                    </Text>
                </View>
            </TouchableOpacity>

            <ScrollView style={styles.content}>
                {/* Slider Section with centered wrapper */}
                <View style={styles.sliderOuterContainer}>
                    <View style={styles.sliderContainer}>
                        {isBannerLoading ? (
                            <ActivityIndicator size="large" color="#3366FF" />
                        ) : (
                            <Animated.FlatList
                                ref={sliderRef}
                                data={sliderData}
                                renderItem={renderSliderItem}
                                keyExtractor={item => item.id}
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                snapToInterval={sliderItemWidth + (sliderItemMargin * 2)}
                                decelerationRate="fast"
                                contentContainerStyle={styles.sliderContentContainer}
                                onScroll={Animated.event(
                                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                                    { useNativeDriver: true }
                                )}
                                onScrollBeginDrag={handleScrollBegin}
                                onScrollEndDrag={handleTouchEnd}
                                onMomentumScrollEnd={handleScrollEnd}
                                getItemLayout={(data, index) => ({
                                    length: sliderItemWidth + (sliderItemMargin * 2),
                                    offset: (sliderItemWidth + (sliderItemMargin * 2)) * index,
                                    index,
                                })}
                                initialScrollIndex={0}
                                maxToRenderPerBatch={3}
                                windowSize={5}
                                removeClippedSubviews={false}
                                contentInsetAdjustmentBehavior="automatic"
                                style={styles.flatListStyle}
                            />
                        )}
                    </View>
                </View>

                {showNotificationBanner && (
                    <TouchableOpacity
                        style={styles.notificationBanner}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.notificationText}>Future-ready skills on your schedule</Text>
                        <TouchableOpacity
                            onPress={() => setShowNotificationBanner(false)}
                            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                        >
                            <Ionicons name="close" size={18} color="#333" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Categories</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>See all</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
                    {categories.length > 0 ? (
                        categories.map((category) => (
                            <TouchableOpacity
                                key={category}
                                style={[
                                    styles.categoryButton,
                                    isDarkMode && styles.darkCategoryButton,
                                    selectedCategories.includes(category) && styles.selectedCategoryButton,
                                    selectedCategories.includes(category) && isDarkMode && styles.darkSelectedCategoryButton
                                ]}
                                onPress={() => handleCategorySelect(category)}
                            >
                                <Ionicons
                                    name={getCategoryIcon(category)}
                                    size={24}
                                    color={selectedCategories.includes(category) ?
                                        "#FFFFFF" :
                                        isDarkMode ? "#5C7CFA" : "#3366FF"}
                                    style={styles.categoryIcon}
                                />
                                <Text
                                    style={[
                                        styles.categoryText,
                                        isDarkMode && styles.darkCategoryText,
                                        selectedCategories.includes(category) && styles.selectedCategoryText
                                    ]}
                                >
                                    {capitalizeFirstLetter(category)}
                                </Text>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={[styles.categoryButton, isDarkMode && styles.darkCategoryButton]}>
                            <Text style={[styles.categoryText, isDarkMode && styles.darkCategoryText]}>Loading categories...</Text>
                        </View>
                    )}
                </ScrollView>

                {/* Replace section and courses with dynamically generated categories */}
                {loadingCategories ? (
                    <View style={styles.loadingCategoriesContainer}>
                        <ActivityIndicator size="large" color="#3366FF" />
                        <Text style={styles.loadingCategoriesText}>Loading courses...</Text>
                    </View>
                ) : categoryData.length > 0 ? (
                    // Map through each category and render a section for each
                    categoryData.map((category) => (
                        <View key={category.name}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
                                    Top courses in <Text style={styles.highlightText}>{capitalizeFirstLetter(category.name)}</Text>
                                </Text>
                                <TouchableOpacity>
                                    <Text style={styles.seeAllText}>See all</Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.coursesContainer}>
                                {category.courses.length > 0 ? (
                                    category.courses.map((course) => (
                                        <TouchableOpacity
                                            key={course.id}
                                            style={[styles.courseCard, isDarkMode && styles.darkCard]}
                                            onPress={() => router.push(`/course/${course.id}`)}
                                        >
                                            <View style={styles.courseImageContainer}>
                                                {course.imageUrl ? (
                                                    <Image
                                                        source={{ uri: course.imageUrl }}
                                                        style={styles.courseImage}
                                                        resizeMode="cover"
                                                    />
                                                ) : (
                                                    <View style={[styles.courseImagePlaceholder, isDarkMode && styles.darkCoursePlaceholder]}>
                                                        <Ionicons
                                                            name={getCategoryIcon(course.category)}
                                                            size={40}
                                                            color={isDarkMode ? "#5C7CFA" : "#3366FF"}
                                                        />
                                                    </View>
                                                )}
                                            </View>
                                            <Text style={[styles.courseTitle, isDarkMode && styles.darkText]} numberOfLines={2}>{course.title}</Text>
                                            <Text style={[styles.courseInstructor, isDarkMode && styles.darkCourseInstructor]}>
                                                {course.author !== "Unknown" ? `by ${course.author}` : "by Course Instructor"}
                                            </Text>
                                            <View style={styles.courseMetaContainer}>
                                                <View style={styles.courseRating}>
                                                    <Ionicons name="star" size={16} color="#FFD700" />
                                                    <Text style={[styles.courseRatingText, isDarkMode && styles.darkCourseInstructor]}>
                                                        {course.rating.toFixed(1)}
                                                    </Text>
                                                </View>
                                                <View style={styles.courseBadge}>
                                                    <Text style={styles.courseBadgeText}>{capitalizeFirstLetter(course.category)}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.courseLevelContainer}>
                                                <Ionicons
                                                    name="school-outline"
                                                    size={14}
                                                    color={isDarkMode ? "#AAAAAA" : "#777"}
                                                />
                                                <Text style={[styles.courseLevelText, isDarkMode && styles.darkCourseInstructor]}>
                                                    {course.level || "All Levels"}
                                                </Text>
                                                <Ionicons
                                                    name="time-outline"
                                                    size={14}
                                                    color={isDarkMode ? "#AAAAAA" : "#777"}
                                                    style={{ marginLeft: 8 }}
                                                />
                                                <Text style={[styles.courseLevelText, isDarkMode && styles.darkCourseInstructor]}>
                                                    {(() => {
                                                        if (!course.duration) return "Self-paced";
                                                        // If duration is just a number, append "weeks"
                                                        if (/^\d+$/.test(course.duration)) {
                                                            return `${course.duration} weeks`;
                                                        }
                                                        return course.duration;
                                                    })()}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <View style={styles.noCoursesContainer}>
                                        <Text style={[styles.noCoursesText, isDarkMode && styles.darkText]}>No courses found</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    ))
                ) : (
                    <View style={styles.noCategoriesContainer}>
                        <Text style={[styles.noCategoriesText, isDarkMode && styles.darkText]}>No course categories available</Text>
                    </View>
                )}
            </ScrollView>

            <View style={[styles.bottomNavContainer, isDarkMode && styles.darkBottomNav]}>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/')}>
                    <Ionicons name="home" size={24} color={currentPath === '/' ? "#3366FF" : isDarkMode ? "#AAAAAA" : "#888"} />
                    <Text style={currentPath === '/' ? styles.navTextActive : [styles.navText, isDarkMode && styles.darkNavText]}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={navigateToSearch}>
                    <Ionicons name="search" size={24} color={currentPath === '/search' ? "#3366FF" : isDarkMode ? "#AAAAAA" : "#888"} />
                    <Text style={currentPath === '/search' ? styles.navTextActive : [styles.navText, isDarkMode && styles.darkNavText]}>Search</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={navigateToMyLearning}>
                    <Ionicons name="play-circle" size={24} color={currentPath === '/learning' ? "#3366FF" : isDarkMode ? "#AAAAAA" : "#888"} />
                    <Text style={currentPath === '/learning' ? styles.navTextActive : [styles.navText, isDarkMode && styles.darkNavText]}>My learning</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={navigateToWishlist}>
                    <Ionicons name="heart" size={24} color={currentPath === '/wishlist' ? "#3366FF" : isDarkMode ? "#AAAAAA" : "#888"} />
                    <Text style={currentPath === '/wishlist' ? styles.navTextActive : [styles.navText, isDarkMode && styles.darkNavText]}>Wishlist</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={navigateToProfile}>
                    <Ionicons name="person" size={24} color={currentPath === '/profile' ? "#3366FF" : isDarkMode ? "#AAAAAA" : "#888"} />
                    <Text style={currentPath === '/profile' ? styles.navTextActive : [styles.navText, isDarkMode && styles.darkNavText]}>Account</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    darkBackground: {
        backgroundColor: '#000000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        zIndex: 10,
    },
    headerLeftSection: {
        flex: 1,
    },
    headerRightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        minWidth: 80,
    },
    welcomeMessage: {
        fontSize: 18,
        color: '#444',
        marginTop: 2,
        fontFamily: 'Inter-Regular',
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3366FF',
        fontFamily: 'Inter-Bold',
    },
    userNameDark: {
        color: '#5C7CFA', // Lighter blue color for dark mode that stands out better
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Inter-Bold',
    },
    darkText: {
        color: '#E0E0E0',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    darkAvatarPlaceholder: {
        backgroundColor: '#323759',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3366FF',
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginTop: 10,
        marginBottom: 15,
    },
    darkSearchContainer: {
        backgroundColor: 'transparent',
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        height: 52,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    darkSearchInputContainer: {
        backgroundColor: '#1A1A1A',
        borderColor: '#333',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchPlaceholder: {
        flex: 1,
        fontSize: 16,
        color: '#888',
        height: '100%',
    },
    darkSearchPlaceholder: {
        color: '#AAAAAA',
    },
    content: {
        flex: 1,
    },
    sliderOuterContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 15,
    },
    sliderContainer: {
        height: 230,
        width: width,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sliderContentContainer: {
        paddingHorizontal: width * 0.05, // 5% of screen width for better centering
        paddingVertical: 15,
        alignItems: 'center',
    },
    sliderItemContainer: {
        width: width - 60, // Slightly narrower than before
        height: 200,
        marginHorizontal: 10,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative', // Ensure relative positioning for absolute children
    },
    sliderItem: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
        position: 'relative',
    },
    notificationBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF9C4',
        padding: 16,
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 10,
        marginBottom: 20,
    },
    notificationText: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    seeAllText: {
        fontSize: 14,
        color: '#3366FF',
    },
    highlightText: {
        color: '#3366FF',
    },
    categoriesContainer: {
        paddingHorizontal: 15,
        marginBottom: 25,
    },
    categoryButton: {
        backgroundColor: '#f0f4ff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 25,
        marginRight: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e6e6ff',
    },
    darkCategoryButton: {
        backgroundColor: '#252836',
        borderColor: '#323759',
        shadowColor: '#000',
        shadowOpacity: 0.2,
    },
    selectedCategoryButton: {
        backgroundColor: '#3366FF',
        borderColor: '#3366FF',
        shadowColor: '#3366FF',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 4,
    },
    darkSelectedCategoryButton: {
        backgroundColor: '#4A5CFF',
        borderColor: '#4A5CFF',
        shadowColor: '#4A5CFF',
    },
    categoryIcon: {
        marginRight: 8,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    darkCategoryText: {
        color: '#f0f0f0',
    },
    selectedCategoryText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    coursesContainer: {
        paddingHorizontal: 15,
        marginBottom: 20,
    },
    courseCard: {
        width: 220,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        marginRight: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    darkCard: {
        backgroundColor: '#121212',
    },
    courseImageContainer: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        marginBottom: 10,
        overflow: 'hidden',
    },
    courseImagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#E0E0FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    darkCoursePlaceholder: {
        backgroundColor: '#1A1A1A',
    },
    courseTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
        height: 42,
    },
    courseInstructor: {
        fontSize: 12,
        color: '#777777',
        marginBottom: 8,
    },
    darkCourseInstructor: {
        color: '#AAAAAA',
    },
    courseMetaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    courseRating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    courseRatingText: {
        fontSize: 12,
        color: '#777777',
        marginLeft: 4,
    },
    courseBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        backgroundColor: '#f0f4ff',
    },
    courseBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#3366FF',
    },
    courseLevelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    courseLevelText: {
        fontSize: 11,
        color: '#777777',
        marginLeft: 4,
    },
    bottomNavContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        backgroundColor: '#FFFFFF',
    },
    darkBottomNav: {
        backgroundColor: '#121212',
        borderTopColor: '#222222',
    },
    navItem: {
        alignItems: 'center',
    },
    navText: {
        fontSize: 12,
        marginTop: 4,
        color: '#888',
    },
    darkNavText: {
        color: '#AAAAAA',
    },
    navTextActive: {
        fontSize: 12,
        marginTop: 4,
        color: '#3366FF',
        fontWeight: '500',
    },
    backgroundBubble: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        opacity: 0.6,
        zIndex: 1,
    },
    pulseOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        backfaceVisibility: 'hidden',
    },
    flatListStyle: {
        width: '100%',
        alignSelf: 'center',
    },
    searchResultsContainer: {
        position: 'absolute',
        top: 80,
        left: 20,
        right: 20,
        bottom: 120,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        zIndex: 1000,
    },
    darkSearchResultsContainer: {
        backgroundColor: 'rgba(18, 18, 18, 0.95)',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginLeft: 10,
    },
    searchResultsList: {
        padding: 16,
    },
    searchResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    searchResultImageContainer: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
        overflow: 'hidden',
    },
    searchResultImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    searchResultImagePlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchResultContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    searchResultTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    searchResultAuthor: {
        fontSize: 12,
        color: '#777777',
        marginBottom: 6,
    },
    searchResultMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    searchResultRating: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    searchResultRatingText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#777777',
        marginLeft: 2,
    },
    searchResultType: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    searchResultTypeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    noResultsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    noResultsText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    noResultsSubtext: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        maxWidth: 250,
    },
    recentSearchesContainer: {
        padding: 20,
        flex: 1,
    },
    recentSearchesTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    recentSearchItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
    },
    recentSearchText: {
        fontSize: 14,
        color: '#333',
        marginLeft: 8,
    },
    noRecentSearchesText: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginTop: 20,
    },
    closeSearchButton: {
        marginVertical: 16,
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#3366FF',
        borderRadius: 8,
        alignSelf: 'center',
        shadowColor: '#3366FF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    closeSearchText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    imageContainer: {
        // Empty or remove
    },
    gradientOverlay: {
        // Empty or remove
    },
    imageTextContainer: {
        // Empty or remove
    },
    courseImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    loadingCoursesContainer: {
        width: 220,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
        marginRight: 15,
    },
    loadingCoursesText: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
    },
    noCoursesContainer: {
        width: 220,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
        marginRight: 15,
    },
    noCoursesText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    loadingCategoriesContainer: {
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingCategoriesText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    noCategoriesContainer: {
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noCategoriesText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    notificationIconContainer: {
        marginRight: 15,
        position: 'relative',
        padding: 5,
    },
    notificationIconWrapper: {
        position: 'relative',
        width: 24,
        height: 24,
    },
    notificationBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#FF3B30',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
    notificationBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    notificationsDropdown: {
        position: 'absolute',
        top: 75,
        right: 20,
        width: 330,
        maxHeight: 450,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        zIndex: 1000,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    darkNotificationsDropdown: {
        backgroundColor: '#1A1A1A',
        borderColor: '#333',
    },
    notificationsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    notificationsHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    notificationsHeaderIcon: {
        marginRight: 8,
    },
    notificationsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    notificationsList: {
        maxHeight: 370,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        alignItems: 'center',
    },
    darkNotificationItem: {
        borderBottomColor: '#2A2A2A',
    },
    notificationImageContainer: {
        width: 54,
        height: 54,
        borderRadius: 10,
        overflow: 'hidden',
        marginRight: 12,
    },
    notificationImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    notificationImagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#E0E0FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    darkNotificationImagePlaceholder: {
        backgroundColor: '#252836',
    },
    notificationContent: {
        flex: 1,
        justifyContent: 'center',
    },
    notificationTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    notificationMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    notificationTag: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 8,
    },
    notificationTagText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    notificationMeta: {
        fontSize: 12,
        color: '#777777',
    },
    darkNotificationMeta: {
        color: '#AAAAAA',
    },
    notificationArrow: {
        marginLeft: 8,
    },
    emptyNotifications: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
    },
    emptyNotificationsText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 12,
        marginBottom: 4,
    },
    emptyNotificationsSubtext: {
        fontSize: 14,
        color: '#777777',
        textAlign: 'center',
    },
    closeNotificationButton: {
        padding: 5,
    },
    bannerImageFull: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
});

export default Dashboard; 