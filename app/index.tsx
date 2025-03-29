import React from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { router, Link } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { FacebookIcon, GithubIcon, GoogleIcon } from '@/components/SocialIcons';
import { Fonts } from '@/constants/Fonts';
import ThemeToggle from '@/components/ThemeToggle';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isTablet = width > 768;

export default function HomeScreen() {
  const { login, isLoading, isLoggedIn, user } = useAuth();
  const { theme, isDarkMode } = useTheme();

  const handleLogin = async (provider: string) => {
    await login(provider);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: theme.primary, dark: theme.primaryDark }}
      headerImage={
        <Image
          source={require('@/assets/images/landing.png')}
          style={[styles.headerImage, {
            height: isTablet ? height * 0.3 : height * 0.25,
          }]}
          resizeMode="cover"
        />
      }>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.themeToggleContainer}>
          <ThemeToggle size={36} />
        </View>
        <ThemedView style={styles.container}>
          <View style={styles.titleContainer}>
            <ThemedText type="title" style={[styles.title, isSmallDevice && styles.smallTitle, { color: theme.primary }]}>Skillink</ThemedText>
            <ThemedText type="subtitle" style={[styles.subtitle, isSmallDevice && styles.smallSubtitle]}>Connect to your learning journey</ThemedText>
          </View>

          {isLoggedIn ? (
            <ThemedView style={styles.welcomeContainer}>
              <ThemedText type="subtitle">Welcome, {user?.name}!</ThemedText>
              <ThemedText>You are logged in with {user?.provider}</ThemedText>
              <TouchableOpacity
                style={[styles.dashboardButton, { backgroundColor: theme.primary }]}
                onPress={() => router.push('/dashboard')}>
                <ThemedText style={[styles.dashboardButtonText, { color: theme.buttonText }]}>Go to Dashboard</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          ) : (
            <>
              <ThemedView style={[styles.featureContainer, { backgroundColor: isDarkMode ? theme.cardBackground : 'rgba(255, 255, 255, 0.8)' }]}>
                <ThemedText type="subtitle" style={isSmallDevice && styles.smallSubtitle}>Why Skillink?</ThemedText>

                <ThemedView style={styles.feature}>
                  <ThemedText type="defaultSemiBold" style={isSmallDevice && styles.smallFeatureTitle}>📚 Expert-Led Courses</ThemedText>
                  <ThemedText style={isSmallDevice && styles.smallText}>Learn from industry professionals with years of experience.</ThemedText>
                </ThemedView>

                <ThemedView style={styles.feature}>
                  <ThemedText type="defaultSemiBold" style={isSmallDevice && styles.smallFeatureTitle}>🎯 Personalized Learning</ThemedText>
                  <ThemedText style={isSmallDevice && styles.smallText}>AI-driven recommendations based on your goals and progress.</ThemedText>
                </ThemedView>

                <ThemedView style={styles.feature}>
                  <ThemedText type="defaultSemiBold" style={isSmallDevice && styles.smallFeatureTitle}>🌐 Community Support</ThemedText>
                  <ThemedText style={isSmallDevice && styles.smallText}>Connect with peers and mentors on your learning journey.</ThemedText>
                </ThemedView>
              </ThemedView>

              <ThemedView style={styles.authContainer}>
                <ThemedText type="subtitle" style={[styles.authTitle, isSmallDevice && styles.smallSubtitle]}>Get Started Today</ThemedText>

                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <ThemedText style={styles.loadingText}>Logging in...</ThemedText>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[styles.authButton, styles.googleButton, isTablet && styles.tabletButton]}
                      onPress={() => handleLogin('Google')}>
                      <GoogleIcon size={24} />
                      <ThemedText style={[styles.buttonText, isSmallDevice && styles.smallButtonText]}>Continue with Google</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.authButton, styles.facebookButton, isTablet && styles.tabletButton]}
                      onPress={() => handleLogin('Facebook')}>
                      <FacebookIcon size={24} />
                      <ThemedText style={[styles.buttonText, styles.whiteText, isSmallDevice && styles.smallButtonText]}>Continue with Facebook</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.authButton, styles.githubButton, isTablet && styles.tabletButton]}
                      onPress={() => handleLogin('GitHub')}>
                      <GithubIcon size={24} />
                      <ThemedText style={[styles.buttonText, styles.whiteText, isSmallDevice && styles.smallButtonText]}>Continue with GitHub</ThemedText>
                    </TouchableOpacity>

                    <View style={styles.signupContainer}>
                      <ThemedText style={isSmallDevice && styles.smallText}>Don't have an account?</ThemedText>
                      <Link href="/(auth)/signup" asChild>
                        <TouchableOpacity>
                          <ThemedText type="link" style={[styles.signupText, isSmallDevice && styles.smallText, { color: theme.primary }]}> Sign up</ThemedText>
                        </TouchableOpacity>
                      </Link>
                    </View>

                    <Link href="/explore" asChild>
                      <TouchableOpacity style={[styles.exploreButton, { borderColor: theme.primary }]}>
                        <ThemedText style={[styles.exploreButtonText, { color: theme.primary }]}>Explore Courses</ThemedText>
                      </TouchableOpacity>
                    </Link>
                  </>
                )}
              </ThemedView>
            </>
          )}
        </ThemedView>
      </SafeAreaView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: Dimensions.get('window').width < 375 ? 15 : 20,
    gap: Dimensions.get('window').width < 375 ? 16 : 24,
  },
  headerImage: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  themeToggleContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: Dimensions.get('window').width < 375 ? 10 : 16,
    marginBottom: Dimensions.get('window').width < 375 ? 5 : 8,
  },
  title: {
    fontSize: Fonts.sizes.title,
  },
  smallTitle: {
    fontSize: 28,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.8,
  },
  smallSubtitle: {
    fontSize: Fonts.sizes.medium,
    marginTop: 4,
  },
  smallText: {
    fontSize: Fonts.sizes.small,
  },
  smallFeatureTitle: {
    fontSize: Fonts.sizes.medium,
  },
  featureContainer: {
    gap: Dimensions.get('window').width < 375 ? 12 : 16,
    padding: Dimensions.get('window').width < 375 ? 12 : 16,
    borderRadius: 12,
    ...(Platform.OS === 'ios'
      ? {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
      }
      : {
        elevation: 3
      }
    ),
  },
  feature: {
    gap: 4,
    paddingVertical: Dimensions.get('window').width < 375 ? 6 : 8,
  },
  authContainer: {
    gap: Dimensions.get('window').width < 375 ? 8 : 12,
    alignItems: 'center',
    marginTop: Dimensions.get('window').width < 375 ? 12 : 16,
    marginBottom: Dimensions.get('window').width < 375 ? 30 : 40,
  },
  authTitle: {
    marginBottom: 8,
    alignSelf: 'center',
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Dimensions.get('window').width < 375 ? 10 : 12,
    paddingHorizontal: Dimensions.get('window').width < 375 ? 16 : 24,
    borderRadius: 50,
    width: '100%',
    marginBottom: 8,
    ...(Platform.OS === 'ios'
      ? {
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)'
      }
      : {
        elevation: 2
      }
    ),
  },
  tabletButton: {
    width: '80%',
    maxWidth: 500,
  },
  googleButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  githubButton: {
    backgroundColor: '#333',
  },
  authIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIconText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  smallButtonText: {
    fontSize: 14,
  },
  whiteText: {
    color: 'white',
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: Dimensions.get('window').width < 375 ? 8 : 12,
  },
  signupText: {
    color: '#6C63FF',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Dimensions.get('window').width < 375 ? 16 : 20,
  },
  loadingText: {
    marginTop: Dimensions.get('window').width < 375 ? 8 : 12,
    fontSize: Dimensions.get('window').width < 375 ? 14 : 16,
  },
  welcomeContainer: {
    alignItems: 'center',
    padding: Dimensions.get('window').width < 375 ? 16 : 20,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.8)' : undefined,
    borderRadius: 12,
    gap: Dimensions.get('window').width < 375 ? 8 : 12,
    ...(Platform.OS === 'ios'
      ? {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
      }
      : {
        elevation: 3
      }
    ),
  },
  dashboardButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: Dimensions.get('window').width < 375 ? 10 : 12,
    paddingHorizontal: Dimensions.get('window').width < 375 ? 16 : 24,
    borderRadius: 50,
    marginTop: Dimensions.get('window').width < 375 ? 12 : 16,
    ...(Platform.OS === 'ios'
      ? {
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)'
      }
      : {
        elevation: 2
      }
    ),
  },
  dashboardButtonText: {
    color: 'white',
    fontSize: Dimensions.get('window').width < 375 ? 14 : 16,
    fontWeight: '600',
  },
  exploreButton: {
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: 'transparent',
  },
  exploreButtonText: {
    fontSize: Fonts.sizes.medium,
    fontFamily: Fonts.primary.medium,
  },
});
