import React, { useEffect, useState } from "react";
import { Stack, router, usePathname } from "expo-router";
import { useFonts } from "expo-font";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { StatusBar } from "react-native";
import SplashScreen from "./components/SplashScreen";
import NotificationHandler from "./components/NotificationHandler";
import * as SplashScreenExpo from "expo-splash-screen";

// Keep the splash screen visible while we fetch resources
SplashScreenExpo.preventAutoHideAsync();

// Layout component that will include the dynamic StatusBar
function RootLayoutNav() {
  const { isDarkMode } = useTheme();
  const { user, loading } = useAuth();
  const currentPath = usePathname();

  // List of paths that should be protected (require authentication)
  const protectedPaths = ["/", "/settings", "/profile", "/help"];

  // Check if the current path requires authentication
  const isProtectedRoute = protectedPaths.some(
    (path) => currentPath === path || currentPath.startsWith(`${path}/`)
  );

  // Redirect to login if user is not authenticated and trying to access a protected route
  useEffect(() => {
    if (!loading && !user && isProtectedRoute) {
      router.replace("/authentication/login");
    }
  }, [user, loading, currentPath, isProtectedRoute]);

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={isDarkMode ? "#000000" : "#ffffff"}
      />
      <NotificationHandler />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "transparent" },
        }}
      />
    </>
  );
}

// Wrap layout with required providers
function LayoutWithProviders() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Inter-Regular": require("@/assets/fonts/Inter-Regular.ttf"),
    "Inter-Medium": require("@/assets/fonts/Inter-Medium.ttf"),
    "Inter-SemiBold": require("@/assets/fonts/Inter-SemiBold.ttf"),
    "Inter-Bold": require("@/assets/fonts/Inter-Bold.ttf"),
  });
  const [appIsReady, setAppIsReady] = useState(false);

  const onSplashFinish = () => {
    setAppIsReady(true);
    SplashScreenExpo.hideAsync();
  };

  if (!fontsLoaded) {
    return null; // Return a loading indicator if you prefer
  }

  // Show splash screen until fonts are loaded
  if (!appIsReady) {
    return <SplashScreen onFinish={onSplashFinish} />;
  }

  return <LayoutWithProviders />;
}
