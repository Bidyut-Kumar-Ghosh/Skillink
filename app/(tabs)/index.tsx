import { Text, View,  StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hi its Skillink Here</Text>
      {/* <Link href="/about" style={styles.button}>Go to About</Link> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ff66b3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },
  
});

