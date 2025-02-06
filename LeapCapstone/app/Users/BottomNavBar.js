// app/components/Users/BottomNavBar.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Use FontAwesome for icons
import { useAuth } from '../AuthContext';  // Make sure path is correct
import { useRouter } from 'expo-router';

const BottomNavBar = () => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace({pathname: '/login'});
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => router.push({pathname: '/UserDashboard'})}>
        <FontAwesome name="home" size={24} color="white" />
        <Text style={styles.buttonText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push({pathname: '/Users/profile'})}>
        <FontAwesome name="user" size={24} color="white" />
        <Text style={styles.buttonText}>Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <FontAwesome name="sign-out" size={24} color="white" />
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'black',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'gray',
    height: 70, // Keep consistent height
    zIndex: 1000, // Ensure it's on top
  },
  button: {
    alignItems: 'center', // Center icon and text
    padding: 10,       // Add some padding
  },
  buttonText: {
    color: 'white',
    fontSize: 12, // Adjust font size as needed
    marginTop: 4,  // Space between icon and text
  },
});

export default BottomNavBar;