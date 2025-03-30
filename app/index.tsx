import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Fallback theme for safety
const fallbackTheme = {
  background: '#f8f9fa',
  primary: '#3366FF',
  buttonText: '#ffffff',
  text: '#333333',
  textLight: '#8f9bb3',
  cardBackground: '#ffffff',
  error: '#ff3d71',
};

export default function Dashboard() {
  const { user, isLoggedIn, logOut, loading, authLoading } = useAuth();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [lastLogin, setLastLogin] = useState<string>('');
  const [accountCreated, setAccountCreated] = useState<string>('');

  // Use fallback theme if the real theme is not available
  const activeTheme = theme || fallbackTheme;

  // Redirect to login if not logged in
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.replace('/authentication/login');
    } else if (user) {
      fetchUserDetails();
    }
  }, [isLoggedIn, loading, user]);

  const fetchUserDetails = async () => {
    try {
      if (!user) return;

      // Format dates for display
      const now = new Date();
      const loginDate = new Date(user.lastLoginAt || now);
      const createdDate = new Date(user.createdAt || now);

      setLastLogin(formatDate(loginDate));
      setAccountCreated(formatDate(createdDate));
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserDetails();
    setRefreshing(false);
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3366FF" />
      </View>
    );
  }

  // Get first letter of name or email for avatar
  const getInitial = () => {
    if (user?.name && user.name.length > 0) {
      return user.name.charAt(0).toUpperCase();
    } else if (user?.email && user.email.length > 0) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3366FF" />
      <View style={styles.backgroundContainer}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{getInitial()}</Text>
              </View>
            )}
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>{user?.name || 'User'}</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <Ionicons name="person" size={20} color="#3366FF" />
              <Text style={styles.profileTitle}>Profile Information</Text>
            </View>
            <View style={styles.profileInfoItem}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{user?.name || 'Not set'}</Text>
            </View>
            <View style={styles.profileInfoItem}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
            <View style={styles.profileInfoItem}>
              <Text style={styles.infoLabel}>Role:</Text>
              <Text style={styles.roleValue}>
                {user?.role === 'admin' ? 'Administrator' : 'Student'}
              </Text>
            </View>
          </View>

          <View style={styles.analyticsCard}>
            <View style={styles.profileHeader}>
              <Ionicons name="analytics" size={20} color="#3366FF" />
              <Text style={styles.profileTitle}>Account Statistics</Text>
            </View>
            <View style={styles.profileInfoItem}>
              <Text style={styles.infoLabel}>Account Created:</Text>
              <Text style={styles.infoValue}>{accountCreated}</Text>
            </View>
            <View style={styles.profileInfoItem}>
              <Text style={styles.infoLabel}>Last Login:</Text>
              <Text style={styles.infoValue}>{lastLogin}</Text>
            </View>
          </View>

          <View style={styles.quickActionsCard}>
            <View style={styles.profileHeader}>
              <Ionicons name="flash" size={20} color="#3366FF" />
              <Text style={styles.profileTitle}>Quick Actions</Text>
            </View>
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
                <Text style={styles.actionText}>Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="help-circle-outline" size={24} color="#FFFFFF" />
                <Text style={styles.actionText}>Help</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="star-outline" size={24} color="#FFFFFF" />
                <Text style={styles.actionText}>Rate Us</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={logOut}
            disabled={authLoading}
          >
            {authLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={20} color="#FFFFFF" style={styles.logoutIcon} />
                <Text style={styles.logoutText}>LOG OUT</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  backgroundContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(51, 102, 255, 0.8)',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#3366FF',
  },
  headerTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#E0E0E0',
    marginBottom: 5,
  },
  nameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 10,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginLeft: 10,
  },
  profileInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: '#777777',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  roleValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3366FF',
    backgroundColor: 'rgba(51, 102, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  analyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#3366FF',
    width: width / 4,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  actionText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 5,
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#ff3d71',
    height: 55,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
