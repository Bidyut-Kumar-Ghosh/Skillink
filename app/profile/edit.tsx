import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

function EditProfile() {
    const { user, loading, isLoggedIn } = useAuth();
    const { theme, isDarkMode } = useTheme();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect to login if not logged in
    useEffect(() => {
        if (!loading && !isLoggedIn) {
            router.replace('/authentication/login');
            return;
        }

        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
        }
    }, [isLoggedIn, loading, user]);

    const handleSave = async () => {
        try {
            setIsSubmitting(true);

            // Mock API call to update profile
            setTimeout(() => {
                setIsSubmitting(false);
                Alert.alert(
                    "Success",
                    "Profile updated successfully!",
                    [
                        { text: "OK", onPress: () => router.back() }
                    ]
                );
            }, 1000);
        } catch (error) {
            setIsSubmitting(false);
            Alert.alert("Error", "Failed to update profile");
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, isDarkMode && styles.darkBackground]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.darkBackground]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#FFFFFF" : "#333333"} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Edit Profile</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.formContainer}>
                <View style={styles.section}>
                    <Text style={[styles.label, isDarkMode && styles.darkText]}>Name</Text>
                    <TextInput
                        style={[styles.input, isDarkMode && styles.darkInput]}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your name"
                        placeholderTextColor={isDarkMode ? "#8F9BB3" : "#999999"}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={[styles.label, isDarkMode && styles.darkText]}>Email</Text>
                    <TextInput
                        style={[styles.input, isDarkMode && styles.darkInput]}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter your email"
                        placeholderTextColor={isDarkMode ? "#8F9BB3" : "#999999"}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={false}
                    />
                    <Text style={[styles.helperText, isDarkMode && styles.darkTextMuted]}>
                        Email cannot be changed
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.saveButtonText}>SAVE CHANGES</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    darkBackground: {
        backgroundColor: '#000000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333333',
    },
    placeholder: {
        width: 34,
    },
    formContainer: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 25,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333333',
        marginBottom: 10,
    },
    input: {
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E4E9F2',
        fontSize: 16,
        color: '#333333',
    },
    darkInput: {
        backgroundColor: '#1A2138',
        borderColor: '#323759',
        color: '#FFFFFF',
    },
    helperText: {
        marginTop: 5,
        fontSize: 14,
        color: '#999999',
    },
    darkText: {
        color: '#FFFFFF',
    },
    darkTextMuted: {
        color: '#8F9BB3',
    },
    saveButton: {
        backgroundColor: '#3366FF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default EditProfile; 