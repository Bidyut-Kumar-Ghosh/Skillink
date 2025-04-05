import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Text,
  Image,
  Dimensions,
  Alert,
  Animated,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { router, Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "@/config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { showError, showSuccess } from "@/app/components/NotificationHandler";

const { width, height } = Dimensions.get("window");

// Fallback theme for safety
const fallbackTheme = {
  background: "#f8f9fa",
  primary: "#3366FF",
  buttonText: "#ffffff",
  text: "#333333",
  textLight: "#8f9bb3",
  textMuted: "#6c757d",
  cardBackground: "#ffffff",
  error: "#ff3d71",
  border: "#e4e9f2",
};

export default function ForgotPasswordScreen() {
  const { theme, isDarkMode } = useTheme();

  // Use fallback theme if the real theme is not available
  const activeTheme = theme || fallbackTheme;

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  // Button scale for press animation
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Sequence of animations for a smooth entrance
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(logoAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Animate button press
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

  // Debounce navigation to prevent multiple clicks
  const navigateToLogin = () => {
    if (isNavigating) return;
    setIsNavigating(true);

    animateButtonPress();

    // Fade out animation before navigation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      router.replace("/authentication/login");
      // Reset after a delay to allow navigation to complete
      setTimeout(() => setIsNavigating(false), 1000);
    });
  };

  // Function to check if user email exists in Firebase
  const checkUserExists = async (email) => {
    try {
      // Query Firestore to check if user with email exists
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  };

  // Function for password reset using Firebase
  const handleResetPassword = async () => {
    try {
      setError("");
      setLoading(true);

      if (!email) {
        setError("Please enter your email address");
        setLoading(false);
        return;
      }

      // Email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showError("auth/invalid-email", "Please enter a valid email address");
        setLoading(false);
        return;
      }

      // Check if user exists in Firebase
      const userExists = await checkUserExists(email);
      if (!userExists) {
        showError(
          "auth/user-not-found",
          "No account associated with this email. Please sign up first."
        );
        setLoading(false);
        return;
      }

      // Send password reset email using Firebase
      await sendPasswordResetEmail(auth, email);

      setLoading(false);
      setResetSent(true);
      showSuccess(
        "auth/reset-email-sent",
        "Password reset email sent. Check your inbox for instructions."
      );
    } catch (error) {
      setLoading(false);
      let errorMessage = "Failed to send reset email. Please try again.";

      // Handle specific Firebase error codes
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Please try again later.";
      }

      showError(error.code || "auth/unknown", errorMessage);
      console.error("Reset password error:", error);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDarkMode ? "#000000" : "#f8f9fa" },
      ]}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <Animated.View
        style={[styles.backgroundContainer, { opacity: fadeAnim }]}
      >
        <Image
          source={require("@/assets/images/landing.png")}
          style={[styles.backgroundImage, { opacity: isDarkMode ? 0.7 : 1 }]}
          resizeMode="cover"
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.overlay}>
              <Animated.View
                style={[
                  styles.logoContainer,
                  {
                    opacity: logoAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <View style={styles.logoCircle}>
                  <Image
                    source={require("@/assets/images/ChatGPT Image Apr 4, 2025, 01_32_28 PM.png")}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.appName}>Skillink</Text>
                <Text style={styles.tagline}>Password Recovery</Text>
              </Animated.View>

              <Animated.View
                style={[
                  styles.formContainer,
                  {
                    opacity: formAnim,
                    transform: [
                      { translateY: Animated.multiply(slideAnim, 0.5) },
                    ],
                    backgroundColor: isDarkMode ? "#121212" : "#FFFFFF",
                    shadowColor: isDarkMode ? "#000000" : "#000000",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.welcomeBack,
                    { color: isDarkMode ? "#FFFFFF" : "#333333" },
                  ]}
                >
                  Forgot Password?
                </Text>
                <Text
                  style={[
                    styles.loginPrompt,
                    { color: isDarkMode ? "#AAAAAA" : "#666666" },
                  ]}
                >
                  Enter your email address and we'll send you instructions to
                  reset your password
                </Text>

                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: isDarkMode ? "#1E1E1E" : "#F5F5F5",
                      borderColor: isDarkMode ? "#333333" : "#E0E0E0",
                    },
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={activeTheme.textLight}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      { color: isDarkMode ? "#FFFFFF" : "#333333" },
                    ]}
                    placeholder="Email"
                    placeholderTextColor={isDarkMode ? "#888888" : "#AAAAAA"}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!resetSent}
                  />
                </View>

                {error ? (
                  <Text
                    style={[
                      styles.errorText,
                      { color: isDarkMode ? "#FF6B6B" : "#FF3D71" },
                    ]}
                  >
                    {error}
                  </Text>
                ) : null}

                {resetSent ? (
                  <Animated.View
                    style={[
                      styles.sentContainer,
                      {
                        backgroundColor: isDarkMode ? "#1E1E1E" : "#F5F5F5",
                        borderColor: isDarkMode ? "#333333" : "#E0E0E0",
                      },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={60}
                      color={isDarkMode ? "#4CAF50" : "#4CAF50"}
                    />
                    <Text
                      style={[
                        styles.sentText,
                        { color: isDarkMode ? "#FFFFFF" : "#333333" },
                      ]}
                    >
                      Password reset email sent!
                    </Text>
                    <Text
                      style={[
                        styles.sentSubText,
                        { color: isDarkMode ? "#AAAAAA" : "#666666" },
                      ]}
                    >
                      Check your inbox for further instructions
                    </Text>
                  </Animated.View>
                ) : (
                  <Animated.View
                    style={{
                      transform: [{ scale: buttonScale }],
                      opacity: buttonAnim,
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.resetButton,
                        { backgroundColor: activeTheme.primary },
                      ]}
                      onPress={handleResetPassword}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.resetButtonText}>
                          RESET PASSWORD
                        </Text>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                )}

                <View style={styles.footer}>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={navigateToLogin}
                    disabled={isNavigating}
                  >
                    <Ionicons
                      name="arrow-back"
                      size={20}
                      color={activeTheme.primary}
                    />
                    <Text
                      style={[styles.backText, { color: activeTheme.primary }]}
                    >
                      Back to Login
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  backgroundContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  overlay: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    marginVertical: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#000033",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00FFFF",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 15,
    borderWidth: 3,
    borderColor: "#00BFFF",
  },
  logoImage: {
    width: 85,
    height: 85,
  },
  appName: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#00BFFF",
    marginTop: 16,
    textShadowColor: "rgba(0, 191, 255, 0.8)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  tagline: {
    fontSize: 16,
    color: "#FFFFFF",
    marginTop: 8,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  welcomeBack: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  loginPrompt: {
    fontSize: 14,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: 50,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 16,
    color: "#FF3D71",
  },
  resetButton: {
    backgroundColor: "#3366FF",
    borderRadius: 8,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 24,
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  sentContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    marginBottom: 16,
  },
  sentText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    textAlign: "center",
  },
  sentSubText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});
