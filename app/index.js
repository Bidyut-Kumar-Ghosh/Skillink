import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import LoginScreen from "./Screen/LoginScreen";
// import SignupScreen from "./Screen/SignupScreen";
import CompleteProfileScreen from "./Screen/CompleteProfileScreen";
// import HomeScreen from "./Screen/HomeScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    // <NavigationContainer>
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      {/* <Stack.Screen name="Signup" component={SignupScreen} /> */}
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
      {/* <Stack.Screen name="Home" component={HomeScreen} /> */}
    </Stack.Navigator>
    // </NavigationContainer>
  );
}
