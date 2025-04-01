import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

// Key for storing the path to profile image in AsyncStorage
const PROFILE_IMAGE_KEY = "user_profile_image";

/**
 * Saves an image to local storage and stores its reference
 * @param {string} uri - The URI of the image to save
 * @param {string} userId - User ID to associate with the image
 * @returns {Promise<string>} The local URI of the saved image
 */
export const saveProfileImage = async (uri, userId) => {
  try {
    // Process and resize image to ensure it's under 500KB
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 400, height: 400 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Create a unique filename based on user ID
    const fileName = `${userId}_profile_${Date.now()}.jpg`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    // Copy the image to app's document directory for persistence
    await FileSystem.copyAsync({
      from: manipResult.uri,
      to: fileUri,
    });

    // Save the path to AsyncStorage
    await AsyncStorage.setItem(PROFILE_IMAGE_KEY, fileUri);

    return fileUri;
  } catch (error) {
    console.error("Error saving profile image locally:", error);
    throw error;
  }
};

/**
 * Gets the stored profile image URI from AsyncStorage
 * @returns {Promise<string|null>} The URI of the stored image or null if not found
 */
export const getProfileImage = async () => {
  try {
    const imageUri = await AsyncStorage.getItem(PROFILE_IMAGE_KEY);

    if (imageUri) {
      // Check if the file exists
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (fileInfo.exists) {
        return imageUri;
      } else {
        // If file doesn't exist, clear the reference
        await AsyncStorage.removeItem(PROFILE_IMAGE_KEY);
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error("Error retrieving profile image:", error);
    return null;
  }
};

/**
 * Deletes the stored profile image
 * @returns {Promise<boolean>} True if deletion was successful
 */
export const deleteProfileImage = async () => {
  try {
    const imageUri = await AsyncStorage.getItem(PROFILE_IMAGE_KEY);

    if (imageUri) {
      // Check if the file exists
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (fileInfo.exists) {
        // Delete the file
        await FileSystem.deleteAsync(imageUri);
      }

      // Remove the reference from AsyncStorage
      await AsyncStorage.removeItem(PROFILE_IMAGE_KEY);
    }

    return true;
  } catch (error) {
    console.error("Error deleting profile image:", error);
    return false;
  }
};
