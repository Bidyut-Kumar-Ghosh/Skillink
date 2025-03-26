import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { db, setDoc, doc } from "../Database/firebaseConfig";
import { getAuth } from "firebase/auth";
import Colours from "../Utils/Colours";

const CompleteProfileScreen = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const navigation = useNavigation();
  const auth = getAuth();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateMobileNumber = (number) => /^[6-9]\d{9}$/.test(number);

  const isFormValid =
    fullName &&
    email &&
    mobileNumber &&
    validateEmail(email) &&
    validateMobileNumber(mobileNumber);

  const handleProfileCompletion = async () => {
    if (!isFormValid) {
      Alert.alert("Invalid Input", "Please complete all fields correctly.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "User not authenticated.");
        return;
      }

      const userProfile = {
        uid: user.uid,
        name: fullName,
        email: email,
        phone: mobileNumber,
        profileImage: "https://example.com/photo.jpg", // Update with actual image upload feature later
        skills: [], // You can let the user select skills later
      };

      await setDoc(doc(db, "users", user.uid), userProfile);

      Alert.alert("Success", "Profile completed successfully!");
      navigation.navigate("Home");
    } catch (error) {
      Alert.alert("Error", "Failed to save profile data: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete Your Profile</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Full name"
        value={fullName}
        onChangeText={setFullName}
      />

      <Text style={styles.label}>E-mail address</Text>
      <TextInput
        style={styles.input}
        placeholder="Email address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <Text style={styles.label}>Mobile number</Text>
      <TextInput
        style={styles.input}
        placeholder="Mobile number"
        value={mobileNumber}
        onChangeText={(text) => text.length <= 10 && setMobileNumber(text)}
        keyboardType="phone-pad"
        maxLength={10}
      />

      <TouchableOpacity
        style={isFormValid ? styles.activeButton : styles.disabledButton}
        onPress={handleProfileCompletion}
        disabled={!isFormValid}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: Colours.WHITE,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10,
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  activeButton: {
    backgroundColor: "#00A86B",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#A0DAB5",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CompleteProfileScreen;
