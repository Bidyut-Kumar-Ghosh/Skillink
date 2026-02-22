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

interface Book {
  id: string;
  title: string;
  description: string;
  author: string;
  category: string;
  isbn: string;
  pages: number;
  publishDate: string;
  price: number;
  rating: number;
  imageUrl: string;
  purchaseCount?: number;
  createdAt?: any;
  updatedAt?: any;
  publisher?: string;
  language?: string;
}

export default function BookDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { user } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPurchased, setIsPurchased] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const fetchBookDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const bookRef = doc(db, 'books', id as string);
      const bookSnap = await getDoc(bookRef);

      if (bookSnap.exists()) {
        const data = bookSnap.data();
        setBook({
          id: bookSnap.id,
          ...data,
        } as Book);
      } else {
        Alert.alert('Error', 'Book not found');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching book:', error);
      Alert.alert('Error', 'Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to purchase books');
      return;
    }

    // TODO: Implement purchase logic with payment gateway
    Alert.alert('Success', 'Book purchased successfully!');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3366FF" />
          <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>
            Loading book details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!book) {
    return (
      <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
        <Text style={[styles.errorText, isDarkMode && styles.darkText]}>
          Book not found
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        <View style={[styles.header, isDarkMode && styles.darkHeader]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#FFFFFF' : '#333333'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>
            Book Details
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Book Image and Rating */}
        <View style={styles.imageSection}>
          {book.imageUrl && (
            <Image
              source={{ uri: book.imageUrl }}
              style={styles.bookImage}
              resizeMode="cover"
            />
          )}
        </View>

        <View style={styles.contentContainer}>
          {/* Book Title */}
          <Text style={[styles.bookTitle, isDarkMode && styles.darkText]}>
            {book.title}
          </Text>

          {/* Author */}
          <View style={styles.authorSection}>
            <Ionicons name="person-circle" size={40} color="#FF6B6B" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={[styles.authorLabel, isDarkMode && styles.darkTextSecondary]}>
                Author
              </Text>
              <Text style={[styles.authorName, isDarkMode && styles.darkText]}>
                {book.author ? book.author.charAt(0).toUpperCase() + book.author.slice(1) : 'Unknown'}
              </Text>
            </View>
          </View>

          {/* Rating Section */}
          <View style={[styles.ratingContainer, isDarkMode && styles.darkRatingContainer]}>
            <View style={styles.ratingStars}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < Math.floor(book.rating || 4.5) ? 'star' : 'star-outline'}
                  size={16}
                  color="#FFD700"
                  style={{ marginRight: 4 }}
                />
              ))}
            </View>
            <Text style={[styles.ratingValue, isDarkMode && styles.darkText]}>
              {book.rating?.toFixed(1) || '4.5'}/5
            </Text>
            {book.purchaseCount && (
              <Text style={[styles.purchaseCount, isDarkMode && styles.darkTextSecondary]}>
                ({book.purchaseCount} reviews)
              </Text>
            )}
          </View>

          {/* Book Info Grid */}
          <View style={styles.infoGrid}>
            <View style={[styles.infoCard, isDarkMode && styles.darkInfoCard]}>
              <Ionicons name="calendar" size={20} color="#4ECB71" />
              <Text style={[styles.infoLabel, isDarkMode && styles.darkTextSecondary]}>
                Published
              </Text>
              <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
                {book.publishDate ? new Date(book.publishDate).getFullYear() : 'N/A'}
              </Text>
            </View>

            <View style={[styles.infoCard, isDarkMode && styles.darkInfoCard]}>
              <Ionicons name="document" size={20} color="#A78BFA" />
              <Text style={[styles.infoLabel, isDarkMode && styles.darkTextSecondary]}>
                Pages
              </Text>
              <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
                {book.pages || 'N/A'}
              </Text>
            </View>

            <View style={[styles.infoCard, isDarkMode && styles.darkInfoCard]}>
              <Ionicons name="barcode" size={20} color="#FF6B6B" />
              <Text style={[styles.infoLabel, isDarkMode && styles.darkTextSecondary]}>
                ISBN
              </Text>
              <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
                {book.isbn ? book.isbn.slice(0, 8) : 'N/A'}
              </Text>
            </View>

            <View style={[styles.infoCard, isDarkMode && styles.darkInfoCard]}>
              <Ionicons name="pricetag" size={20} color="#3366FF" />
              <Text style={[styles.infoLabel, isDarkMode && styles.darkTextSecondary]}>
                Price
              </Text>
              <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
                ${book.price?.toFixed(2) || '0.00'}
              </Text>
            </View>
          </View>

          {/* Category & Language */}
          <View style={styles.metaSection}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{book.category}</Text>
            </View>
            {book.language && (
              <View style={[styles.languageBadge, isDarkMode && styles.darkLanguageBadge]}>
                <Ionicons name="globe" size={14} color="#3366FF" />
                <Text style={[styles.languageText, isDarkMode && styles.darkText]}>
                  {book.language}
                </Text>
              </View>
            )}
          </View>

          {/* Publisher */}
          {book.publisher && (
            <View style={styles.publisherSection}>
              <Ionicons name="business" size={16} color="#8F96AB" />
              <Text style={[styles.publisherText, isDarkMode && styles.darkTextSecondary]}>
                {book.publisher}
              </Text>
            </View>
          )}

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
              About This Book
            </Text>
            <Text style={[styles.descriptionText, isDarkMode && styles.darkTextSecondary]}>
              {book.description || 'No description available'}
            </Text>
          </View>

          {/* Book Features */}
          <View style={styles.featuresSection}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
              Why Read This Book?
            </Text>
            {[
              'Comprehensive and well-researched content',
              'Clear explanations with practical examples',
              'Perfect for beginners and advanced readers',
              'Professional printing and quality binding',
            ].map((item, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4ECB71" />
                <Text style={[styles.featureText, isDarkMode && styles.darkTextSecondary]}>
                  {item}
                </Text>
              </View>
            ))}
          </View>

          {/* Purchase Button */}
          <TouchableOpacity
            style={styles.purchaseButton}
            onPress={handlePurchase}
            disabled={purchasing}
          >
            {purchasing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="cart" size={20} color="#FFFFFF" />
                <Text style={styles.purchaseButtonText}>Purchase Now</Text>
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
  darkHeader: {
    backgroundColor: '#1A1A1A',
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
  imageSection: {
    padding: 16,
    alignItems: 'center',
  },
  bookImage: {
    width: 160,
    height: 240,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F5F7FA',
    padding: 12,
    borderRadius: 12,
  },
  authorLabel: {
    fontSize: 12,
    color: '#8F96AB',
    marginBottom: 4,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    backgroundColor: '#FFF9E6',
    paddingVertical: 12,
    borderRadius: 12,
  },
  darkRatingContainer: {
    backgroundColor: '#2A2A00',
  },
  ratingStars: {
    flexDirection: 'row',
  },
  ratingValue: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  purchaseCount: {
    marginLeft: 8,
    fontSize: 12,
    color: '#8F96AB',
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
  darkInfoCard: {
    backgroundColor: '#1A1A1A',
    borderColor: '#333333',
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
    marginBottom: 16,
    justifyContent: 'center',
    gap: 8,
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
  languageBadge: {
    backgroundColor: '#3366FF20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  darkLanguageBadge: {
    backgroundColor: '#1A3A4A',
  },
  languageText: {
    color: '#3366FF',
    fontSize: 12,
    fontWeight: '600',
  },
  publisherSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
  },
  publisherText: {
    marginLeft: 8,
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
  featuresSection: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  purchaseButton: {
    backgroundColor: '#3366FF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  purchaseButtonText: {
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
