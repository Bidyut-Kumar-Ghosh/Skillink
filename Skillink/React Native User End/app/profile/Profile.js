import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Dimensions,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Image,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  doc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { useFonts } from "expo-font";
import LogoutDialog from "@/app/components/LogoutDialog";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

const { width, height } = Dimensions.get("window");

// Fallback theme for safety
const fallbackTheme = {
  background: "#f8f9fa",
  primary: "#3366FF",
  buttonText: "#ffffff",
  text: "#333333",
  textLight: "#8f9bb3",
  cardBackground: "#ffffff",
  error: "#ff3d71",
};

// Profile item icons as component names
const profileItemIcons = {
  purchases: "lock-closed-outline",
  educators: "school-outline",
  updates: "notifications-outline",
  help: "help-circle-outline",
  settings: "settings-outline",
};

// Featured profile cover image
const featuredCoverImage = require("@/assets/images/background-image.png");

// Achievement badge images
const achievementBadges = [
  {
    id: 1,
    image: require("@/assets/images/splash-icon.png"),
    title: "Quick Learner",
    description: "Completed 5 lessons in a day",
  },
  {
    id: 2,
    image: require("@/assets/images/logo.png"),
    title: "Perfect Score",
    description: "Scored 100% in a test",
  },
  {
    id: 3,
    image: require("@/assets/images/partial-react-logo.png"),
    title: "Streak Master",
    description: "Maintained a 7-day streak",
  },
  {
    id: 4,
    image: require("@/assets/images/Google.png"),
    title: "First Step",
    description: "Completed your first course",
  },
];

// Featured carousel content
const featuredCarouselContent = [
  {
    id: 1,
    image: require("@/assets/images/background-image.png"),
    title: "Upcoming Bank Exams",
    description: "Prepare for SBI, IBPS, and other bank exams",
  },
  {
    id: 2,
    image: require("@/assets/images/landing.png"),
    title: "Practice Tests",
    description: "Take mock tests to improve your score",
  },
  {
    id: 3,
    image: require("@/assets/images/login.jpg"),
    title: "Study Material",
    description: "Access comprehensive study materials",
  },
];

