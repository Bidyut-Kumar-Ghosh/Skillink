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
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useFonts } from "expo-font";

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

function Profile() {
  const { user, isLoggedIn, logOut, loading, authLoading, setUser } = useAuth();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simple refresh with no image loading
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const updateProfile = async () => {
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

      // Update user's name in Firestore
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        name: name,
      });

      // Update local user state with the new name
      const updatedUser = {
        ...user,
        name: name,
      };
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

  // Remove image picker section and replace with static avatar display
  const avatarSection = () => {
    return (
      <View style={styles.avatarSection}>
        <View
          style={[
            styles.avatarWrapper,
            {
              borderColor: isDarkMode ? "#3D435C" : "#3366FF",
              backgroundColor: isDarkMode ? "#242B42" : "#FFFFFF",
            },
          ]}
        >
          <View style={styles.profileAvatarPlaceholder}>
            <Text style={styles.profileAvatarText}>{getInitial()}</Text>
          </View>
        </View>

        {isEditingName ? (
          <View style={styles.nameEditContainer}>
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              autoFocus={true}
              placeholder="Enter your name"
              placeholderTextColor="#8F96AB"
              onSubmitEditing={() => {
                updateProfile();
                setIsEditingName(false);
              }}
            />
            <TouchableOpacity
              style={styles.saveNameButton}
              onPress={() => {
                updateProfile();
                setIsEditingName(false);
              }}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.nameContainer}
            onPress={() => setIsEditingName(true)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.profileName,
                { color: isDarkMode ? "#FFFFFF" : "#333333" },
              ]}
            >
              {user?.name || "User"}
            </Text>
            <Ionicons
              name="create-outline"
              size={18}
              color="#3366FF"
              style={styles.editIcon}
            />
          </TouchableOpacity>
        )}

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

            <Animated.View
              style={[
                styles.profileCard,
                {
                  transform: [{ scale: buttonScale }],
                  backgroundColor: isDarkMode ? "#121212" : "#FFFFFF",
                },
              ]}
            >
              <View style={styles.profileHeader}>
                <Ionicons name="person" size={20} color="#3366FF" />
                <Text
                  style={[
                    styles.profileTitle,
                    { color: isDarkMode ? "#FFFFFF" : "#333333" },
                  ]}
                >
                  PROFILE
                </Text>
              </View>

              <View style={styles.formSection}>
                <Text
                  style={[
                    styles.label,
                    { color: isDarkMode ? "#8F96AB" : "#666666" },
                  ]}
                >
                  EMAIL
                </Text>
                <View
                  style={[
                    styles.emailFieldContainer,
                    { backgroundColor: isDarkMode ? "#1E1E1E" : "#f5f5f5" },
                  ]}
                >
                  <Text
                    style={[
                      styles.emailField,
                      { color: isDarkMode ? "#FFFFFF" : "#333333" },
                    ]}
                  >
                    {user?.email}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.helperText,
                    { color: isDarkMode ? "#8F96AB" : "#888888" },
                  ]}
                >
                  Contact support to change your email address
                </Text>
              </View>
            </Animated.View>

            {/* Account Actions Section */}
            <Animated.View
              style={[
                styles.actionsContainer,
                { backgroundColor: isDarkMode ? "#121212" : "#FFFFFF" },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { borderBottomColor: isDarkMode ? "#1E1E1E" : "#f0f0f0" },
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
                    styles.actionIconContainer,
                    { backgroundColor: isDarkMode ? "#1E1E1E" : "#f0f6ff" },
                  ]}
                >
                  <Ionicons name="settings-outline" size={22} color="#3366FF" />
                </View>
                <Text
                  style={[
                    styles.actionText,
                    { color: isDarkMode ? "#FFFFFF" : "#333333" },
                  ]}
                >
                  Settings
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={isDarkMode ? "#8F96AB" : "#999"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { borderBottomColor: isDarkMode ? "#1E1E1E" : "#f0f0f0" },
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  animateButtonPress();
                  // Navigate to help page
                  router.push("/help");
                }}
              >
                <View
                  style={[
                    styles.actionIconContainer,
                    { backgroundColor: isDarkMode ? "#1E1E1E" : "#f0f6ff" },
                  ]}
                >
                  <Ionicons
                    name="help-circle-outline"
                    size={22}
                    color="#3366FF"
                  />
                </View>
                <Text
                  style={[
                    styles.actionText,
                    { color: isDarkMode ? "#FFFFFF" : "#333333" },
                  ]}
                >
                  Help & Support
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={isDarkMode ? "#8F96AB" : "#999"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.logoutButton]}
                activeOpacity={0.7}
                onPress={() => {
                  animateButtonPress();
                  Alert.alert("Logout", "Are you sure you want to logout?", [
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                    {
                      text: "Logout",
                      onPress: () => {
                        // Start the animation
                        Animated.parallel([
                          Animated.timing(fadeAnim, {
                            toValue: 0,
                            duration: 300,
                            useNativeDriver: true,
                          }),
                          Animated.timing(slideAnim, {
                            toValue: 30,
                            duration: 300,
                            useNativeDriver: true,
                          }),
                        ]).start(async () => {
                          // Force reset user state for web platform
                          if (Platform.OS === "web") {
                            try {
                              await AsyncStorage.removeItem("user");
                              setUser(null);
                              router.replace("/authentication/login");
                            } catch (error) {
                              console.error(
                                "Error during manual logout:",
                                error
                              );
                            }
                          }

                          // Call the normal logout function
                          logOut();
                        });
                      },
                      style: "destructive",
                    },
                  ]);
                }}
              >
                <View
                  style={[
                    styles.actionIconContainer,
                    { backgroundColor: isDarkMode ? "#1E1E1E" : "#f0f6ff" },
                  ]}
                >
                  <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
                </View>
                <Text style={[styles.actionText, styles.logoutText]}>
                  Logout
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={isDarkMode ? "#8F96AB" : "#999"}
                />
              </TouchableOpacity>
            </Animated.View>
          </Animated.ScrollView>
        </View>
      </KeyboardAvoidingView>
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
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    marginBottom: 10,
    borderWidth: 2,
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
    marginBottom: 20,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 10,
    letterSpacing: 1,
    fontFamily: "Inter-SemiBold",
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
});

export default Profile;
