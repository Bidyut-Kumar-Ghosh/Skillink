// Import necessary components
import { Stack } from "expo-router";
import { useTheme } from '@/context/ThemeContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import Toast from 'react-native-toast-message';
import { NotificationHandler } from './components/NotificationHandler';

// Root layout component
export default function RootLayout() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <RootLayoutNav />
                <NotificationHandler />
                <Toast />
            </AuthProvider>
        </ThemeProvider>
    );
}

// Navigation component
function RootLayoutNav() {
    const { theme } = useTheme();

    // Theme-aware stack navigator options
    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: theme.background,
                },
                headerTintColor: theme.text,
                headerTitleStyle: {
                    fontWeight: '500',
                },
                headerShadowVisible: false,
            }}
        >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="authentication/login" options={{ headerShown: false }} />
            <Stack.Screen name="authentication/register" options={{ headerShown: false }} />
            <Stack.Screen name="authentication/forgot-password" options={{ headerShown: false }} />
        </Stack>
    );
} 