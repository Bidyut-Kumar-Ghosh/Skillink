import { Text, View, Image } from "react-native";
import React, { Component } from "react";
import icon from "../../assets/images/login.jpg";

export default function LoginScreen() {
  return (
    <View style={{ display: "flex", alignItems: "center" }}>
      <Image
        source={icon}
        style={{ width: 250, height: 500, objectFit: "contain", marginTop: 50 }}
      />
    </View>
  );
}
