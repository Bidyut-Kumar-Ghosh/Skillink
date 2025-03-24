// import { Text, View, Image } from "react-native";
// import React, { Component } from "react";
import { useFonts } from "expo-font";
import icon from "../../assets/images/favicon.png";
import Colours from "../Utils/Colours";
import Google from "../../assets/images/Google.png";

// export default function LoginScreen() {
//   <View></View>;
//
//   return (
//     <View style={{ display: "flex", alignItems: "centers" }}>
//       <Image
//         source={icon}
//         style={{
//           width: 600,
//           height: 500,
//           objectFit: "contain",
//           // backgroundColor: Colours.SECONDARY,
//           marginTop: 50,
//           // marginBottom: 50,
//         }}
//       />

//       <View
//         style={{
//           height: 600,
//           backgroundColor: Colours.DEFAULT,
//           width: "auto",
//           marginTop: -70,
//           padding: 20,
//         }}
//       >
//         <Text
//           style={{
//             textAlign: "center",
//             fontSize: 35,
//             color: Colours.BLACK,
//             fontFamily: "Tektur",
//           }}
//         >
//           Skillink
//         </Text>
//         <Text
//           style={{
//             textAlign: "center",
//             fontSize: 20,
//             marginTop: 20,
//             color: Colours.VAS,
//           }}
//         >
//           Your Learning Solutions
//         </Text>
//         <View
//           style={{
//             backgroundColor: Colours.WHITE,
//             display: "flex",
//             // flexDirection: "row",
//             alignItems: "center",
//             padding: 150,
//             gap: 20,
//           }}
//         >
//           <Image source={Google} style={{ width: 40, height: 40 }} />
//           <Text
//             style={{
//               textAlign: "center",
//               fontSize: 20,
//               marginTop: 20,
//               color: Colours.VAS,
//             }}
//           >
//             Sign in with Google
//           </Text>
//         </View>
//       </View>
//     </View>
//   );
// }

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

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const navigation = useNavigation();
  const [loaded, error] = useFonts({
    Tektur: require("../fonts/Tektur-Bold.ttf"),
  });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const handleLogin = () => {
    if (!email || !password) {
      alert("Please fill in both fields");
      return;
    }
    // if
    if (!validateEmail(email)) {
      alert("Please enter a valid email address");
      return;
    }
    alert("Login Successful");
    navigation.navigate("Dashboard");
  };

  return (
    <View style={styles.container}>
      <Image
        source={icon}
        style={{
          width: 200,
          height: 200,
          objectFit: "contain",
          // backgroundColor: Colours.SECONDARY,
          marginTop: 50,
          // marginBottom: 50,
        }}
      />
      <Text style={styles.title}>Welcome to Skillink</Text>
      <Text style={styles.subtitle}>Your Learning Solutions</Text>

      <View style={styles.EmailContainer}>
        <TextInput
          style={styles.inputEmail}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.PasswordContainer}>
        <TextInput
          style={styles.inputPassword}
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
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Image source={Google} style={{ width: 40, height: 40 }} />
        <Text style={styles.loginText}>Sign in with Google</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
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
  title: {
    fontSize: 25,
    fontFamily: "Tektur",
    fontWeight: "bold",
    marginBottom: 20,
    color: Colours.MAIN,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 17,
    // fontWeight: "medium",
    fontFamily: "Tektur",
    // marginTop: 20,
    marginBottom: 20,
    color: Colours.VAS,
  },
  EmailContainer: {
    // gap: 12,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    // paddingBottom:16,
    paddingLeft: 30,
    paddingRight: 10,
    marginBottom: 10,
  },

  PasswordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingLeft: 30,
    paddingRight: 10,
    marginBottom: 15,
  },
  inputPassword: {
    flex: 1,
    height: 45,
  },
  inputEmail: {
    flex: 1,
    // backgroundColor: Colours.MAIN,
    height: 45,
  },
  loginButton: {
    // backgroundColor: "#1E88E5",
    paddingVertical: 10,
    width: "100%",
    borderRadius: 10,
    alignItems: "center",
  },
  loginText: {
    color: Colours.BLACK,
    fontSize: 18,
    // fontFamily: "Tektur",
    // fontWeight: "bold",
    textAlign: "center",
  },
  forgotPassword: {
    marginTop: 15,
    color: "#1E88E5",
  },
});

export default LoginScreen;
