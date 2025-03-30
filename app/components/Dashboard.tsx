import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

function Dashboard() {
    const { user, isLoggedIn, loading } = useAuth();
    const { theme, isDarkMode } = useTheme();
    const [storageUsed, setStorageUsed] = useState('2.8');
    const [totalStorage, setTotalStorage] = useState('10');
    const [firstName, setFirstName] = useState('');

    // Fetch user details
    useEffect(() => {
        if (!loading && !isLoggedIn) {
            router.replace('/authentication/login');
        } else if (user) {
            // Extract first name from full name
            if (user.name) {
                const firstNameOnly = user.name.split(' ')[0];
                setFirstName(firstNameOnly);
            }

            // Mock storage values - would come from backend in real app
            setStorageUsed('2.8');
            setTotalStorage('10');
        }
    }, [isLoggedIn, loading, user]);

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

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.darkBackground]}>
            <View style={styles.header}>
                <Text style={[styles.appName, isDarkMode && styles.darkText]}>Skillink</Text>
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

            <View style={styles.searchContainer}>
                <View style={[styles.searchInputContainer, isDarkMode && styles.darkSearchInputContainer]}>
                    <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, isDarkMode && styles.darkSearchInput]}
                        placeholder="Search courses..."
                        placeholderTextColor="#888"
                    />
                </View>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.learningBanner}>
                    <View style={styles.bannerTextContainer}>
                        <Text style={styles.bannerTitle}>Learning that fits</Text>
                        <Text style={styles.bannerSubtitle}>Skills for your present (and future)</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.notificationBanner}>
                    <Text style={styles.notificationText}>Future-ready skills on your schedule</Text>
                    <Ionicons name="close" size={18} color="#333" />
                </TouchableOpacity>

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Categories</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>See all</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
                    <TouchableOpacity style={styles.categoryButton}>
                        <Text style={styles.categoryText}>Development</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.categoryButton}>
                        <Text style={styles.categoryText}>Finance & Accounting</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.categoryButton}>
                        <Text style={styles.categoryText}>Business</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.categoryButton}>
                        <Text style={styles.categoryText}>IT & Software</Text>
                    </TouchableOpacity>
                </ScrollView>

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
                        Top courses in <Text style={styles.highlightText}>Design</Text>
                    </Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.coursesContainer}>
                    <TouchableOpacity style={[styles.courseCard, isDarkMode && styles.darkCard]}>
                        <View style={styles.courseImageContainer}>
                            <View style={[styles.courseImagePlaceholder, isDarkMode && styles.darkCoursePlaceholder]}>
                                <Ionicons name="logo-apple" size={40} color={isDarkMode ? "#5C7CFA" : "#3366FF"} />
                            </View>
                        </View>
                        <Text style={[styles.courseTitle, isDarkMode && styles.darkText]}>{isDarkMode ? "Java Masterclass" : "Java Masterclass"}</Text>
                        <Text style={[styles.courseInstructor, isDarkMode && styles.darkCourseInstructor]}>Avishek Gupta</Text>
                        <View style={styles.courseRating}>
                            <Ionicons name="star" size={16} color="#FFD700" />
                            <Text style={[styles.courseRatingText, isDarkMode && styles.darkCourseInstructor]}>4.8</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.courseCard, isDarkMode && styles.darkCard]}>
                        <View style={styles.courseImageContainer}>
                            <View style={[styles.courseImagePlaceholder, isDarkMode && styles.darkCoursePlaceholder]}>
                                <Ionicons name="pencil" size={40} color={isDarkMode ? "#5C7CFA" : "#3366FF"} />
                            </View>
                        </View>
                        <Text style={[styles.courseTitle, isDarkMode && styles.darkText]}>{isDarkMode ? "Drawing Fundamentals" : "The Ultimate Drawing Course"}</Text>
                        <Text style={[styles.courseInstructor, isDarkMode && styles.darkCourseInstructor]}>Sarah Johnson</Text>
                        <View style={styles.courseRating}>
                            <Ionicons name="star" size={16} color="#FFD700" />
                            <Text style={[styles.courseRatingText, isDarkMode && styles.darkCourseInstructor]}>4.7</Text>
                        </View>
                    </TouchableOpacity>
                </ScrollView>
            </ScrollView>

            <View style={[styles.bottomNavContainer, isDarkMode && styles.darkBottomNav]}>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="home" size={24} color="#3366FF" />
                    <Text style={styles.navTextActive}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="search" size={24} color={isDarkMode ? "#AAAAAA" : "#888"} />
                    <Text style={[styles.navText, isDarkMode && styles.darkNavText]}>Search</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="play-circle" size={24} color={isDarkMode ? "#AAAAAA" : "#888"} />
                    <Text style={[styles.navText, isDarkMode && styles.darkNavText]}>My learning</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="heart" size={24} color={isDarkMode ? "#AAAAAA" : "#888"} />
                    <Text style={[styles.navText, isDarkMode && styles.darkNavText]}>Wishlist</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem} onPress={navigateToProfile}>
                    <Ionicons name="person" size={24} color={isDarkMode ? "#AAAAAA" : "#888"} />
                    <Text style={[styles.navText, isDarkMode && styles.darkNavText]}>Account</Text>
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
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    darkText: {
        color: '#FFFFFF',
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
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingHorizontal: 15,
        height: 48,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    darkSearchInputContainer: {
        backgroundColor: '#121212',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    darkSearchInput: {
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
    },
    learningBanner: {
        height: 180,
        backgroundColor: '#3366FF',
        marginBottom: 20,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    bannerTextContainer: {
        width: '70%',
    },
    bannerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 10,
    },
    bannerSubtitle: {
        fontSize: 16,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    notificationBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF9C4',
        padding: 16,
        marginHorizontal: 20,
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
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        marginRight: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    categoryText: {
        fontSize: 14,
        color: '#333',
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
    },
    courseInstructor: {
        fontSize: 12,
        color: '#777777',
        marginBottom: 4,
    },
    darkCourseInstructor: {
        color: '#AAAAAA',
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
});

export default Dashboard; 