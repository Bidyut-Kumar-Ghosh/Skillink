import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboard() {
  const { theme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Admin Dashboard</ThemedText>
        <ThemedText type="subtitle" style={styles.name}>
          Welcome, {user?.name || 'Admin'}
        </ThemedText>
      </ThemedView>

      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.cardBackground }]}
          onPress={() => router.push('courses')}
        >
          <View style={styles.cardHeader}>
            <ThemedText style={styles.icon}>📚</ThemedText>
            <View style={styles.cardContent}>
              <ThemedText type="defaultSemiBold">Manage Courses</ThemedText>
              <ThemedText type="subtitle">Add, edit, or remove courses</ThemedText>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.cardBackground }]}
          onPress={() => router.push('books')}
        >
          <View style={styles.cardHeader}>
            <ThemedText style={styles.icon}>📖</ThemedText>
            <View style={styles.cardContent}>
              <ThemedText type="defaultSemiBold">Manage Books</ThemedText>
              <ThemedText type="subtitle">Add, edit, or remove books</ThemedText>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { borderColor: theme.error }]}
        onPress={handleLogout}
      >
        <ThemedText style={{ color: theme.error }}>Logout</ThemedText>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    marginBottom: 20,
  },
  name: {
    marginTop: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  logoutButton: {
    margin: 20,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
}); 