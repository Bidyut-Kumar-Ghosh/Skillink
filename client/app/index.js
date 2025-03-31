import React from "react";
import { View, StyleSheet } from "react-native";
import { useAuth } from "@/context/AuthContext";
import Dashboard from "./components/Dashboard";
import { Redirect } from "expo-router";

export default function Home() {
  const { isLoggedIn, loading } = useAuth();

  // Show loading state or redirect to login if not logged in
  if (loading) {
    return <View style={styles.container} />;
  }

  if (!isLoggedIn) {
    return <Redirect href="/authentication/login" />;
  }

  // If logged in, show the dashboard
  return <Dashboard />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
