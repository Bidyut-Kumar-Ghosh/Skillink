import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  Platform,
  Animated,
  FlatList,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";

function Purchases() {
  const { user, loading } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    "Inter-Bold": require("@/assets/fonts/Inter-Bold.ttf"),
    "Inter-Medium": require("@/assets/fonts/Inter-Medium.ttf"),
    "Inter-Regular": require("@/assets/fonts/Inter-Regular.ttf"),
    "Inter-SemiBold": require("@/assets/fonts/Inter-SemiBold.ttf"),
  });

  // Run animations when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Simulate loading purchases data
    setTimeout(() => {
      setPurchases([
        {
          id: "1",
          name: "Banking Exam Premium",
          date: "15 Mar 2023",
          price: "₹999",
          status: "active",
        },
        {
          id: "2",
          name: "SSC Study Material",
          date: "20 Jan 2023",
          price: "₹799",
          status: "active",
        },
        {
          id: "3",
          name: "UPSC Prelims Course",
          date: "5 Dec 2022",
          price: "₹1999",
          status: "expired",
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Handle back button with animation
  const handleBackPress = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -30,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.back();
    });
  };

  // Show loading while checking authentication or loading fonts
  if (loading || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3366FF" />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.purchaseItem,
        { backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF" },
      ]}
    >
      <View style={styles.purchaseContent}>
        <Text
          style={[
            styles.purchaseName,
            { color: isDarkMode ? "#FFFFFF" : "#333333" },
          ]}
        >
          {item.name}
        </Text>
        <Text
          style={[
            styles.purchaseDate,
            { color: isDarkMode ? "#8F96AB" : "#666666" },
          ]}
        >
          Purchased on: {item.date}
        </Text>
        <View style={styles.purchaseDetails}>
          <Text
            style={[
              styles.purchasePrice,
              { color: isDarkMode ? "#FFFFFF" : "#333333" },
            ]}
          >
            {item.price}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === "active"
                    ? isDarkMode
                      ? "#1E3A5F"
                      : "#E6F0FF"
                    : isDarkMode
                    ? "#3D2E24"
                    : "#FFEFE6",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    item.status === "active"
                      ? isDarkMode
                        ? "#4D9CFF"
                        : "#3366FF"
                      : isDarkMode
                      ? "#FF9966"
                      : "#FF6B3F",
                },
              ]}
            >
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.viewButton} activeOpacity={0.7}>
        <Ionicons
          name="arrow-forward-circle-outline"
          size={24}
          color={isDarkMode ? "#4D9CFF" : "#3366FF"}
        />
      </TouchableOpacity>
    </View>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="cart-outline"
        size={64}
        color={isDarkMode ? "#3D435C" : "#BDC4E0"}
      />
      <Text
        style={[
          styles.emptyTitle,
          { color: isDarkMode ? "#FFFFFF" : "#333333" },
        ]}
      >
        No Purchases Yet
      </Text>
      <Text
        style={[
          styles.emptyText,
          { color: isDarkMode ? "#8F96AB" : "#666666" },
        ]}
      >
        You haven't made any purchases yet. Browse our courses to get started.
      </Text>
      <TouchableOpacity
        style={[styles.browseButton, { backgroundColor: "#3366FF" }]}
        activeOpacity={0.7}
        onPress={() => router.push("/")}
      >
        <Text style={styles.browseButtonText}>Browse Courses</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        isDarkMode
          ? { backgroundColor: "#000000" }
          : { backgroundColor: "#F8F9FA" },
      ]}
    >
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <View
        style={[
          styles.backgroundContainer,
          isDarkMode
            ? { backgroundColor: "#000000" }
            : { backgroundColor: "#F8F9FA" },
        ]}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: isDarkMode ? "#121212" : "#3366FF",
              borderBottomColor: isDarkMode ? "#1E1E1E" : "transparent",
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>MY PURCHASES</Text>
          <View style={styles.headerRight} />
        </View>

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color="#3366FF"
              style={styles.contentLoader}
            />
          ) : (
            <FlatList
              data={purchases}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.purchasesList}
              ListEmptyComponent={ListEmptyComponent}
            />
          )}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A2138",
  },
  backgroundContainer: {
    flex: 1,
    backgroundColor: "#1A2138",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 40 : 20,
    paddingBottom: 20,
    backgroundColor: "#1A2138",
    borderBottomWidth: 1,
    borderBottomColor: "#3D435C",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 4,
  },
  backButton: {
    padding: 10,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 1,
    fontFamily: "Inter-SemiBold",
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  contentLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  purchasesList: {
    flexGrow: 1,
  },
  purchaseItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  purchaseContent: {
    flex: 1,
  },
  purchaseName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    fontFamily: "Inter-SemiBold",
  },
  purchaseDate: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: "Inter-Regular",
  },
  purchaseDetails: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  purchasePrice: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Inter-SemiBold",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "Inter-SemiBold",
  },
  viewButton: {
    justifyContent: "center",
    paddingLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A2138",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 50,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    fontFamily: "Inter-SemiBold",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Inter-Regular",
  },
  browseButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#3366FF",
  },
  browseButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
    fontFamily: "Inter-SemiBold",
  },
});

export default Purchases;
