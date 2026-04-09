import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/config/firebase";
import {
  collection,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore/lite";

function Purchases() {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);

  const totalSpent = useMemo(
    () => purchases.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [purchases]
  );

  const formatDate = (dateValue) => {
    if (!dateValue) return "Unknown date";

    try {
      if (typeof dateValue.toDate === "function") {
        return dateValue.toDate().toLocaleDateString();
      }

      return new Date(dateValue).toLocaleDateString();
    } catch {
      return "Unknown date";
    }
  };

  useEffect(() => {
    const loadPurchases = async () => {
      if (!user?.id) {
        setPurchases([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const purchasesQuery = query(
          collection(db, "purchases"),
          where("userId", "==", user.id),
          limit(100)
        );

        const snapshot = await getDocs(purchasesQuery);
        const list = [];

        snapshot.forEach((purchaseDoc) => {
          const data = purchaseDoc.data();
          const purchasedAtRaw = data.purchasedAt?.toDate
            ? data.purchasedAt.toDate().getTime()
            : new Date(data.purchasedAt || 0).getTime();

          list.push({
            id: purchaseDoc.id,
            name: data.title || "Untitled Course",
            amount: Number(data.amount || 0),
            status: data.status || "active",
            paymentStatus: data.paymentStatus || "completed",
            date: formatDate(data.purchasedAt),
            purchasedAtRaw,
          });
        });

        const sorted = list.sort((a, b) => {
          return (b.purchasedAtRaw || 0) - (a.purchasedAtRaw || 0);
        });

        setPurchases(sorted);
      } catch (error) {
        console.error("Error loading purchases:", error);
        setPurchases([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPurchases();
  }, [user?.id]);

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
            ${item.amount.toFixed(2)}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.paymentStatus === "completed"
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
                    item.paymentStatus === "completed"
                      ? isDarkMode
                        ? "#4D9CFF"
                        : "#3366FF"
                      : isDarkMode
                      ? "#FF9966"
                      : "#FF6B3F",
                },
              ]}
            >
              {String(item.paymentStatus).toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
      <Ionicons
        name="checkmark-circle-outline"
        size={22}
        color={isDarkMode ? "#4D9CFF" : "#3366FF"}
      />
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
        You have not purchased any courses yet.
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
          styles.header,
          {
            backgroundColor: isDarkMode ? "#121212" : "#3366FF",
            borderBottomColor: isDarkMode ? "#1E1E1E" : "transparent",
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MY PURCHASES</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>Total purchases: {purchases.length}</Text>
        <Text style={styles.summaryText}>Spent: ${totalSpent.toFixed(2)}</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#3366FF" style={styles.contentLoader} />
      ) : (
        <FlatList
          data={purchases}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.purchasesList}
          ListEmptyComponent={ListEmptyComponent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
    borderBottomWidth: 1,
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
  },
  headerRight: {
    width: 40,
  },
  summaryBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#EAF0FF",
  },
  summaryText: {
    color: "#1E3A8A",
    fontSize: 12,
    fontWeight: "700",
  },
  contentLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  purchasesList: {
    flexGrow: 1,
    padding: 20,
  },
  purchaseItem: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    alignItems: "center",
  },
  purchaseContent: {
    flex: 1,
  },
  purchaseName: {
    fontSize: 16,
    fontWeight: "700",
  },
  purchaseDate: {
    fontSize: 12,
    marginTop: 4,
  },
  purchaseDetails: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  purchasePrice: {
    fontSize: 16,
    fontWeight: "800",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12,
  },
  emptyText: {
    marginTop: 8,
    textAlign: "center",
    maxWidth: 280,
  },
  browseButton: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
  },
  browseButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});

export default Purchases;
