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
  Image,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";

function Educators() {
  const { user, loading } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const [educators, setEducators] = useState([]);
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

    // Simulate loading educators data
    setTimeout(() => {
      setEducators([
        {
          id: "1",
          name: "Prof. Rahul Sharma",
          subject: "Banking & Finance",
          students: "15,400+",
          image: null, // Placeholder for profile image
        },
        {
          id: "2",
          name: "Dr. Priya Patel",
          subject: "Quantitative Aptitude",
          students: "10,200+",
          image: null,
        },
        {
          id: "3",
          name: "Mr. Vikram Singh",
          subject: "General Knowledge",
          students: "8,700+",
          image: null,
        },
        {
          id: "4",
          name: "Mrs. Anjali Gupta",
          subject: "Reasoning & Logic",
          students: "12,800+",
          image: null,
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

  const getInitial = (name) => {
    if (name && name.length > 0) {
      return name.charAt(0).toUpperCase();
    }
    return "E";
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.educatorItem,
        { backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF" },
      ]}
    >
      <View style={styles.educatorImageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.educatorImage} />
        ) : (
          <View
            style={[
              styles.educatorImagePlaceholder,
              { backgroundColor: isDarkMode ? "#2D3246" : "#E6F0FF" },
            ]}
          >
            <Text
              style={[
                styles.educatorInitial,
                { color: isDarkMode ? "#FFFFFF" : "#3366FF" },
              ]}
            >
              {getInitial(item.name)}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.educatorContent}>
        <Text
          style={[
            styles.educatorName,
            { color: isDarkMode ? "#FFFFFF" : "#333333" },
          ]}
        >
          {item.name}
        </Text>
        <Text
          style={[
            styles.educatorSubject,
            { color: isDarkMode ? "#8F96AB" : "#666666" },
          ]}
        >
          {item.subject}
        </Text>
        <View style={styles.educatorStats}>
          <Ionicons
            name="people"
            size={14}
            color={isDarkMode ? "#4D9CFF" : "#3366FF"}
          />
          <Text
            style={[
              styles.educatorStudents,
              { color: isDarkMode ? "#8F96AB" : "#666666" },
            ]}
          >
            {item.students} students
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.viewCourseButton,
          { backgroundColor: isDarkMode ? "#2D3246" : "#E6F0FF" },
        ]}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.viewCourseText,
            { color: isDarkMode ? "#4D9CFF" : "#3366FF" },
          ]}
        >
          View Courses
        </Text>
      </TouchableOpacity>
    </View>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="people-outline"
        size={64}
        color={isDarkMode ? "#3D435C" : "#BDC4E0"}
      />
      <Text
        style={[
          styles.emptyTitle,
          { color: isDarkMode ? "#FFFFFF" : "#333333" },
        ]}
      >
        No Educators Yet
      </Text>
      <Text
        style={[
          styles.emptyText,
          { color: isDarkMode ? "#8F96AB" : "#666666" },
        ]}
      >
        You haven't enrolled with any educators yet. Browse our courses to find
        expert educators.
      </Text>
      <TouchableOpacity
        style={[styles.browseButton, { backgroundColor: "#3366FF" }]}
        activeOpacity={0.7}
        onPress={() => router.push("/")}
      >
        <Text style={styles.browseButtonText}>Find Educators</Text>
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
          <Text style={styles.headerTitle}>MY EDUCATORS</Text>
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
              data={educators}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.educatorsList}
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
  educatorsList: {
    flexGrow: 1,
  },
  educatorItem: {
    flexDirection: "row",
    alignItems: "center",
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
  educatorImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    marginRight: 15,
  },
  educatorImage: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
  },
  educatorImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E6F0FF",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
  },
  educatorInitial: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3366FF",
    fontFamily: "Inter-Bold",
  },
  educatorContent: {
    flex: 1,
  },
  educatorName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    fontFamily: "Inter-SemiBold",
  },
  educatorSubject: {
    fontSize: 14,
    marginBottom: 5,
    fontFamily: "Inter-Regular",
  },
  educatorStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  educatorStudents: {
    fontSize: 12,
    marginLeft: 5,
    fontFamily: "Inter-Regular",
  },
  viewCourseButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 10,
  },
  viewCourseText: {
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "Inter-SemiBold",
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

export default Educators;
