import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { useFonts } from "expo-font";
import React from "react";
import LoginScreen from "../Screen/LoginScreen";

export default function App() {
  <View style={styles.container}></View>;
  const [loaded, error] = useFonts({
    Tektur: require("../fonts/Tektur-Black.ttf"),
  });
  return (
    <View style={styles.container}>
      {/* <Text style={styles.text}>Welcome</Text>
      <Text style={styles.text1}>To Skillink</Text> */}
      <StatusBar style="auto" />
      <LoginScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  // text: {
  //   color: "#fff",
  //   fontFamily: "Tektur",
  // },
  // text1: {
  //   color: "#ff6600",
  //   fontFamily: "Tektur",
  // },
});
