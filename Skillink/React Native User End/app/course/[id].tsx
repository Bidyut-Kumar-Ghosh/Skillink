import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  level: string;
  duration: string;
  price: number;
  rating: number;
  imageUrl: string;
  enrollmentCount?: number;
  createdAt?: any;
  updatedAt?: any;
  totalLessons?: number;
}

export default function CourseDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const courseRef = doc(db, 'courses', id as string);
      const courseSnap = await getDoc(courseRef);

      if (courseSnap.exists()) {
        const data = courseSnap.data();
        setCourse({
          id: courseSnap.id,
          ...data,
        } as Course);
      } else {
        Alert.alert('Error', 'Course not found');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      Alert.alert('Error', 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to enroll in courses');
      return;
    }

    // TODO: Implement enrollment logic
    Alert.alert('Success', 'You have been enrolled in this course!');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3366FF" />
          <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>
            Loading course details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
        <Text style={[styles.errorText, isDarkMode && styles.darkText]}>
          Course not found
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#FFFFFF' : '#333333'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>
            Course Details
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Course Image */}
        {course.imageUrl && (
          <Image
            source={{ uri: course.imageUrl }}
            style={styles.courseImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.contentContainer}>
          {/* Course Title */}
          <Text style={[styles.courseTitle, isDarkMode && styles.darkText]}>
            {course.title}
          </Text>

          {/* Instructor */}
          <View style={styles.instructorSection}>
            <Ionicons name="person-circle" size={40} color="#3366FF" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={[styles.instructorLabel, isDarkMode && styles.darkTextSecondary]}>
                Instructor
              </Text>
              <Text style={[styles.instructorName, isDarkMode && styles.darkText]}>
                {course.instructor ? course.instructor.charAt(0).toUpperCase() + course.instructor.slice(1) : 'Unknown'}
              </Text>
            </View>
          </View>

          {/* Course Info Grid */}
          <View style={styles.infoGrid}>
            <View style={[styles.infoCard, isDarkMode && styles.darkInfoCard]}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={[styles.infoLabel, isDarkMode && styles.darkTextSecondary]}>
                Rating
              </Text>
              <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
                {course.rating?.toFixed(1) || '4.5'}/5
              </Text>
            </View>

            <View style={[styles.infoCard, isDarkMode && styles.darkInfoCard]}>
              <Ionicons name="clock" size={20} color="#FF6B6B" />
              <Text style={[styles.infoLabel, isDarkMode && styles.darkTextSecondary]}>
                Duration
              </Text>
              <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
                {course.duration || 'Self-paced'}
              </Text>
            </View>

            <View style={[styles.infoCard, isDarkMode && styles.darkInfoCard]}>
              <Ionicons name="layers" size={20} color="#4ECB71" />
              <Text style={[styles.infoLabel, isDarkMode && styles.darkTextSecondary]}>
                Level
              </Text>
              <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
                {course.level || 'Beginner'}
              </Text>
            </View>

            <View style={[styles.infoCard, isDarkMode && styles.darkInfoCard]}>
              <Ionicons name="pricetag" size={20} color="#A78BFA" />
              <Text style={[styles.infoLabel, isDarkMode && styles.darkTextSecondary]}>
                Price
              </Text>
              <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
                ${course.price?.toFixed(2) || '0.00'}
              </Text>
            </View>
          </View>

          {/* Category & Stats */}
          <View style={styles.metaSection}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{course.category}</Text>
            </View>
            {course.enrollmentCount && (
              <View style={styles.statsSection}>
                <Ionicons name="people" size={16} color="#3366FF" />
                <Text style={[styles.statsText, isDarkMode && styles.darkTextSecondary]}>
                  {course.enrollmentCount} enrolled
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
              About This Course
            </Text>
            <Text style={[styles.descriptionText, isDarkMode && styles.darkTextSecondary]}>
              {course.description || 'No description available'}
            </Text>
          </View>

          {/* What You'll Learn */}
          <View style={styles.learningSection}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
              What You'll Learn
            </Text>
            {[
              'Master the fundamentals and core concepts',
              'Apply practical techniques in real-world projects',
              'Gain industry-relevant skills and experience',
              'Complete hands-on exercises and assignments',
            ].map((item, index) => (
              <View key={index} style={styles.learningItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4ECB71" />
                <Text style={[styles.learningText, isDarkMode && styles.darkTextSecondary]}>
                  {item}
                </Text>
              </View>
            ))}
          </View>

          {/* Enroll Button */}
          <TouchableOpacity
            style={styles.enrollButton}
            onPress={handleEnroll}
            disabled={enrolling}
          >
            {enrolling ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
                <Text style={styles.enrollButtonText}>Enroll Now</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.wishlistButton, isDarkMode && styles.darkWishlistButton]}
            onPress={() => Alert.alert('Success', 'Added to wishlist!')}
          >
            <Ionicons name="heart-outline" size={20} color={isDarkMode ? '#FFFFFF' : '#666666'} />
            <Text style={[styles.wishlistButtonText, isDarkMode && styles.darkText]}>
              Add to Wishlist
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  darkContainer: {
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkTextSecondary: {
    color: '#8F96AB',
  },
  backButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#333333',
    fontSize: 14,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#FF6B6B',
  },
  courseImage: {
    width: '100%',
    height: 240,
    backgroundColor: '#E0E0E0',
  },
  contentContainer: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
  },
  instructorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#F5F7FA',
    padding: 12,
    borderRadius: 12,
  },
  instructorLabel: {
    fontSize: 12,
    color: '#8F96AB',
    marginBottom: 4,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  darkInfoCard: {
    backgroundColor: '#1A1A1A',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  infoCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EDF1F7',
  },
  infoLabel: {
    fontSize: 12,
    color: '#8F96AB',
    marginTop: 6,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginTop: 4,
  },
  metaSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  categoryBadge: {
    backgroundColor: '#3366FF20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: '#3366FF',
    fontSize: 12,
    fontWeight: '600',
  },
  statsSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#8F96AB',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666666',
  },
  learningSection: {
    marginBottom: 24,
  },
  learningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  learningText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  enrollButton: {
    backgroundColor: '#3366FF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  enrollButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  wishlistButton: {
    backgroundColor: '#F5F7FA',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#EDF1F7',
  },
  darkWishlistButton: {
    backgroundColor: '#1A1A1A',
    borderColor: '#333333',
  },
  wishlistButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
