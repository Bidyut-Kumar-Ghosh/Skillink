import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProtectedRoute({ children }) {
  const { user, loading, setUser, isLoggedIn } = useAuth();
  const [checkedStorage, setCheckedStorage] = useState(false);

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
      } catch (error) {
        console.error("Error reading stored user:", error);
        setCheckedStorage(true);
      }
    };

    checkStoredUser();
  }, []);

  useEffect(() => {
    // Save user info to AsyncStorage when it changes
    const saveUser = async () => {
      try {
        if (user) {
          await AsyncStorage.setItem("user", JSON.stringify(user));
        }
      } catch (error) {
        console.error("Error saving user to storage:", error);
      }
    };

    if (user) {
      saveUser();
    }
  }, [user]);

  useEffect(() => {
    // Only redirect if we've checked storage and user is definitely not logged in
    if (!loading && checkedStorage && !user) {
      // Redirect to login if user is not authenticated
      router.replace("/authentication/login");
    }
  }, [user, loading, checkedStorage]);

  if (loading || !checkedStorage) {
    // Show loading spinner while checking authentication
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3366FF" />
      </View>
    );
  }

  // Only render children if user is authenticated
  return user ? children : null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
