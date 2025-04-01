import React, { useState } from "react";
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
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { router, Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/config/firebase";

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

export default function SignupScreen() {
  const { theme } = useTheme();
  const { signUp, authLoading } = useAuth();

  // Use fallback theme if the real theme is not available
  const activeTheme = theme || fallbackTheme;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [loading, setLoading] = useState(false);

  // Debounce navigation to prevent multiple clicks
  const navigateToLogin = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    router.replace("/authentication/login");
    // Reset after a delay to allow navigation to complete
    setTimeout(() => setIsNavigating(false), 1000);
  };

  const handleSignup = async () => {
    setError("");
    setLoading(true);

    try {
      // Validate all fields
      if (!name || !email || !password || !confirmPassword) {
        setError("Please fill in all fields");
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }

      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      ).catch((error) => {
        // Handle Firebase authentication errors
        if (error.code === "auth/email-already-in-use") {
          throw new Error(
            "Email already in use. Please try a different email."
          );
        } else if (error.code === "auth/invalid-email") {
          throw new Error("Invalid email address format.");
        } else {
          throw error;
        }
      });

      const user = userCredential.user;

      // Save additional user data to Firestore
      await saveUserToFirestore(user, name);

      // Navigate to home after successful signup
      router.replace("/");
    } catch (error) {
      // Show error in UI
      const errorMessage =
        error.message || "Failed to create account. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const saveUserToFirestore = async (user, fullName) => {
    try {
      await setDoc(doc(db, "users", user.uid), {
        name: fullName,
        email: user.email,
        uid: user.uid,
        password: password,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error saving user data:", error);
      throw error;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.backgroundContainer}>
        <Image
          source={require("@/assets/images/landing.png")}
          style={styles.backgroundImage}
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
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <Image
                    source={require("@/assets/images/logo.png")}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.appName}>Skillink</Text>
                <Text style={styles.tagline}>
                  Join our community of skilled professionals
                </Text>
              </View>

              <View style={styles.formContainer}>
                <Text style={styles.welcomeBack}>Create Account</Text>
                <Text style={styles.loginPrompt}>
                  Please fill in your details to register
                </Text>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={activeTheme.textLight}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor={activeTheme.textLight}
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={activeTheme.textLight}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={activeTheme.textLight}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={activeTheme.textLight}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={activeTheme.textLight}
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
                      color={activeTheme.textLight}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={activeTheme.textLight}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor={activeTheme.textLight}
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
                      color={activeTheme.textLight}
                    />
                  </TouchableOpacity>
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TouchableOpacity
                  style={styles.signupButton}
                  onPress={handleSignup}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.signupButtonText}>SIGN UP</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>
                    Already have an account?
                  </Text>
                  <TouchableOpacity
                    onPress={navigateToLogin}
                    disabled={isNavigating}
                  >
                    <Text style={styles.loginLink}>Login</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
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
