import { Text, View, Image } from "react-native";
import React, { Component } from "react";
import { useFonts } from "expo-font";
import icon from "../../assets/images/login.jpg";
import Colours from "../Utils/Colours";
import Google from "../../assets/images/Google.png";

export default function LoginScreen() {
  <View></View>;
  const [loaded, error] = useFonts({
    Tektur: require("../fonts/Tektur-Bold.ttf"),
  });
  return (
    <View style={{ display: "flex", alignItems: "centers" }}>
      <Image
        source={icon}
        style={{
          width: 600,
          height: 500,
          objectFit: "contain",
          // backgroundColor: Colours.SECONDARY,
          marginTop: 50,
          // marginBottom: 50,
        }}
      />

      <View
        style={{
          height: 600,
          backgroundColor: Colours.DEFAULT,
          width: "auto",
          marginTop: -70,
          padding: 20,
        }}
      >
        <Text
          style={{
            textAlign: "center",
            fontSize: 35,
            color: Colours.BLACK,
            fontFamily: "Tektur",
          }}
        >
          Skillink
        </Text>
        <Text
          style={{
            textAlign: "center",
            fontSize: 20,
            marginTop: 20,
            color: Colours.VAS,
          }}
        >
          Your Learning Solutions
        </Text>
        <View
          style={{
            backgroundColor: Colours.WHITE,
            display: "flex",
            // flexDirection: "row",
            alignItems: "center",
            padding: 150,
            gap: 20,
          }}
        >
          <Image source={Google} style={{ width: 40, height: 40 }} />
          <Text
            style={{
              textAlign: "center",
              fontSize: 20,
              marginTop: 20,
              color: Colours.VAS,
            }}
          >
            Sign in with Google
          </Text>
        </View>
      </View>
    </View>
  );
}
