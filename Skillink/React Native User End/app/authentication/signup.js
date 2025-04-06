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
  Animated,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { router, Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import {
  showError,
  showSuccess,
  getErrorCode,
} from "@/app/components/NotificationHandler";

const { width, height } = Dimensions.get("window");

export default function SignupScreen() {
  const { theme, isDarkMode } = useTheme();
  const { signUp, authLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleSignup = async () => {
    // Clear previous errors
    setError("");

    // Validate the input fields
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    animateButtonPress();

    try {
      setLoading(true);
      await signUp(email, password, name);
      showSuccess(
        "auth/register-success",
        "Registration successful! Please sign in."
      );

      // Navigate to login after successful signup
      setTimeout(() => {
        router.replace("/authentication/login");
      }, 1000);
    } catch (error) {
      const errorCode = getErrorCode(error);
      showError(errorCode, error.message || "Registration failed");
    } finally {
      setLoading(false);
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
                <Text style={styles.tagline}>
                  Unlock Your Potential, Connect With Skills
                </Text>
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
                  },
                ]}
              >
                <Text
                  style={[
                    styles.welcomeBack,
                    { color: isDarkMode ? "#FFFFFF" : "#333333" },
                  ]}
                >
                  Create Account
                </Text>
                <Text
                  style={[
                    styles.loginPrompt,
                    { color: isDarkMode ? "#AAAAAA" : "#666666" },
                  ]}
                >
                  Sign up to get started!
                </Text>

                <View
                  style={[
                    styles.inputContainer,
                    { backgroundColor: isDarkMode ? "#1E1E1E" : "#F5F5F5" },
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={theme.textLight}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      { color: isDarkMode ? "#FFFFFF" : "#333333" },
                    ]}
                    placeholder="Full Name"
                    placeholderTextColor={theme.textLight}
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View
                  style={[
                    styles.inputContainer,
                    { backgroundColor: isDarkMode ? "#1E1E1E" : "#F5F5F5" },
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={theme.textLight}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      { color: isDarkMode ? "#FFFFFF" : "#333333" },
                    ]}
                    placeholder="Email"
                    placeholderTextColor={theme.textLight}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View
                  style={[
                    styles.inputContainer,
                    { backgroundColor: isDarkMode ? "#1E1E1E" : "#F5F5F5" },
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={theme.textLight}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      { color: isDarkMode ? "#FFFFFF" : "#333333" },
                    ]}
                    placeholder="Password"
                    placeholderTextColor={theme.textLight}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={theme.textLight}
                    />
                  </TouchableOpacity>
                </View>

                <View
                  style={[
                    styles.inputContainer,
                    { backgroundColor: isDarkMode ? "#1E1E1E" : "#F5F5F5" },
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={theme.textLight}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      { color: isDarkMode ? "#FFFFFF" : "#333333" },
                    ]}
                    placeholder="Confirm Password"
                    placeholderTextColor={theme.textLight}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-off-outline" : "eye-outline"
                      }
                      size={20}
                      color={theme.textLight}
                    />
                  </TouchableOpacity>
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <Animated.View
                  style={{
                    transform: [{ scale: buttonScale }],
                    opacity: buttonAnim,
                  }}
                >
                  <TouchableOpacity
                    style={styles.signupButton}
                    onPress={handleSignup}
                    disabled={loading || authLoading}
                  >
                    {loading || authLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.signupButtonText}>SIGN UP</Text>
                    )}
                  </TouchableOpacity>
                </Animated.View>

                <Animated.View style={[styles.footer, { opacity: buttonAnim }]}>
                  <Text
                    style={[
                      styles.footerText,
                      { color: isDarkMode ? "#AAAAAA" : "#666666" },
                    ]}
                  >
                    Already have an account?
                  </Text>
                  <TouchableOpacity
                    onPress={navigateToLogin}
                    disabled={isNavigating}
                  >
                    <Text style={styles.loginLink}>Log in</Text>
                  </TouchableOpacity>
                </Animated.View>
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
    marginBottom: 40,
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#0A0A2E",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 2,
    borderColor: "#4DB6FF",
    overflow: "hidden",
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  tagline: {
    fontSize: 16,
    color: "#E6E6E6",
    textAlign: "center",
    opacity: 0.9,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  welcomeBack: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 5,
  },
  loginPrompt: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333333",
  },
  eyeIcon: {
    padding: 5,
  },
  errorText: {
    color: "#ff3d71",
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
  },
  signupButton: {
    backgroundColor: "#3366FF",
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 20,
  },
  signupButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "#666666",
    fontSize: 14,
    marginRight: 5,
  },
  loginLink: {
    color: "#3366FF",
    fontSize: 14,
    fontWeight: "bold",
  },
});
