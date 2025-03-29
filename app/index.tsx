import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Image
} from 'react-native';
import { router, Link } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Fonts } from '@/constants/Fonts';
import ThemeToggle from '@/components/ThemeToggle';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

type LoginMethod = 'phone' | 'email';

export default function LoginScreen() {
  const { theme } = useTheme();
  const { signInWithEmail, sendOTP, verifyOTP } = useAuth();

  const [method, setMethod] = useState<LoginMethod>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    try {
      setError('');
      if (!phoneNumber) {
        setError('Please enter a phone number');
        return;
      }
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const vid = await sendOTP(formattedPhone);
      setVerificationId(vid);
      setOtpSent(true);
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
      console.error(error);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setError('');
      if (!otp) {
        setError('Please enter the OTP');
        return;
      }
      await verifyOTP(verificationId, otp);
      router.replace('/dashboard');
    } catch (error) {
      setError('Invalid OTP. Please try again.');
      console.error(error);
    }
  };

  const handleEmailLogin = async () => {
    try {
      setError('');
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }
      await signInWithEmail(email, password);
      router.replace('/dashboard');
    } catch (error) {
      setError('Invalid email or password.');
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.themeToggleContainer}>
          <ThemeToggle size={32} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText type="title" style={[styles.title, { color: theme.primary }]}>
              Skillink
            </ThemedText>
          </View>

          <ThemedView style={styles.container}>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  method === 'phone' && {
                    borderBottomWidth: 2,
                    borderBottomColor: theme.primary
                  }
                ]}
                onPress={() => setMethod('phone')}
              >
                <ThemedText
                  type={method === 'phone' ? 'defaultSemiBold' : 'default'}
                  style={method === 'phone' ? { color: theme.primary } : undefined}
                >
                  Phone
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  method === 'email' && {
                    borderBottomWidth: 2,
                    borderBottomColor: theme.primary
                  }
                ]}
                onPress={() => setMethod('email')}
              >
                <ThemedText
                  type={method === 'email' ? 'defaultSemiBold' : 'default'}
                  style={method === 'email' ? { color: theme.primary } : undefined}
                >
                  Email
                </ThemedText>
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <ThemedText style={[styles.errorText, { color: theme.error }]}>
                  {error}
                </ThemedText>
              </View>
            ) : null}

            {method === 'phone' ? (
              // Phone login form
              <>
                {!otpSent ? (
                  // Phone number input
                  <View style={styles.inputContainer}>
                    <ThemedText style={styles.label}>Phone Number</ThemedText>
                    <TextInput
                      style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      placeholder="Enter your phone number"
                      placeholderTextColor={theme.textLight}
                      keyboardType="phone-pad"
                      editable={!otpSent}
                    />

                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: theme.primary }]}
                      onPress={handleSendOTP}
                      disabled={otpSent}
                    >
                      {otpSent ? (
                        <ActivityIndicator color={theme.buttonText} />
                      ) : (
                        <ThemedText style={[styles.buttonText, { color: theme.buttonText }]}>
                          Send OTP
                        </ThemedText>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  // OTP verification
                  <View style={styles.inputContainer}>
                    <ThemedText style={styles.label}>Verification Code</ThemedText>
                    <TextInput
                      style={[styles.input, styles.otpInput, { borderColor: theme.border, color: theme.text }]}
                      value={otp}
                      onChangeText={setOtp}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor={theme.textLight}
                      keyboardType="number-pad"
                      maxLength={6}
                      editable={!otpSent}
                    />

                    <ThemedText style={styles.otpMessage}>
                      We've sent a 6-digit verification code to {phoneNumber}
                    </ThemedText>

                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: theme.primary }]}
                      onPress={handleVerifyOTP}
                      disabled={otpSent}
                    >
                      {otpSent ? (
                        <ActivityIndicator color={theme.buttonText} />
                      ) : (
                        <ThemedText style={[styles.buttonText, { color: theme.buttonText }]}>
                          Verify OTP
                        </ThemedText>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              // Email login form
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Email</ThemedText>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.textLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!otpSent}
                />

                <ThemedText style={styles.label}>Password</ThemedText>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.textLight}
                  secureTextEntry
                  editable={!otpSent}
                />

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: theme.primary }]}
                  onPress={handleEmailLogin}
                  disabled={otpSent}
                >
                  {otpSent ? (
                    <ActivityIndicator color={theme.buttonText} />
                  ) : (
                    <ThemedText style={[styles.buttonText, { color: theme.buttonText }]}>
                      Login
                    </ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.footerContainer}>
              <ThemedText>Don't have an account?</ThemedText>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity style={styles.textButton}>
                  <ThemedText style={{ color: theme.primary, fontFamily: Fonts.primary.semiBold }}>
                    Sign up
                  </ThemedText>
                </TouchableOpacity>
              </Link>
            </View>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  themeToggleContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: Fonts.sizes.title,
  },
  container: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  errorContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
  },
  errorText: {
    fontSize: Fonts.sizes.small,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontFamily: Fonts.primary.medium,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: Fonts.sizes.medium,
  },
  otpInput: {
    textAlign: 'center',
    letterSpacing: 2,
    fontSize: 20,
  },
  otpMessage: {
    marginBottom: 16,
    textAlign: 'center',
    fontSize: Fonts.sizes.small,
  },
  button: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontFamily: Fonts.primary.semiBold,
    fontSize: Fonts.sizes.medium,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    alignItems: 'center',
  },
  textButton: {
    marginLeft: 8,
    padding: 4,
  },
});