function Profile() {
  const { user, isLoggedIn, logOut, loading, authLoading, setUser } = useAuth();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [carouselActiveIndex, setCarouselActiveIndex] = useState(0);

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(null);

  // Form fields
  const [name, setName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    "Inter-Bold": require("@/assets/fonts/Inter-Bold.ttf"),
    "Inter-Medium": require("@/assets/fonts/Inter-Medium.ttf"),
    "Inter-Regular": require("@/assets/fonts/Inter-Regular.ttf"),
    "Inter-SemiBold": require("@/assets/fonts/Inter-SemiBold.ttf"),
  });

  // Use fallback theme if the real theme is not available
  const activeTheme = theme || fallbackTheme;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Run animations when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Animation for button press
  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle back button with animation
  const handleBackPress = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -30,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.back();
    });
  };

  // Initialize form fields
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      if (user.photoURL) {
        setProfileImage(user.photoURL);
      }
    }
  }, [user]);

  // Check for new notifications
  useEffect(() => {
    const checkForNewNotifications = async () => {
      try {
        // Get last check time from storage or use current time if not available
        const now = new Date();
        let checkTime = lastCheckTime;

        if (!checkTime) {
          // If first time, use current time minus 7 days
          const storedTime = await AsyncStorage.getItem(
            "lastNotificationCheck"
          );
          if (storedTime) {
            checkTime = new Date(JSON.parse(storedTime));
          } else {
            checkTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          }
          setLastCheckTime(checkTime);
        }

        // Query for courses created after the last check time
        const coursesRef = collection(db, "courses");
        const newCoursesQuery = query(
          coursesRef,
          where("createdAt", ">", checkTime),
          orderBy("createdAt", "desc"),
          limit(10)
        );

        const snapshot = await getDocs(newCoursesQuery);
        const newNotifications = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          newNotifications.push({
            id: doc.id,
            title: data.title || "",
            author: data.author || data.instructor || "Course Instructor",
            rating: data.rating || 4.5,
            imageUrl: data.imageUrl,
            category: data.category || "Course",
            type: "course",
            createdAt: data.createdAt?.toDate() || new Date(),
          });
        });

        if (newNotifications.length > 0) {
          setNotifications(newNotifications);
          setHasNewNotifications(true);
        }

        // Update the last check time to now
        await AsyncStorage.setItem(
          "lastNotificationCheck",
          JSON.stringify(now)
        );
        setLastCheckTime(now);
      } catch (error) {
        console.error("Error checking for new notifications:", error);
      }
    };

    if (user) {
      checkForNewNotifications();
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simple refresh with no image loading
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "We need camera roll permissions to upload a profile picture."
        );
        return;
      }

      setImageLoading(true);

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImageUri = result.assets[0].uri;

        // Convert image to base64
        const base64Image = await FileSystem.readAsStringAsync(
          selectedImageUri,
          {
            encoding: FileSystem.EncodingType.Base64,
          }
        );

        // Set the profile image and update profile
        setProfileImage("data:image/jpeg;base64," + base64Image);
        await updateProfile(base64Image);
      }

      setImageLoading(false);
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
      setImageLoading(false);
    }
  };

  // Helper function to resize images on web platform
  const resizeImageForWeb = async (
    base64Image,
    maxWidth = 1200,
    quality = 0.7
  ) => {
    // This function only works on web platform
    if (Platform.OS !== "web") return base64Image;

    return new Promise((resolve) => {
      // Create an image object
      const img = new Image();
      img.src = `data:image/jpeg;base64,${base64Image}`;

      img.onload = () => {
        // Create a canvas element
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions if needed
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw image on canvas
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Get base64 data
        const resizedBase64 = canvas
          .toDataURL("image/jpeg", quality)
          .replace("data:image/jpeg;base64,", "");

        resolve(resizedBase64);
      };
    });
  };

  const pickCoverImage = async () => {
    try {
      // For web and mobile platforms
      let permissionResult;

      // Skip permission check on web
      if (Platform.OS !== "web") {
        permissionResult =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.status !== "granted") {
          Alert.alert(
            "Permission Denied",
            "We need camera roll permissions to upload a cover image."
          );
          return;
        }
      }

      // Show loading state
      setImageLoading(true);

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 1],
        quality: 0.5, // Compress the image to 50% quality
        base64: true, // Get base64 data directly
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        let base64Image;

        // For web, we may already have base64 data
        if (selectedImage.base64) {
          base64Image = selectedImage.base64;
        } else {
          // For native platforms, read as base64 if not already provided
          base64Image = await FileSystem.readAsStringAsync(selectedImage.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        }

        // Compress large images - this is a simple approach
        // A more sophisticated approach would check actual file size
        if (base64Image.length > 500000) {
          // If larger than ~500KB
          console.log("Large image detected, applying additional compression");
          // Use a canvas for additional compression on large images
          if (Platform.OS === "web") {
            base64Image = await resizeImageForWeb(base64Image);
          }
        }

        // For web platform, always process through our resize function
        // This handles proper image formatting and compression
        if (Platform.OS === "web") {
          base64Image = await resizeImageForWeb(base64Image, 1200, 0.7);
        }

        // Update cover image
        updateCoverImage(base64Image);
      }

      setImageLoading(false);
    } catch (error) {
      console.error("Error picking cover image:", error);
      Alert.alert("Error", "Failed to pick cover image");
      setImageLoading(false);
    }
  };

  const updateCoverImage = async (imageBase64) => {
    try {
      if (!user || !user.id) {
        Alert.alert("Error", "User not found");
        return;
      }

      setIsSubmitting(true);

      // Prepare the cover image data with proper format
      const coverImageData = `data:image/jpeg;base64,${imageBase64}`;

      // Prepare update data
      const updateData = {
        coverImageURL: coverImageData,
        updatedAt: new Date(), // Add a timestamp for when the cover was last updated
      };

      // Update user's data in Firestore
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, updateData);

      // Update local user state with the new data
      const updatedUser = {
        ...user,
        coverImageURL: coverImageData,
      };

      setUser(updatedUser);

      // Update AsyncStorage to persist locally
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      Alert.alert("Success", "Cover image updated successfully!");
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error updating cover image:", error);
      Alert.alert("Error", "Failed to update cover image");
      setIsSubmitting(false);
    }
  };

  const updateProfile = async (imageBase64 = null) => {
    try {
      setIsSubmitting(true);

      if (!user || !user.id) {
        Alert.alert("Error", "User not found");
        setIsSubmitting(false);
        return;
      }

      // Check if name is empty
      if (!name.trim()) {
        Alert.alert("Error", "Name cannot be empty");
        setIsSubmitting(false);
        return;
      }

      // Prepare update data
      const updateData = {
        name: name,
      };

      // Add profile image if available
      if (imageBase64) {
        updateData.photoURL = "data:image/jpeg;base64," + imageBase64;
      }

      // Update user's data in Firestore
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, updateData);

      // Update local user state with the new data
      const updatedUser = {
        ...user,
        name: name,
      };

      // Add photoURL to updated user if available
      if (imageBase64) {
        updatedUser.photoURL = "data:image/jpeg;base64," + imageBase64;
      }

      setUser(updatedUser);

      // Update AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      Alert.alert("Success", "Profile updated successfully!");
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
      setIsSubmitting(false);
    }
  };

  // Get first letter of name or email for avatar
  const getInitial = () => {
    if (user?.name && user.name.length > 0) {
      return user.name.charAt(0).toUpperCase();
    } else if (user?.email && user.email.length > 0) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Avatar section with image upload functionality
  const avatarSection = () => {
    return (
      <View style={styles.avatarSection}>
        {/* Featured Cover Image */}
        <View style={styles.coverImageContainer}>
          {isSubmitting ? (
            <View style={styles.coverImageLoadingContainer}>
              <ActivityIndicator size="large" color="#3366FF" />
              <Text style={styles.loadingText}>Updating cover image...</Text>
            </View>
          ) : user?.coverImageURL ? (
            <Image
              source={{ uri: user.coverImageURL }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={featuredCoverImage}
              style={styles.coverImage}
              resizeMode="cover"
            />
          )}
          <TouchableOpacity
            style={styles.changeCoverButton}
            onPress={pickCoverImage}
            disabled={isSubmitting}
          >
            <Ionicons name="camera" size={18} color="#FFFFFF" />
            <Text style={styles.changeCoverText}>
              {isSubmitting ? "Uploading..." : "Change Cover"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.avatarWrapper,
            {
              borderColor: isDarkMode ? "#3D435C" : "#3366FF",
              backgroundColor: isDarkMode ? "#242B42" : "#FFFFFF",
            },
          ]}
          onPress={pickImage}
          disabled={imageLoading}
        >
          {imageLoading ? (
            <View style={styles.profileAvatarPlaceholder}>
              <ActivityIndicator size="large" color="#3366FF" />
            </View>
          ) : profileImage ? (
            <Image
              source={{ uri: profileImage }}
              style={styles.profileAvatar}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.profileAvatarPlaceholder}>
              <Text style={styles.profileAvatarText}>{getInitial()}</Text>
            </View>
          )}

          <View
            style={[
              styles.cameraIconContainer,
              { borderColor: isDarkMode ? "#242B42" : "#FFFFFF" },
            ]}
          >
            <Ionicons name="camera" size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <View style={styles.nameContainer}>
          <Text
            style={[
              styles.profileName,
              { color: isDarkMode ? "#FFFFFF" : "#333333" },
            ]}
          >
            {user?.name || "User"}
          </Text>
        </View>

        <Text
          style={[
            styles.profileEmail,
            { color: isDarkMode ? "#8F96AB" : "#666666" },
          ]}
        >
          {user?.email}
        </Text>
      </View>
    );
  };

  // New section for profile menu items with modern futuristic design
  const renderProfileMenuItems = () => {
    return (
      <Animated.View
        style={[
          styles.profileMenuContainer,
          {
            backgroundColor: isDarkMode
              ? "rgba(18, 18, 18, 0.8)"
              : "rgba(255, 255, 255, 0.9)",
            borderWidth: isDarkMode ? 1 : 0,
            borderColor: isDarkMode ? "#3D435C" : "transparent",
          },
        ]}
      >
        <View style={styles.profileHeader}>
          <View style={styles.headerIconGlow}>
            <Ionicons name="grid-outline" size={20} color="#3366FF" />
          </View>
          <Text
            style={[
              styles.profileTitle,
              { color: isDarkMode ? "#FFFFFF" : "#333333" },
            ]}
          >
            MY ACTIVITIES
          </Text>
        </View>

        <View style={styles.profileMenuGrid}>
          {/* My Purchases */}
          <TouchableOpacity
            style={[
              styles.profileMenuItem,
              {
                backgroundColor: isDarkMode
                  ? "rgba(30, 30, 30, 0.8)"
                  : "rgba(255, 255, 255, 0.9)",
                borderColor: isDarkMode ? "#3D435C" : "#e0e0e0",
              },
            ]}
            activeOpacity={0.7}
            onPress={() => {
              animateButtonPress();
              // Navigate to purchases
              router.push("/profile/purchases");
            }}
          >
            <View
              style={[
                styles.profileMenuIconContainer,
                {
                  backgroundColor: isDarkMode ? "#242B42" : "#E6EEFF",
                  shadowColor: "#3366FF",
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  elevation: 6,
                },
              ]}
            >
              <Ionicons
                name={profileItemIcons.purchases}
                size={24}
                color="#3366FF"
              />
            </View>
            <Text
              style={[
                styles.profileMenuText,
                { color: isDarkMode ? "#FFFFFF" : "#333333" },
              ]}
            >
              My purchases
            </Text>
            <View style={styles.menuItemArrow}>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={isDarkMode ? "#8F96AB" : "#AAAAAA"}
              />
            </View>
          </TouchableOpacity>

          {/* My Educators */}
          <TouchableOpacity
            style={[
              styles.profileMenuItem,
              {
                backgroundColor: isDarkMode
                  ? "rgba(30, 30, 30, 0.8)"
                  : "rgba(255, 255, 255, 0.9)",
                borderColor: isDarkMode ? "#3D435C" : "#e0e0e0",
              },
            ]}
            activeOpacity={0.7}
            onPress={() => {
              animateButtonPress();
              // Navigate to educators
              router.push("/profile/educators");
            }}
          >
            <View
              style={[
                styles.profileMenuIconContainer,
                {
                  backgroundColor: isDarkMode ? "#242B42" : "#E6EEFF",
                  shadowColor: "#3366FF",
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  elevation: 6,
                },
              ]}
            >
              <Ionicons
                name={profileItemIcons.educators}
                size={24}
                color="#3366FF"
              />
            </View>
            <Text
              style={[
                styles.profileMenuText,
                { color: isDarkMode ? "#FFFFFF" : "#333333" },
              ]}
            >
              My educators
            </Text>
            <View style={styles.menuItemArrow}>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={isDarkMode ? "#8F96AB" : "#AAAAAA"}
              />
            </View>
          </TouchableOpacity>

          {/* Updates */}
          <TouchableOpacity
            style={[
              styles.profileMenuItem,
              {
                backgroundColor: isDarkMode
                  ? "rgba(30, 30, 30, 0.8)"
                  : "rgba(255, 255, 255, 0.9)",
                borderColor: isDarkMode ? "#3D435C" : "#e0e0e0",
              },
            ]}
            activeOpacity={0.7}
            onPress={() => {
              animateButtonPress();
              // Navigate to updates with notification data
              router.push({
                pathname: "/profile/updates",
                params: { hasNewNotifications: hasNewNotifications },
              });
              // Mark notifications as read when visiting the page
              if (hasNewNotifications) {
                setHasNewNotifications(false);
              }
            }}
          >
            <View
              style={[
                styles.profileMenuIconContainer,
                {
                  backgroundColor: isDarkMode ? "#242B42" : "#E6EEFF",
                  shadowColor: "#3366FF",
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  elevation: 6,
                },
              ]}
            >
              <Ionicons
                name={profileItemIcons.updates}
                size={24}
                color="#3366FF"
              />
              {hasNewNotifications && (
                <View
                  style={[
                    styles.notificationBadge,
                    { borderColor: isDarkMode ? "#242B42" : "#E6EEFF" },
                  ]}
                >
                  <Text style={styles.notificationBadgeText}>
                    {notifications.length > 9 ? "9+" : notifications.length}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.profileMenuText,
                { color: isDarkMode ? "#FFFFFF" : "#333333" },
              ]}
            >
              Updates
            </Text>
            <View style={styles.menuItemArrow}>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={isDarkMode ? "#8F96AB" : "#AAAAAA"}
              />
            </View>
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity
            style={[
              styles.profileMenuItem,
              {
                backgroundColor: isDarkMode
                  ? "rgba(30, 30, 30, 0.8)"
                  : "rgba(255, 255, 255, 0.9)",
                borderColor: isDarkMode ? "#3D435C" : "#e0e0e0",
              },
            ]}
            activeOpacity={0.7}
            onPress={() => {
              animateButtonPress();
              // Navigate to settings page
              router.push("/settings");
            }}
          >
            <View
              style={[
                styles.profileMenuIconContainer,
                {
                  backgroundColor: isDarkMode ? "#242B42" : "#E6EEFF",
                  shadowColor: "#3366FF",
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  elevation: 6,
                },
              ]}
            >
              <Ionicons
                name={profileItemIcons.settings}
                size={24}
                color="#3366FF"
              />
            </View>
            <Text
              style={[
                styles.profileMenuText,
                { color: isDarkMode ? "#FFFFFF" : "#333333" },
              ]}
            >
              Settings
            </Text>
            <View style={styles.menuItemArrow}>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={isDarkMode ? "#8F96AB" : "#AAAAAA"}
              />
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  // Render achievements section with badges
  const renderAchievements = () => {
    return (
      <Animated.View
        style={[
          styles.achievementsContainer,
          { backgroundColor: isDarkMode ? "#121212" : "#FFFFFF" },
        ]}
      >
        <View style={styles.profileHeader}>
          <Ionicons name="trophy" size={20} color="#3366FF" />
          <Text
            style={[
              styles.profileTitle,
              { color: isDarkMode ? "#FFFFFF" : "#333333" },
            ]}
          >
            MY ACHIEVEMENTS
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.badgesScrollContainer}
        >
          {achievementBadges.map((badge) => (
            <TouchableOpacity
              key={badge.id}
              style={[
                styles.badgeContainer,
                { borderColor: isDarkMode ? "#2D3246" : "#e0e0e0" },
              ]}
              activeOpacity={0.7}
              onPress={() => {
                Alert.alert(badge.title, badge.description);
              }}
            >
              <Image source={badge.image} style={styles.badgeImage} />
              <Text
                style={[
                  styles.badgeTitle,
                  { color: isDarkMode ? "#FFFFFF" : "#333333" },
                ]}
              >
                {badge.title}
              </Text>
              <Text
                style={[
                  styles.badgeDescription,
                  { color: isDarkMode ? "#8F96AB" : "#666666" },
                ]}
                numberOfLines={2}
              >
                {badge.description}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    );
  };

  // Function to render the featured content carousel
  const renderFeaturedContentCarousel = () => {
    useEffect(() => {
      const interval = setInterval(() => {
        setCarouselActiveIndex((current) =>
          current === featuredCarouselContent.length - 1 ? 0 : current + 1
        );
      }, 3000);

      return () => clearInterval(interval);
    }, []);

    return (
      <Animated.View
        style={[
          styles.carouselContainer,
          { backgroundColor: isDarkMode ? "#121212" : "#FFFFFF" },
        ]}
      >
        <View style={styles.profileHeader}>
          <Ionicons name="star" size={20} color="#3366FF" />
          <Text
            style={[
              styles.profileTitle,
              { color: isDarkMode ? "#FFFFFF" : "#333333" },
            ]}
          >
            FEATURED CONTENT
          </Text>
        </View>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const slideWidth = width - 40; // Container padding
            const index = Math.round(
              event.nativeEvent.contentOffset.x / slideWidth
            );
            setCarouselActiveIndex(index);
          }}
          style={styles.carouselScroll}
        >
          {featuredCarouselContent.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={styles.carouselSlide}
              activeOpacity={0.9}
              onPress={() => {
                Alert.alert(item.title, item.description);
              }}
            >
              <Image
                source={item.image}
                style={styles.carouselImage}
                resizeMode="cover"
              />
              <View style={styles.carouselTextOverlay}>
                <Text style={styles.carouselTitle}>{item.title}</Text>
                <Text style={styles.carouselDescription}>
                  {item.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.carouselDots}>
          {featuredCarouselContent.map((_, index) => (
            <View
              key={index}
              style={[
                styles.carouselDot,
                carouselActiveIndex === index ? styles.carouselDotActive : null,
                {
                  backgroundColor:
                    carouselActiveIndex === index ? "#3366FF" : "#D0D0D0",
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>
    );
  };

  const handleLogout = async () => {
    // ... existing code ...
  };

  // Show loading while checking authentication or loading fonts
  if (loading || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3366FF" />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        isDarkMode
          ? { backgroundColor: "#000000" }
          : { backgroundColor: "#F8F9FA" },
      ]}
    >
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <View
          style={[
            styles.backgroundContainer,
            isDarkMode
              ? { backgroundColor: "#000000" }
              : { backgroundColor: "#F8F9FA" },
          ]}
        >
          <View
            style={[
              styles.header,
              {
                backgroundColor: isDarkMode ? "#121212" : "#3366FF",
                borderBottomColor: isDarkMode ? "#1E1E1E" : "transparent",
              },
            ]}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>MY PROFILE</Text>
            <View style={styles.headerRight} />
          </View>

          <Animated.ScrollView
            contentContainerStyle={styles.scrollContainer}
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={isDarkMode ? "#FFFFFF" : "#3366FF"}
              />
            }
          >
            {avatarSection()}

            {/* Add the new profile menu items section */}
            {renderProfileMenuItems()}

            {/* Add the achievements section */}
            {renderAchievements()}

            {/* Featured Content Carousel */}
            {renderFeaturedContentCarousel()}
          </Animated.ScrollView>
        </View>
      </KeyboardAvoidingView>

      <LogoutDialog
        visible={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A2138",
  },
  backgroundContainer: {
    flex: 1,
    backgroundColor: "#1A2138",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 40 : 20,
    paddingBottom: 20,
    backgroundColor: "#1A2138",
    borderBottomWidth: 1,
    borderBottomColor: "#3D435C",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 4,
  },
  backButton: {
    padding: 10,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 1,
    fontFamily: "Inter-SemiBold",
  },
  headerRight: {
    width: 40,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  coverImageContainer: {
    width: "100%",
    height: 180,
    marginBottom: 60,
    position: "relative",
    borderRadius: 10,
    overflow: "hidden",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  changeCoverButton: {
    position: "absolute",
    right: 10,
    bottom: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  changeCoverText: {
    color: "#FFFFFF",
    marginLeft: 5,
    fontSize: 12,
    fontFamily: "Inter-Medium",
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    marginBottom: 10,
    borderWidth: 2,
    position: "absolute",
    top: 130,
    left: "50%",
    marginLeft: -50,
    zIndex: 10,
    borderColor: "#3D435C",
    backgroundColor: "#242B42",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileAvatarPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#2D3246",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
  },
  profileAvatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    fontFamily: "Inter-SemiBold",
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 5,
    fontFamily: "Inter-SemiBold",
  },
  editIcon: {
    marginLeft: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: "#8F96AB",
    marginBottom: 20,
    fontFamily: "Inter-Regular",
  },
  profileCard: {
    backgroundColor: "#242B42",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(61, 67, 92, 0.3)",
    paddingBottom: 15,
  },
  profileTitle: {
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1.2,
    fontFamily: "Inter-Bold",
    textTransform: "uppercase",
  },
  formSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#8F96AB",
    marginBottom: 5,
    letterSpacing: 1,
    fontFamily: "Inter-Medium",
  },
  nameEditContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    width: "80%",
  },
  nameInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 10,
    marginRight: 10,
    color: "#333333",
    fontFamily: "Inter-Regular",
  },
  saveNameButton: {
    backgroundColor: "#3366FF",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  emailFieldContainer: {
    height: 40,
    backgroundColor: "#2D3246",
    borderRadius: 8,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  emailField: {
    color: "#FFFFFF",
    fontFamily: "Inter-Regular",
  },
  helperText: {
    fontSize: 12,
    color: "#8F96AB",
    marginTop: 5,
    fontFamily: "Inter-Regular",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    backgroundColor: "#2D3246",
    borderRadius: 8,
    borderWidth: 0,
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    color: "#FFFFFF",
    fontFamily: "Inter-Regular",
  },
  updateButton: {
    backgroundColor: "#3366FF",
    borderRadius: 8,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Inter-SemiBold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A2138",
  },

  // Updated action styles
  actionsContainer: {
    backgroundColor: "#242B42",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#3D435C",
  },
  actionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3D435C",
    marginRight: 15,
  },
  actionText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: "Inter-Regular",
    flex: 1,
  },
  logoutButton: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: "#FF3B30",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3D435C",
    fontFamily: "Inter-SemiBold",
  },
  statLabel: {
    fontSize: 14,
    color: "#7C82A1",
    marginTop: 5,
    fontFamily: "Inter-Regular",
  },
  textInput: {
    fontFamily: "Inter-Regular",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter-SemiBold",
  },
  settingsText: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
  },

  // New styles for security section
  securityOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 0,
  },
  securityOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  securityIcon: {
    marginRight: 15,
  },
  securityOptionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
    fontFamily: "Inter-Medium",
  },
  securityOptionDescription: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
  },
  profileAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#3366FF",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  // Updated styles for profile menu items
  profileMenuContainer: {
    backgroundColor: "#242B42",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#3366FF",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#3D435C",
  },
  profileMenuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 15,
  },
  profileMenuItem: {
    width: "48%",
    alignItems: "flex-start",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    position: "relative",
    overflow: "hidden",
    shadowColor: "#3366FF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  profileMenuIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(51, 102, 255, 0.3)",
  },
  profileMenuText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    fontFamily: "Inter-SemiBold",
  },
  headerIconGlow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    shadowColor: "#3366FF",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
  },
  menuItemArrow: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(51, 102, 255, 0.1)",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  // Styles for achievements section
  achievementsContainer: {
    backgroundColor: "#242B42",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  badgesScrollContainer: {
    marginTop: 15,
    marginBottom: 5,
  },
  badgeContainer: {
    width: 140,
    height: 180,
    marginRight: 15,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  badgeImage: {
    width: 80,
    height: 80,
    marginBottom: 10,
    borderRadius: 40,
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 5,
    fontFamily: "Inter-SemiBold",
  },
  badgeDescription: {
    fontSize: 12,
    textAlign: "center",
    fontFamily: "Inter-Regular",
  },

  // Styles for carousel
  carouselContainer: {
    backgroundColor: "#242B42",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  carouselScroll: {
    marginTop: 15,
  },
  carouselSlide: {
    width: width - 80, // Account for container padding and spacing
    height: 200,
    borderRadius: 10,
    marginRight: 20,
    overflow: "hidden",
    position: "relative",
  },
  carouselImage: {
    width: "100%",
    height: "100%",
  },
  carouselTextOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  carouselTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    fontFamily: "Inter-SemiBold",
  },
  carouselDescription: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  carouselDots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  carouselDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  carouselDotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // Styles for notification badge
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    zIndex: 1,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },

  // New styles for image gallery
  imageGalleryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 15,
    marginBottom: 15,
  },
  galleryImageContainer: {
    width: "48%",
    height: 120,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  galleryImage: {
    width: "100%",
    height: "100%",
  },
  addImageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
  },
  addImageButtonText: {
    fontSize: 14,
    marginLeft: 8,
    fontFamily: "Inter-Medium",
  },
  coverImageLoadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    fontFamily: "Inter-SemiBold",
  },
});

export default Profile;
