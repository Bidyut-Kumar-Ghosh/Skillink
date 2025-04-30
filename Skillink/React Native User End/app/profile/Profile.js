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
  getDoc,
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
  feedback: "chatbubble-ellipses-outline",
  help: "help-circle-outline",
  settings: "settings-outline",
};

// Featured profile cover image
const featuredCoverImage = require("@/assets/images/background-image.png");

// Achievement badge images
const achievementBadges = [
  {
    id: 1,
    icon: "school",
    color: "#FF7D67",
    title: "Quick Learner",
    description: "Completed 5 lessons in a day",
  },
  {
    id: 2,
    icon: "ribbon",
    color: "#46C390",
    title: "Perfect Score",
    description: "Scored 100% in a test",
  },
  {
    id: 3,
    icon: "flame",
    color: "#3366FF",
    title: "Streak Master",
    description: "Maintained a 7-day streak",
  },
  {
    id: 4,
    icon: "trophy",
    color: "#FFC83E",
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

      // If user has refreshed the page or logged back in,
      // fetch the latest user data from Firestore to ensure cover image is loaded
      const fetchUserData = async () => {
        try {
          if (user.id) {
            const userDoc = await getDoc(doc(db, "users", user.id));
            if (userDoc.exists()) {
              const userData = userDoc.data();

              // If the user data has a coverImageURL but the local user doesn't,
              // update the local user state
              if (
                userData.coverImageURL &&
                (!user.coverImageURL ||
                  user.coverImageURL !== userData.coverImageURL)
              ) {
                const updatedUser = {
                  ...user,
                  coverImageURL: userData.coverImageURL,
                };
                setUser(updatedUser);

                // Update AsyncStorage with the latest user data
                await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
              }
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchUserData();
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
      <View style={styles.profileMenuContainer}>
        <Text
          style={[
            styles.sectionTitle,
            { color: isDarkMode ? "#FFFFFF" : "#2D3748" },
          ]}
        >
          Account
        </Text>
        <View
          style={[
            styles.profileMenuList,
            {
              backgroundColor: isDarkMode ? "#121212" : "#FFFFFF",
              borderRadius: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDarkMode ? 0.3 : 0.1,
              shadowRadius: 8,
              elevation: 5,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.profileMenuItem}
            onPress={() => router.push("/profile/purchases")}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.profileMenuIconContainer,
                { backgroundColor: isDarkMode ? "#1A202C" : "#F0F5FF" },
              ]}
            >
              <Ionicons
                name={profileItemIcons.purchases}
                size={20}
                color={isDarkMode ? "#4D9CFF" : "#3366FF"}
              />
            </View>
            <View style={styles.profileMenuTextContainer}>
              <Text
                style={[
                  styles.profileMenuTitle,
                  { color: isDarkMode ? "#FFFFFF" : "#333333" },
                ]}
              >
                Purchases
              </Text>
              <Text
                style={[
                  styles.profileMenuDescription,
                  { color: isDarkMode ? "#8F96AB" : "#718096" },
                ]}
              >
                View your purchase history
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDarkMode ? "#5D6986" : "#CBD5E0"}
            />
          </TouchableOpacity>

          <View
            style={[
              styles.itemDivider,
              { backgroundColor: isDarkMode ? "#1E1E1E" : "#F1F5F9" },
            ]}
          />

          <TouchableOpacity
            style={styles.profileMenuItem}
            onPress={() => router.push("/profile/educators")}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.profileMenuIconContainer,
                { backgroundColor: isDarkMode ? "#1A202C" : "#EEFBF5" },
              ]}
            >
              <Ionicons
                name={profileItemIcons.educators}
                size={20}
                color={isDarkMode ? "#46C390" : "#32B679"}
              />
            </View>
            <View style={styles.profileMenuTextContainer}>
              <Text
                style={[
                  styles.profileMenuTitle,
                  { color: isDarkMode ? "#FFFFFF" : "#333333" },
                ]}
              >
                Educators
              </Text>
              <Text
                style={[
                  styles.profileMenuDescription,
                  { color: isDarkMode ? "#8F96AB" : "#718096" },
                ]}
              >
                View your educators
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDarkMode ? "#5D6986" : "#CBD5E0"}
            />
          </TouchableOpacity>

          <View
            style={[
              styles.itemDivider,
              { backgroundColor: isDarkMode ? "#1E1E1E" : "#F1F5F9" },
            ]}
          />

          <TouchableOpacity
            style={styles.profileMenuItem}
            onPress={() => router.push("/profile/updates")}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.profileMenuIconContainer,
                { backgroundColor: isDarkMode ? "#1A202C" : "#FFF2F5" },
              ]}
            >
              <Ionicons
                name={profileItemIcons.updates}
                size={20}
                color={isDarkMode ? "#FF7D67" : "#FF5E3A"}
              />
              {hasNewNotifications && <View style={styles.notificationBadge} />}
            </View>
            <View style={styles.profileMenuTextContainer}>
              <Text
                style={[
                  styles.profileMenuTitle,
                  { color: isDarkMode ? "#FFFFFF" : "#333333" },
                ]}
              >
                Updates
              </Text>
              <Text
                style={[
                  styles.profileMenuDescription,
                  { color: isDarkMode ? "#8F96AB" : "#718096" },
                ]}
              >
                Check latest notifications
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDarkMode ? "#5D6986" : "#CBD5E0"}
            />
          </TouchableOpacity>

          <View
            style={[
              styles.itemDivider,
              { backgroundColor: isDarkMode ? "#1E1E1E" : "#F1F5F9" },
            ]}
          />

          <TouchableOpacity
            style={styles.profileMenuItem}
            onPress={() => router.push("/profile/feedback")}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.profileMenuIconContainer,
                { backgroundColor: isDarkMode ? "#1A202C" : "#F0F7FF" },
              ]}
            >
              <Ionicons
                name={profileItemIcons.feedback}
                size={20}
                color={isDarkMode ? "#64B5F6" : "#2196F3"}
              />
            </View>
            <View style={styles.profileMenuTextContainer}>
              <Text
                style={[
                  styles.profileMenuTitle,
                  { color: isDarkMode ? "#FFFFFF" : "#333333" },
                ]}
              >
                Feedback
              </Text>
              <Text
                style={[
                  styles.profileMenuDescription,
                  { color: isDarkMode ? "#8F96AB" : "#718096" },
                ]}
              >
                Share your thoughts with us
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDarkMode ? "#5D6986" : "#CBD5E0"}
            />
          </TouchableOpacity>

          <View
            style={[
              styles.itemDivider,
              { backgroundColor: isDarkMode ? "#1E1E1E" : "#F1F5F9" },
            ]}
          />

          <TouchableOpacity
            style={styles.profileMenuItem}
            onPress={() => {
              // Help functionality
              Alert.alert(
                "Help & Support",
                "For assistance, please contact our support team at support@skillink.com",
                [{ text: "OK", onPress: () => console.log("OK Pressed") }]
              );
            }}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.profileMenuIconContainer,
                { backgroundColor: isDarkMode ? "#1A202C" : "#F0F7FF" },
              ]}
            >
              <Ionicons
                name={profileItemIcons.help}
                size={20}
                color={isDarkMode ? "#64B5F6" : "#2196F3"}
              />
            </View>
            <View style={styles.profileMenuTextContainer}>
              <Text
                style={[
                  styles.profileMenuTitle,
                  { color: isDarkMode ? "#FFFFFF" : "#333333" },
                ]}
              >
                Help
              </Text>
              <Text
                style={[
                  styles.profileMenuDescription,
                  { color: isDarkMode ? "#8F96AB" : "#718096" },
                ]}
              >
                Contact support
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDarkMode ? "#5D6986" : "#CBD5E0"}
            />
          </TouchableOpacity>

          <View
            style={[
              styles.itemDivider,
              { backgroundColor: isDarkMode ? "#1E1E1E" : "#F1F5F9" },
            ]}
          />

          <TouchableOpacity
            style={styles.profileMenuItem}
            onPress={() => router.push("/settings")}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.profileMenuIconContainer,
                { backgroundColor: isDarkMode ? "#1A202C" : "#F5F3FF" },
              ]}
            >
              <Ionicons
                name={profileItemIcons.settings}
                size={20}
                color={isDarkMode ? "#B794F6" : "#7C4DFF"}
              />
            </View>
            <View style={styles.profileMenuTextContainer}>
              <Text
                style={[
                  styles.profileMenuTitle,
                  { color: isDarkMode ? "#FFFFFF" : "#333333" },
                ]}
              >
                Settings
              </Text>
              <Text
                style={[
                  styles.profileMenuDescription,
                  { color: isDarkMode ? "#8F96AB" : "#718096" },
                ]}
              >
                Customize your app preferences
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDarkMode ? "#5D6986" : "#CBD5E0"}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render achievements section with badges
  const renderAchievements = () => {
    // Create refs for badge animations
    const badgeScales = achievementBadges.map(
      () => useRef(new Animated.Value(1)).current
    );

    // Function to animate badge press
    const animateBadgePress = (index, pressed) => {
      Animated.spring(badgeScales[index], {
        toValue: pressed ? 0.95 : 1,
        friction: 5,
        tension: 300,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View
        style={[
          styles.achievementsContainer,
          {
            backgroundColor: isDarkMode ? "#121212" : "#FFFFFF",
            borderWidth: 1,
            borderColor: isDarkMode ? "#2D3246" : "#f0f0f0",
          },
        ]}
      >
        <View
          style={[
            styles.profileHeader,
            {
              borderBottomColor: isDarkMode
                ? "rgba(61, 67, 92, 0.3)"
                : "rgba(0, 0, 0, 0.05)",
            },
          ]}
        >
          <View
            style={[
              styles.achievementIconContainer,
              { backgroundColor: isDarkMode ? "#252836" : "#f0f4ff" },
            ]}
          >
            <Ionicons name="trophy" size={20} color="#3366FF" />
          </View>
          <Text
            style={[
              styles.profileTitle,
              {
                color: isDarkMode ? "#FFFFFF" : "#333333",
                marginLeft: 10,
              },
            ]}
          >
            MY ACHIEVEMENTS
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.badgesScrollContainer}
          contentContainerStyle={styles.badgesScrollContent}
          decelerationRate="normal"
        >
          {achievementBadges.map((badge, index) => (
            <Animated.View
              key={badge.id}
              style={{
                transform: [{ scale: badgeScales[index] }],
                margin: 3,
              }}
            >
              <TouchableOpacity
                style={[
                  styles.badgeContainer,
                  { borderColor: badge.color + "33" }, // Add transparency to the border color
                ]}
                activeOpacity={0.7}
                onPressIn={() => animateBadgePress(index, true)}
                onPressOut={() => animateBadgePress(index, false)}
                onPress={() => {
                  Alert.alert(badge.title, badge.description);
                }}
              >
                <View
                  style={[
                    styles.badgeIconContainer,
                    { backgroundColor: badge.color + "15" },
                  ]}
                >
                  <Ionicons name={badge.icon} size={32} color={badge.color} />
                </View>
                <View style={styles.badgeTextContainer}>
                  <Text
                    style={[
                      styles.badgeTitle,
                      { color: isDarkMode ? "#FFFFFF" : "#333333" },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
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
                </View>
              </TouchableOpacity>
            </Animated.View>
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
    marginBottom: 20,
  },
  profileMenuList: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 15,
  },
  profileMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "transparent",
  },
  profileMenuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  profileMenuTextContainer: {
    flex: 1,
  },
  profileMenuTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    fontFamily: "Inter-SemiBold",
  },
  profileMenuDescription: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter-Regular",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    fontFamily: "Inter-SemiBold",
  },
  itemDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 16,
  },
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
  // Achievement styles
  achievementsContainer: {
    backgroundColor: "#242B42",
    borderRadius: 16,
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
  },
  badgesScrollContent: {
    paddingHorizontal: 5,
    paddingBottom: 10,
    paddingTop: 5,
  },
  badgeContainer: {
    width: 120,
    minHeight: 160,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    padding: 15,
    marginRight: 15,
    marginBottom: 5,
    marginTop: 5,
    alignItems: "center",
    justifyContent: "flex-start",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4.65,
    elevation: 6,
    overflow: "visible",
  },
  badgeIconContainer: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    marginTop: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  badgeTextContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
    textAlign: "center",
    fontFamily: "Inter-SemiBold",
  },
  badgeDescription: {
    fontSize: 11,
    textAlign: "center",
    fontFamily: "Inter-Regular",
    lineHeight: 14,
    flexWrap: "wrap",
    paddingHorizontal: 2,
  },
  coverImageLoadingContainer: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A2138",
  },
  loadingText: {
    color: "white",
    marginTop: 10,
    fontFamily: "Inter-Regular",
  },
  achievementIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#252836",
  },
});

export default Profile;
