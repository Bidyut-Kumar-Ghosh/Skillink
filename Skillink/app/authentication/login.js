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

export default function LoginScreen() {
  const { theme, isDarkMode } = useTheme();
  const { signIn, authLoading } = useAuth();

  // Use fallback theme if the real theme is not available
  const activeTheme = theme || fallbackTheme;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
  const navigateToSignup = () => {
    if (isNavigating) return;
    setIsNavigating(true);

    animateButtonPress();

    // Fade out animation before navigation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      router.replace("/authentication/signup");
      // Reset after a delay to allow navigation to complete
      setTimeout(() => setIsNavigating(false), 1000);
    });
  };

  const handleLogin = async () => {
    // Validate input fields
    if (!email) {
      showError("auth/empty-email", "Please enter your email");
      return;
    }

    if (!password) {
      showError("auth/empty-password", "Please enter your password");
      return;
    }

    animateButtonPress();

    try {
      // Proceed with login
      await signIn(email, password);
      // Show success message on successful login
      showSuccess("auth/login-success");
      // If successful, we won't reach here because router.replace will be called
    } catch (error) {
      // Silent error handling - errors are already shown by AuthContext
      // Do not log anything to console
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
                    source={require("@/assets/images/logo.png")}
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
                  Welcome Back!
                </Text>
                <Text
                  style={[
                    styles.loginPrompt,
                    { color: isDarkMode ? "#AAAAAA" : "#666666" },
                  ]}
                >
                  Please sign in to continue
                </Text>

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

                <View style={styles.forgotPasswordContainer}>
                  <Link href="/authentication/forgot-password" asChild>
                    <TouchableOpacity>
                      <Text style={styles.forgotPasswordText}>
                        Forgot Password?
                      </Text>
                    </TouchableOpacity>
                  </Link>
                </View>

                <Animated.View
                  style={{
                    transform: [{ scale: buttonScale }],
                    opacity: buttonAnim,
                  }}
                >
                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleLogin}
                    disabled={authLoading}
                  >
                    {authLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.loginButtonText}>SIGN IN</Text>
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
                    Don't have an account?
                  </Text>
                  <TouchableOpacity
                    onPress={navigateToSignup}
                    disabled={isNavigating}
                  >
                    <Text style={styles.signupLink}>Sign up</Text>
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
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    overflow: "hidden",
  },
  logoImage: {
    width: 70,
    height: 70,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  tagline: {
    fontSize: 16,
    color: "#FFFFFF",
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
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#3366FF",
    fontSize: 14,
  },
  errorText: {
    color: "#ff3d71",
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: "#3366FF",
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
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
  signupLink: {
    color: "#3366FF",
    fontSize: 14,
    fontWeight: "bold",
  },
});
