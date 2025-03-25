import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import icon from "../../assets/images/favicon.png";
import Google from "../../assets/images/Google.png";
import Colours from "../Utils/Colours";

const SignUpScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const navigation = useNavigation();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = () => {
    if (!email || !password || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }
    if (!validateEmail(email)) {
      alert("Please enter a valid email address");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    alert("Sign-Up Successful");
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <Image source={icon} style={styles.logo} />
      <Text style={styles.title}>Create an Account</Text>
      <Text style={styles.subtitle}>Join Skillink today</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={secureText}
        />
        <TouchableOpacity onPress={() => setSecureText(!secureText)}>
          <MaterialIcons
            name={secureText ? "visibility-off" : "visibility"}
            size={24}
            color="gray"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={secureText}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.switchText}>Already have an account? Log In</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colours.WHITE,
    padding: 20,
  },
  logo: {
    width: 200,
    height: 200,
    objectFit: "contain",
    marginTop: 50,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 20,
    color: Colours.MAIN,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 17,
    marginBottom: 20,
    color: Colours.VAS,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingLeft: 30,
    paddingRight: 10,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 45,
  },
  button: {
    backgroundColor: Colours.MAIN,
    paddingVertical: 10,
    width: "100%",
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: Colours.WHITE,
    fontSize: 18,
    textAlign: "center",
  },
  switchText: {
    marginTop: 15,
    color: "#1E88E5",
  },
});

export default SignUpScreen;
