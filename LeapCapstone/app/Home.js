// app/index.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground, // Import ImageBackground
} from 'react-native';
import { Link } from 'expo-router';

const Home = () => {
  return (
    <ImageBackground
      // source={require('../assets/logomain.png')} //  Make sure the path is correct
      style={styles.backgroundImage}
      resizeMode="contain" // Use contain, as in your original code
    >
      <View style={styles.overlay} />
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to Leap</Text>
        <Text style={styles.subtitle}>
          Sign in or create an account to get started.
        </Text>

        <View style={styles.buttonContainer}>
          <Link href="/login" asChild>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/signup" asChild>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black', // Good fallback
  },
    overlay: {
    ...StyleSheet.absoluteFillObject, // This is important!
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent black overlay
  },
  container: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'transparent', // Make the container's background transparent
    alignItems: 'center',
    width: '80%', // Responsive width
    maxWidth: 400,   // Max width for larger screens
    zIndex: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 30,
    textAlign: 'center', // Center the text
  },
  buttonContainer: {
    width: '100%', // Make the button container fill its parent
  },
  button: {
    backgroundColor: '#3498db', // Use your brand color
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
    width: '100%', // Make buttons fill the container
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Home;