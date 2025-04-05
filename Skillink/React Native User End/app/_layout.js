import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { usePathname, router } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  View,
  Text,
  Appearance,
  Platform,
  UIManager,
  LogBox,
} from "react-native";
import { NotificationHandler } from "./components/NotificationHandler";
import { useFonts } from "expo-font";
import { enableScreens } from "react-native-screens";
import * as SplashScreen from "expo-splash-screen";

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
        <RootLayoutNav />
      </AuthProvider>
    </ThemeProvider>
  );
}

// Layout component that will include the dynamic StatusBar
function RootLayoutNav() {
  const { isDarkMode } = useTheme();
  const { user, loading } = useAuth();
  const currentPath = usePathname();

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
    <>
      <StatusBar
        style={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={isDarkMode ? "#000000" : "#ffffff"}
      />
      <NotificationHandler />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "transparent" },
          animation: "fade_from_bottom",
          animationDuration: 200,
        }}
      />
    </>
  );
}
