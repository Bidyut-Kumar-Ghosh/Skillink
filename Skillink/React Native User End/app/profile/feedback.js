import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StatusBar,
  Alert,
  Dimensions,
  FlatList,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { db } from "@/config/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { useFonts } from "expo-font";
import LottieView from "lottie-react-native";

const { width, height } = Dimensions.get("window");

function Feedback() {
  const { user, loading } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const animation = useRef(null);
  const [userFeedback, setUserFeedback] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const formScale = useRef(new Animated.Value(0.95)).current;

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    "Inter-Bold": require("@/assets/fonts/Inter-Bold.ttf"),
    "Inter-Medium": require("@/assets/fonts/Inter-Medium.ttf"),
    "Inter-Regular": require("@/assets/fonts/Inter-Regular.ttf"),
    "Inter-SemiBold": require("@/assets/fonts/Inter-SemiBold.ttf"),
  });

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
      Animated.timing(formScale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Fetch user feedback when component mounts
    if (user && user.id) {
      fetchUserFeedback();
    }
  }, [user]);

  // Fetch user feedback from Firestore
  const fetchUserFeedback = async () => {
    if (!user || !user.id) return;

    setLoadingFeedback(true);
    try {
      const userDocRef = doc(db, "users", user.id);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().feedback) {
        setUserFeedback(userDoc.data().feedback);
      } else {
        setUserFeedback(null);
      }
    } catch (error) {
      console.error("Error fetching user feedback:", error);
    } finally {
      setLoadingFeedback(false);
    }
  };

  useEffect(() => {
    if (submitted && animation.current) {
      animation.current.play();
    }
  }, [submitted]);

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

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert("Error", "Please enter your feedback message");
      return;
    }

    // Check if user is authenticated - using user.id instead of user.uid
    if (!user || !user.id) {
      Alert.alert("Error", "You must be logged in to submit feedback");
      return;
    }

    setSubmitting(true);
    try {
      // Update the user document directly with the feedback
      const userDocRef = doc(db, "users", user.id);

      // Use setDoc to update the user document with the feedback field
      await setDoc(
        userDocRef,
        {
          feedback: {
            category,
            message: message.trim(),
            status: "new",
            createdAt: serverTimestamp(),
            platform: Platform.OS,
            userEmail: user.email || "No email provided", // Include user email
          },
        },
        { merge: true }
      );

      // Refresh feedback data
      await fetchUserFeedback();

      // Reset form and show success animation
      setMessage("");
      setCategory("general");
      setSubmitted(true);

      // Reset back to form after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      Alert.alert(
        "Error",
        "There was an error submitting your feedback. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Render feedback status component
  const renderFeedbackStatus = () => {
    if (loadingFeedback) {
      return (
        <View style={styles.feedbackStatusContainer}>
          <ActivityIndicator
            size="small"
            color={isDarkMode ? "#64B5F6" : "#2196F3"}
          />
          <Text
            style={[
              styles.loadingText,
              { color: isDarkMode ? "#BBBBBB" : "#666666" },
            ]}
          >
            Loading feedback status...
          </Text>
        </View>
      );
    }

    if (!userFeedback) {
      return (
        <View
          style={[
            styles.feedbackStatusContainer,
            { backgroundColor: isDarkMode ? "#121212" : "#FFFFFF" },
          ]}
        >
          <Text
            style={[
              styles.noFeedbackText,
              { color: isDarkMode ? "#BBBBBB" : "#666666" },
            ]}
          >
            You haven't submitted any feedback yet.
          </Text>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.feedbackStatusContainer,
          { backgroundColor: isDarkMode ? "#121212" : "#FFFFFF" },
        ]}
      >
        <View style={styles.feedbackHeader}>
          <Text
            style={[
              styles.feedbackStatusTitle,
              { color: isDarkMode ? "#FFFFFF" : "#333333" },
            ]}
          >
            Current Feedback Status
          </Text>
        </View>

        <View
          style={[
            styles.statusCard,
            { backgroundColor: isDarkMode ? "#1E1E1E" : "#F5F5F5" },
          ]}
        >
          <View style={styles.statusRow}>
            <Text
              style={[
                styles.statusLabel,
                { color: isDarkMode ? "#BBBBBB" : "#666666" },
              ]}
            >
              Category:
            </Text>
            <Text
              style={[
                styles.statusValue,
                { color: isDarkMode ? "#FFFFFF" : "#333333" },
              ]}
            >
              {userFeedback.category
                ? userFeedback.category.charAt(0).toUpperCase() +
                  userFeedback.category.slice(1)
                : "General"}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Text
              style={[
                styles.statusLabel,
                { color: isDarkMode ? "#BBBBBB" : "#666666" },
              ]}
            >
              Status:
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(userFeedback.status) },
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {userFeedback.status
                  ? userFeedback.status.toUpperCase()
                  : "NEW"}
              </Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <Text
              style={[
                styles.statusLabel,
                { color: isDarkMode ? "#BBBBBB" : "#666666" },
              ]}
            >
              Date:
            </Text>
            <Text
              style={[
                styles.statusValue,
                { color: isDarkMode ? "#FFFFFF" : "#333333" },
              ]}
            >
              {userFeedback.createdAt
                ? new Date(
                    userFeedback.createdAt.seconds * 1000
                  ).toLocaleDateString()
                : "Recent"}
            </Text>
          </View>

          <View style={styles.messageContainer}>
            <Text
              style={[
                styles.statusLabel,
                { color: isDarkMode ? "#BBBBBB" : "#666666" },
              ]}
            >
              Message:
            </Text>
            <Text
              style={[
                styles.messageText,
                { color: isDarkMode ? "#FFFFFF" : "#333333" },
              ]}
            >
              {userFeedback.message}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Get status badge color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "#3366FF";
      case "in-progress":
        return "#FF9500";
      case "resolved":
        return "#34C759";
      case "closed":
        return "#8E8E93";
      default:
        return "#3366FF";
    }
  };

  // Show loading while checking authentication or loading fonts
  if (loading || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3366FF" />
      </View>
    );
  }

  const renderCategoryButton = (value, label, icon) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        category === value && styles.categoryButtonActive,
        {
          backgroundColor:
            category === value
              ? isDarkMode
                ? "#2C3E50"
                : "#E3F2FD"
              : isDarkMode
              ? "#1E1E1E"
              : "#F5F5F5",
        },
      ]}
      onPress={() => setCategory(value)}
    >
      <Ionicons
        name={icon}
        size={18}
        color={
          category === value
            ? isDarkMode
              ? "#64B5F6"
              : "#2196F3"
            : isDarkMode
            ? "#808080"
            : "#757575"
        }
      />
      <Text
        style={[
          styles.categoryButtonText,
          category === value && styles.categoryButtonTextActive,
          {
            color:
              category === value
                ? isDarkMode
                  ? "#64B5F6"
                  : "#2196F3"
                : isDarkMode
                ? "#808080"
                : "#757575",
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>FEEDBACK</Text>
          <View style={styles.headerRight} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Render feedback status */}
            {renderFeedbackStatus()}

            <Animated.View
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: formScale }],
                  backgroundColor: isDarkMode ? "#121212" : "#FFFFFF",
                },
              ]}
            >
              {submitted ? (
                <View style={styles.successContainer}>
                  <LottieView
                    ref={animation}
                    source={require("@/assets/animations/feedback-success.json")}
                    style={styles.lottieAnimation}
                    autoPlay
                    loop={false}
                  />
                  <Text
                    style={[
                      styles.successTitle,
                      { color: isDarkMode ? "#FFFFFF" : "#333333" },
                    ]}
                  >
                    Thank You!
                  </Text>
                  <Text
                    style={[
                      styles.successText,
                      { color: isDarkMode ? "#BBBBBB" : "#666666" },
                    ]}
                  >
                    Your feedback has been submitted successfully. We appreciate
                    your input.
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.formHeader}>
                    <Text
                      style={[
                        styles.formTitle,
                        { color: isDarkMode ? "#FFFFFF" : "#333333" },
                      ]}
                    >
                      We'd Love to Hear From You
                    </Text>
                    <Text
                      style={[
                        styles.formSubtitle,
                        { color: isDarkMode ? "#BBBBBB" : "#666666" },
                      ]}
                    >
                      Your feedback helps us improve our services and make your
                      experience better.
                    </Text>
                  </View>

                  <View style={styles.categorySection}>
                    <Text
                      style={[
                        styles.sectionTitle,
                        { color: isDarkMode ? "#BBBBBB" : "#666666" },
                      ]}
                    >
                      Type of Feedback
                    </Text>
                    <View style={styles.categoryButtons}>
                      {renderCategoryButton(
                        "general",
                        "General",
                        "chatbox-outline"
                      )}
                      {renderCategoryButton(
                        "suggestion",
                        "Suggestion",
                        "bulb-outline"
                      )}
                      {renderCategoryButton("bug", "Bug Report", "bug-outline")}
                      {renderCategoryButton(
                        "content",
                        "Content",
                        "document-text-outline"
                      )}
                    </View>
                  </View>

                  <View style={styles.inputSection}>
                    <Text
                      style={[
                        styles.sectionTitle,
                        { color: isDarkMode ? "#BBBBBB" : "#666666" },
                      ]}
                    >
                      Your Message
                    </Text>
                    <TextInput
                      style={[
                        styles.feedbackInput,
                        {
                          backgroundColor: isDarkMode ? "#1E1E1E" : "#F5F5F5",
                          color: isDarkMode ? "#FFFFFF" : "#333333",
                          borderColor: isDarkMode ? "#2C3E50" : "#E0E0E0",
                        },
                      ]}
                      placeholder="Tell us what you think..."
                      placeholderTextColor={isDarkMode ? "#777777" : "#AAAAAA"}
                      value={message}
                      onChangeText={setMessage}
                      multiline
                      numberOfLines={6}
                      textAlignVertical="top"
                    />
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      {
                        backgroundColor: isDarkMode ? "#2C3E50" : "#3366FF",
                        opacity: submitting ? 0.7 : 1,
                      },
                    ]}
                    onPress={handleSubmit}
                    disabled={submitting}
                    activeOpacity={0.8}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Ionicons
                          name="send-outline"
                          size={18}
                          color="#FFFFFF"
                          style={styles.submitIcon}
                        />
                        <Text style={styles.submitButtonText}>
                          Submit Feedback
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  backgroundContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 20 : 20,
    paddingBottom: 20,
    backgroundColor: "#3366FF",
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
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  content: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  formHeader: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: "Inter-Bold",
    textAlign: "center",
  },
  formSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    fontFamily: "Inter-Regular",
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 12,
    fontFamily: "Inter-Medium",
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    width: "48%",
  },
  categoryButtonActive: {
    backgroundColor: "#E3F2FD",
  },
  categoryButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  categoryButtonTextActive: {
    color: "#2196F3",
  },
  inputSection: {
    marginBottom: 24,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    height: 150,
  },
  submitButton: {
    backgroundColor: "#3366FF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Inter-SemiBold",
  },
  submitIcon: {
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  successContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    fontFamily: "Inter-Bold",
  },
  successText: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "Inter-Regular",
  },
  lottieAnimation: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  // Feedback status styles
  feedbackStatusContainer: {
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  feedbackHeader: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    paddingBottom: 12,
  },
  feedbackStatusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Inter-SemiBold",
  },
  noFeedbackText: {
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Inter-Regular",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Inter-Regular",
  },
  statusCard: {
    borderRadius: 12,
    padding: 16,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusLabel: {
    width: 80,
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  statusValue: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "Inter-SemiBold",
  },
  messageContainer: {
    marginTop: 8,
  },
  messageText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Inter-Regular",
  },
});

export default Feedback;
