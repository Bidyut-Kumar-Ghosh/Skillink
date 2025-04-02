import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, Animated } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { router, usePathname } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/context/ThemeContext";

export default function ProtectedRoute({ children }) {
  const { user, loading, setUser } = useAuth();
  const { theme } = useTheme();
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const pathname = usePathname();

  // Animation for content
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Check if there's stored user information in AsyncStorage
    const checkStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser && !user) {
          // If we have a stored user but no current user, restore from storage
          const parsedUser = JSON.parse(storedUser);
          if (setUser && typeof setUser === "function") {
            setUser(parsedUser);
          }
        }
        setCheckedStorage(true);

        // Fade in animation when ready
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error("Error reading stored user:", error);
        setCheckedStorage(true);
      }
    };

    checkStoredUser();
  }, []);

  useEffect(() => {
    // Only redirect if we've checked storage and user is definitely not logged in
    // and we're not already redirecting
    if (!loading && checkedStorage && !user && !redirecting) {
      // Set redirecting flag to prevent multiple redirects
      setRedirecting(true);

      // Use setTimeout to prevent potential race conditions
      setTimeout(() => {
        // Redirect to login if user is not authenticated
        router.replace("/authentication/login");
      }, 100);
    }
  }, [user, loading, checkedStorage, redirecting]);

  if (loading || !checkedStorage) {
    // Show loading spinner while checking authentication
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Only render children if user is authenticated
  return user ? (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      {children}
    </Animated.View>
  ) : null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
