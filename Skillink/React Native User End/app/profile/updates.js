import React, { useEffect, useState, useRef, useCallback } from "react";
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
  RefreshControl,
  Alert,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { db } from "@/config/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";

// Auto-refresh interval in milliseconds (30 seconds)
const AUTO_REFRESH_INTERVAL = 30000;

function Updates() {
  const { user, loading } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const [updates, setUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState(false);
  const refreshIntervalRef = useRef(null);
  const isComponentMounted = useRef(true);

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

  // Fetch updates from Firebase
  const fetchUpdates = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }

    try {
      const updatesCollection = collection(db, "updates");
      const updatesQuery = query(
        updatesCollection,
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(updatesQuery);

      const updatesList = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        updatesList.push({
          id: doc.id,
          title: data.title || "",
          description: data.description || "",
          date: data.date || "Just now",
          type: data.type || "notification",
          isNew: data.isNew !== undefined ? data.isNew : false,
        });
      });

      // Only update state if component is still mounted
      if (isComponentMounted.current) {
        setUpdates(updatesList);
      }
    } catch (error) {
      console.error("Error fetching updates:", error);
      // If there's an error fetching, show empty state
      if (isComponentMounted.current) {
        setUpdates([]);
      }
    } finally {
      if (isComponentMounted.current) {
        setIsLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  // Mark update as read
  const markAsRead = async (updateId) => {
    if (!updateId || markingAsRead) return;

    setMarkingAsRead(true);
    try {
      // Update the Firestore document
      const updateRef = doc(db, "updates", updateId);
      await updateDoc(updateRef, {
        isNew: false,
        updatedAt: new Date(),
      });

      // Update local state to reflect change
      setUpdates(
        updates.map((update) =>
          update.id === updateId ? { ...update, isNew: false } : update
        )
      );
    } catch (error) {
      console.error("Error marking update as read:", error);
      Alert.alert("Error", "Could not mark update as read. Please try again.");
    } finally {
      setMarkingAsRead(false);
    }
  };

  // Mark all updates as read
  const markAllAsRead = async () => {
    if (markingAsRead || updates.filter((u) => u.isNew).length === 0) return;

    setMarkingAsRead(true);
    try {
      // Get all updates that are marked as new
      const newUpdates = updates.filter((update) => update.isNew);

      // Update each one in Firestore
      const updatePromises = newUpdates.map((update) => {
        const updateRef = doc(db, "updates", update.id);
        return updateDoc(updateRef, {
          isNew: false,
          updatedAt: new Date(),
        });
      });

      await Promise.all(updatePromises);

      // Update local state to reflect all updates as read
      setUpdates(
        updates.map((update) => ({
          ...update,
          isNew: false,
        }))
      );
    } catch (error) {
      console.error("Error marking all updates as read:", error);
      Alert.alert(
        "Error",
        "Could not mark all updates as read. Please try again."
      );
    } finally {
      setMarkingAsRead(false);
    }
  };

  // Handle manual refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUpdates(false);
  }, [fetchUpdates]);

  // Setup auto-refresh
  useEffect(() => {
    // Initial fetch and animation
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

    fetchUpdates();

    // Set up interval for auto-refresh
    refreshIntervalRef.current = setInterval(() => {
      if (isComponentMounted.current) {
        console.log("Auto-refreshing updates...");
        fetchUpdates(false);
      }
    }, AUTO_REFRESH_INTERVAL);

    // Cleanup on unmount
    return () => {
      isComponentMounted.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [fetchUpdates]);

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

  const getIconForType = (type) => {
    switch (type) {
      case "course":
        return "book-outline";
      case "notification":
        return "notifications-outline";
      case "report":
        return "analytics-outline";
      case "offer":
        return "pricetag-outline";
      case "material":
        return "document-text-outline";
      default:
        return "information-circle-outline";
    }
  };

  const getColorForType = (type) => {
    switch (type) {
      case "course":
        return isDarkMode ? "#4D9CFF" : "#3366FF";
      case "notification":
        return isDarkMode ? "#FF7D67" : "#FF5E3A";
      case "report":
        return isDarkMode ? "#9871F5" : "#7452C8";
      case "offer":
        return isDarkMode ? "#46C390" : "#32B679";
      case "material":
        return isDarkMode ? "#F8BB54" : "#F6AB2F";
      default:
        return isDarkMode ? "#8F96AB" : "#6E7383";
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.updateItem,
        {
          backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF",
          borderLeftColor: getColorForType(item.type),
        },
      ]}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: isDarkMode ? "#242B42" : "#F5F5F5" },
        ]}
      >
        <Ionicons
          name={getIconForType(item.type)}
          size={22}
          color={getColorForType(item.type)}
        />
      </View>
      <View style={styles.updateContent}>
        <View style={styles.updateTitleRow}>
          <Text
            style={[
              styles.updateTitle,
              { color: isDarkMode ? "#FFFFFF" : "#333333" },
            ]}
          >
            {item.title}
          </Text>
          {item.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
        </View>
        <Text
          style={[
            styles.updateDescription,
            { color: isDarkMode ? "#8F96AB" : "#666666" },
          ]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
        <View style={styles.updateFooter}>
          <Text
            style={[
              styles.updateDate,
              { color: isDarkMode ? "#5D6986" : "#8F8F8F" },
            ]}
          >
            {item.date}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="notifications-off-outline"
        size={64}
        color={isDarkMode ? "#3D435C" : "#BDC4E0"}
      />
      <Text
        style={[
          styles.emptyTitle,
          { color: isDarkMode ? "#FFFFFF" : "#333333" },
        ]}
      >
        No Updates Yet
      </Text>
      <Text
        style={[
          styles.emptyText,
          { color: isDarkMode ? "#8F96AB" : "#666666" },
        ]}
      >
        You don't have any new updates or notifications at the moment.
      </Text>
    </View>
  );

  const ListHeaderComponent = () => (
    <View style={styles.headerContainer}>
      <Text
        style={[
          styles.sectionTitle,
          { color: isDarkMode ? "#FFFFFF" : "#333333" },
        ]}
      >
        Recent Updates
      </Text>
      {updates.some((update) => update.isNew) && (
        <TouchableOpacity
          style={[
            styles.markAllReadButton,
            { backgroundColor: isDarkMode ? "#2C3E50" : "#EEF3FF" },
          ]}
          onPress={markAllAsRead}
          disabled={markingAsRead}
        >
          <Text
            style={[
              styles.markAllReadText,
              { color: isDarkMode ? "#4D9CFF" : "#3366FF" },
            ]}
          >
            {markingAsRead ? "Marking..." : "Mark all as read"}
          </Text>
        </TouchableOpacity>
      )}
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
          <Text style={styles.headerTitle}>UPDATES</Text>
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
              data={updates}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.updatesList}
              ListEmptyComponent={ListEmptyComponent}
              ListHeaderComponent={
                updates.length > 0 ? ListHeaderComponent : null
              }
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#3366FF"]}
                  tintColor={isDarkMode ? "#4D9CFF" : "#3366FF"}
                  progressBackgroundColor={isDarkMode ? "#242B42" : "#F5F5F5"}
                />
              }
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
  updatesList: {
    flexGrow: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Inter-SemiBold",
  },
  markAllReadButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#EEF3FF",
  },
  markAllReadText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  updateItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  updateContent: {
    flex: 1,
  },
  updateTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  updateTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    fontFamily: "Inter-SemiBold",
  },
  newBadge: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 10,
  },
  newBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: "Inter-Bold",
  },
  updateDescription: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: "Inter-Regular",
  },
  updateDate: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
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
  updateFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
});

export default Updates;
