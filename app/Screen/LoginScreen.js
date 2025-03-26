import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Colours from "../Utils/Colours";
import icon from "../../assets/images/favicon.png";

const LoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [useEmail, setUseEmail] = useState(false);
  const navigation = useNavigation();

  const handleContinue = () => {
    if (useEmail) {
      if (!email.includes("@")) {
        alert("Please enter a valid email");
        return;
      }
      checkUser(email);
    } else {
      if (phoneNumber.length !== 10) {
        alert("Please enter a valid 10-digit mobile number");
        return;
      }
      checkUser(phoneNumber);
    }
  };
  const handleLogin = () => {
    if (!emailOrPhone) {
      alert("Please enter your email or phone number");
      return;
    }

    navigation.navigate("CompleteProfile", { emailOrPhone });
  };

  const checkUser = (identifier) => {
    const existingUsers = ["9876543210", "test@example.com"];
    if (existingUsers.includes(identifier)) {
      navigation.navigate("Home");
    } else {
      navigation.navigate("CompleteProfile");
    }
  };

  return (
    <View style={styles.container}>
      <Image source={icon} style={styles.logo} />
      <Text style={styles.tagline}>India’s largest learning platform</Text>

      {useEmail ? (
        <>
          <Text style={styles.label}>Enter your email</Text>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </>
      ) : (
        <>
          <Text style={styles.label}>Enter your mobile number</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={styles.input}
              placeholder="Mobile number"
              keyboardType="phone-pad"
              maxLength={10}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>
        </>
      )}

      <TouchableOpacity onPress={() => setUseEmail(!useEmail)}>
        <Text style={styles.emailOption}>
          {useEmail
            ? "Or continue with phone number"
            : "Or continue with email"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.continueButton,
          (useEmail ? email.includes("@") : phoneNumber.length === 10)
            ? styles.activeButton
            : styles.disabledButton,
        ]}
        onPress={handleContinue}
        disabled={useEmail ? !email.includes("@") : phoneNumber.length !== 10}
      >
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const CompleteProfileScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [state, setState] = useState("");
  const navigation = useNavigation();

  const handleSubmit = () => {
    if (!name || !email.includes("@") || phoneNumber.length !== 10 || !state) {
      alert("Please fill all fields correctly");
      return;
    }
    navigation.navigate("Home");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete your profile</Text>
      <TextInput
        style={styles.input}
        placeholder="Full name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email address"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Mobile number"
        keyboardType="phone-pad"
        maxLength={10}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />
      <TextInput
        style={styles.input}
        placeholder="State of residence"
        value={state}
        onChangeText={setState}
      />
      <TouchableOpacity style={styles.continueButton} onPress={handleSubmit}>
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: Colours.WHITE,
  },
  logo: {
    width: "100%",
    height: 150,
    resizeMode: "contain",
    marginTop: 50,
  },
  tagline: {
    fontSize: 16,
    color: Colours.BLACK,
    fontWeight: "bold",
    marginVertical: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "semibold",
    marginVertical: 20,
  },
  input: {
    width: "100%",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  continueButton: {
    width: "100%",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#00A86B",
    marginTop: 20,
  },
  continueText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  emailOption: {
    color: "#00A86B",
    marginTop: 15,
  },
  activeButton: {
    backgroundColor: "#00A86B",
  },
  disabledButton: {
    backgroundColor: "#A0DAB5",
  },
});

export default LoginScreen;
