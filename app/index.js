import { StatusBar } from "expo-status-bar";
import { createStackNavigator } from "@react-navigation/stack";
import { useFonts } from "expo-font";
import React from "react";
import LoginScreen from "./Screen/LoginScreen";
import SignupScreen from "./Screen/SignupScreen";
import { useNavigation } from "expo-router"; // Ensure navigation works with Expo Router

const Stack = createStackNavigator();

export default function App() {
  const [loaded] = useFonts({
    Tektur: require("./fonts/Tektur-Black.ttf"),
  });

  if (!loaded) {
    return null; // Ensures app does not render before font is loaded
  }

  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}
