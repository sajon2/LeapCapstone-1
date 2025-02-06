// app/components/Users/UserLayout.js
import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native'; // Import SafeAreaView
import BottomNavBar from './BottomNavBar'; // Make sure path is correct

const UserLayout = ({ children }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          {children}
        </View>
        <BottomNavBar />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Or whatever background color you want
  },
  container: {
    flex: 1,
    flexDirection: 'column', // Stack children vertically
    // No need for explicit minHeight, flex: 1 handles this
  },
  content: {
    flex: 1, // Allow content to grow and fill available space
    // Removed paddingBottom, BottomNavBar handles this
  },
});

export default UserLayout;