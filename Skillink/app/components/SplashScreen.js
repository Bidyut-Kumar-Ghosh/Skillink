import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  Animated,
  Easing,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

// Create 15 particles for background animation
const PARTICLES_COUNT = 15;

const SplashScreen = ({ onFinish }) => {
  const { isDarkMode } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const logoFadeAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const textSlideAnim = useRef(new Animated.Value(50)).current;
  const taglineFadeAnim = useRef(new Animated.Value(0)).current;
  const taglineSlideAnim = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Particles animations (random positions, sizes, and timings)
  const particles = Array(PARTICLES_COUNT)
    .fill(0)
    .map(() => ({
      position: {
        x: useRef(new Animated.Value(Math.random() * width)).current,
        y: useRef(new Animated.Value(Math.random() * height)).current,
      },
      opacity: useRef(new Animated.Value(0)).current,
      scale: useRef(new Animated.Value(Math.random() * 0.5 + 0.5)).current,
      speed: Math.random() * 3000 + 2000,
      delay: Math.random() * 2000,
      size: Math.floor(Math.random() * 10) + 4,
    }));

  // Convert rotate value to rotation degrees string
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Create a pulse animation for the logo
  const pulse = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.05],
  });

  useEffect(() => {
    // First animate the background
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.quad,
      useNativeDriver: true,
    }).start();

    // Animate all particles
    particles.forEach((particle) => {
      // Create random movement patterns
      const animateParticle = () => {
        Animated.sequence([
          // Wait random delay
          Animated.delay(particle.delay),
          // Fade in
          Animated.timing(particle.opacity, {
            toValue: Math.random() * 0.5 + 0.1,
            duration: 800,
            useNativeDriver: true,
          }),
          // Move to random position
          Animated.parallel([
            Animated.timing(particle.position.x, {
              toValue: Math.random() * width,
              duration: particle.speed,
              easing: Easing.sine,
              useNativeDriver: true,
            }),
            Animated.timing(particle.position.y, {
              toValue: Math.random() * height,
              duration: particle.speed,
              easing: Easing.sine,
              useNativeDriver: true,
            }),
          ]),
          // Fade out
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => animateParticle());
      };

      animateParticle();
    });

    // Then show the logo with rotation and bounce
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(logoFadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.elastic(2),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Start pulsing animation for the logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.sine,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.sine,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Then animate the app name with slide-in
    Animated.sequence([
      Animated.delay(1200),
      Animated.parallel([
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(textSlideAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.elastic(1.7),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Finally animate the tagline with slide-in
    Animated.sequence([
      Animated.delay(1800),
      Animated.parallel([
        Animated.timing(taglineFadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(taglineSlideAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.elastic(1.2),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Finish splash screen after a delay
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 4500); // Extended to show full animation

    return () => clearTimeout(timer);
  }, []);

  return (
    <TouchableWithoutFeedback onPress={onFinish}>
      <Animated.View
        style={[
          styles.container,
          isDarkMode ? styles.darkContainer : styles.lightContainer,
          { opacity: fadeAnim },
        ]}
      >
        {/* Animated particles in background */}
        {particles.map((particle, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                width: particle.size,
                height: particle.size,
                borderRadius: particle.size / 2,
                backgroundColor: isDarkMode ? "#3366FF" : "#3366FF",
                opacity: particle.opacity,
                transform: [
                  { translateX: particle.position.x },
                  { translateY: particle.position.y },
                  { scale: particle.scale },
                ],
              },
            ]}
          />
        ))}

        <View style={styles.content}>
          <Animated.View
            style={{
              opacity: logoFadeAnim,
              transform: [
                { scale: scaleAnim },
                { rotate: spin },
                { scale: pulse },
              ],
            }}
          >
            <View
              style={[
                styles.logoWrapper,
                isDarkMode ? styles.logoWrapperDark : styles.logoWrapperLight,
              ]}
            >
              <Image
                source={require("@/assets/images/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </Animated.View>

          <Animated.Text
            style={[
              styles.appName,
              isDarkMode ? styles.darkText : styles.lightText,
              {
                opacity: textFadeAnim,
                transform: [{ translateY: textSlideAnim }],
              },
            ]}
          >
            Skillink
          </Animated.Text>

          <Animated.Text
            style={[
              styles.tagline,
              isDarkMode ? styles.darkTagline : styles.lightTagline,
              {
                opacity: taglineFadeAnim,
                transform: [{ translateY: taglineSlideAnim }],
              },
            ]}
          >
            Unlock Your Potential, Connect With Skills
          </Animated.Text>

          <Animated.View
            style={[
              styles.iconRow,
              {
                opacity: taglineFadeAnim,
                transform: [{ translateY: taglineSlideAnim }],
              },
            ]}
          >
            <Ionicons
              name="school-outline"
              size={22}
              color={isDarkMode ? "#5C7CFA" : "#3366FF"}
              style={styles.icon}
            />
            <Ionicons
              name="people-outline"
              size={22}
              color={isDarkMode ? "#5C7CFA" : "#3366FF"}
              style={styles.icon}
            />
            <Ionicons
              name="chatbubble-outline"
              size={22}
              color={isDarkMode ? "#5C7CFA" : "#3366FF"}
              style={styles.icon}
            />
          </Animated.View>

          <Animated.Text
            style={[
              styles.tapHint,
              isDarkMode ? styles.darkTagline : styles.lightTagline,
              {
                opacity: taglineFadeAnim,
                transform: [{ translateY: taglineSlideAnim }],
              },
            ]}
          >
            Tap to continue
          </Animated.Text>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  lightContainer: {
    backgroundColor: "#F8F9FA",
  },
  darkContainer: {
    backgroundColor: "#000000",
  },
  particle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  logoWrapper: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  logoWrapperLight: {
    backgroundColor: "#FFFFFF",
  },
  logoWrapperDark: {
    backgroundColor: "#121212",
  },
  logo: {
    width: 110,
    height: 110,
  },
  appName: {
    fontSize: 42,
    fontFamily: "Inter-Bold",
    marginBottom: 12,
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  lightText: {
    color: "#3366FF",
  },
  darkText: {
    color: "#5C7CFA",
  },
  tagline: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    textAlign: "center",
    maxWidth: 280,
    marginBottom: 20,
  },
  lightTagline: {
    color: "#666666",
  },
  darkTagline: {
    color: "#BBBBBB",
  },
  iconRow: {
    flexDirection: "row",
    marginBottom: 40,
  },
  icon: {
    marginHorizontal: 10,
  },
  tapHint: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    opacity: 0.7,
  },
});

export default SplashScreen;
