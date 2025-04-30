import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, ScrollView, StatusBar, Platform } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import Dashboard from './components/Dashboard';

export default function Wishlist() {
    const { isDarkMode } = useTheme();

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
            <StatusBar backgroundColor={isDarkMode ? "#000000" : "#FFFFFF"} barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <View style={[styles.header, isDarkMode && styles.darkHeader]}>
                <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Wishlist</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.emptyStateContainer}>
                    <Ionicons
                        name="heart"
                        size={80}
                        color={isDarkMode ? "#3D435C" : "#FEE0E0"}
                    />
                    <Text style={[styles.emptyStateTitle, isDarkMode && styles.darkText]}>
                        Your wishlist is empty
                    </Text>
                    <Text style={[styles.emptyStateDescription, isDarkMode && { color: '#8F96AB' }]}>
                        Save courses you're interested in to come back to them later.
                    </Text>
                    <TouchableOpacity
                        style={styles.browseButton}
                        onPress={() => router.push('/')}
                    >
                        <Text style={styles.browseButtonText}>Explore Courses</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Dashboard isNested={true} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    darkContainer: {
        backgroundColor: '#000000',
    },
    header: {
        padding: 20,
        paddingTop: Platform.OS === 'android' ? 15 : 10,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    darkHeader: {
        backgroundColor: '#121212',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333333',
    },
    darkText: {
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
        marginBottom: 65,
    },
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        marginTop: 60,
    },
    emptyStateTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333333',
        marginTop: 20,
        marginBottom: 10,
    },
    emptyStateDescription: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
    },
    browseButton: {
        backgroundColor: '#3366FF',
        paddingHorizontal: 30,
        paddingVertical: 14,
        borderRadius: 8,
        shadowColor: '#3366FF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    browseButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
}); 