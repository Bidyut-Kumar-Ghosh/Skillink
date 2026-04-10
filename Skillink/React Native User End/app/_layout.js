import { Stack } from "expo-router";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useTheme } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { usePathname, router } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  View,
  Text,
  Appearance,
  Platform,
  UIManager,
  LogBox,
  StatusBar as RNStatusBar,
  StyleSheet,
} from "react-native";
import { NotificationHandler } from "./components/NotificationHandler";
import { useFonts } from "expo-font";
import { enableScreens } from "react-native-screens";
import * as SplashScreen from "expo-splash-screen";
import { LinearGradient } from "expo-linear-gradient";

// Disable yellow box warnings and console errors/warnings in production
if (!__DEV__) {
  // Disable all console output in production
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.debug = () => {};
}

// Also ignore specific warnings in development
LogBox.ignoreLogs([
  "Require cycle:",
  "AsyncStorage has been extracted from react-native",
  "[auth/invalid-credential]",
  "Login error handled by AuthContext",
  "Error signing in:",
  "Firebase signOut error:",
]);

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Enable optimized native screens container
enableScreens();

// Keep the splash screen visible until resources are loaded
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter-Medium.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter-Bold.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter-SemiBold.ttf"),
  });

  // Hide splash screen once fonts are loaded
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <SafeAreaProvider>
          <RootLayoutNav />
        </SafeAreaProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Layout component that will include the dynamic StatusBar
function RootLayoutNav() {
  const { isDarkMode } = useTheme();
  const { user, loading } = useAuth();
  const currentPath = usePathname();
  const insets = useSafeAreaInsets();

  const androidTopInset =
    Platform.OS === "android"
      ? Math.max(insets.top, RNStatusBar.currentHeight || 0)
      : 0;
  const androidBottomInset = Platform.OS === "android" ? Math.max(insets.bottom, 8) : 0;

  // List of protected paths that require authentication
  const publicPaths = [
    "/authentication/login",
    "/authentication/signup",
    "/authentication/forgot-password",
  ];

  // Check if the current path is public (doesn't require authentication)
  const isPublicRoute = publicPaths.some(
    (path) => currentPath === path || currentPath.startsWith(`${path}/`)
  );

  // Prevent authenticated users from accessing login/signup pages
  useEffect(() => {
    if (!loading && user && isPublicRoute) {
      // Redirect to home if user is already logged in and trying to access auth pages
      router.replace("/");
    }
  }, [user, loading, currentPath, isPublicRoute]);

  return (
    <View style={styles.rootContainer}>
      <ExpoStatusBar
        style="light"
        backgroundColor="#000000"
        translucent={false}
      />

      <View style={[styles.contentFrame, { marginTop: androidTopInset, marginBottom: androidBottomInset }]}>
        <LinearGradient
          colors={
            isDarkMode
              ? ["#1A2545", "#253764", "#2F4680"]
              : ["#FCFEFF", "#F4F9FF", "#EAF3FF"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.decorLayer} pointerEvents="none">
          <LinearGradient
            colors={
              isDarkMode
                ? ["rgba(125, 211, 252, 0.22)", "rgba(125, 211, 252, 0)"]
                : ["rgba(147, 197, 253, 0.22)", "rgba(147, 197, 253, 0)"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.topGlow}
          />
          <LinearGradient
            colors={
              isDarkMode
                ? ["rgba(56, 189, 248, 0.18)", "rgba(56, 189, 248, 0)"]
                : ["rgba(125, 211, 252, 0.16)", "rgba(125, 211, 252, 0)"]
            }
            start={{ x: 1, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={styles.bottomGlow}
          />
        </View>

        <NotificationHandler />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" },
            animation: "fade_from_bottom",
            animationDuration: 200,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  contentFrame: {
    flex: 1,
  },
  decorLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  topGlow: {
    position: "absolute",
    top: -60,
    left: -40,
    width: 260,
    height: 260,
    borderRadius: 140,
  },
  bottomGlow: {
    position: "absolute",
    right: -70,
    bottom: -90,
    width: 300,
    height: 300,
    borderRadius: 170,
  },
});
