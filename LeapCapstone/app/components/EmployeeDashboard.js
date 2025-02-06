import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity, // For buttons
  ScrollView, // For scrollable content
} from 'react-native';
import { AntDesign } from '@expo/vector-icons'; // For the dropdown icon

const EmployeeDashboard = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Employee Dashboard</Text>
        <TouchableOpacity style={styles.menuButton}>
          <AntDesign name="down" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Middle Section (Using ScrollView for content) */}
      <ScrollView contentContainerStyle={styles.middleSection}>
        <View style={styles.navigation}>
          <Text style={styles.navigationTitle}>Navigation</Text>
          <View style={styles.navigationItems}>
            <TouchableOpacity style={styles.navButton}>
              <Text style={styles.navButtonText}>Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton}>
              <Text style={styles.navButtonText}>Projects</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton}>
              <Text style={styles.navButtonText}>Tasks</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton}>
              <Text style={styles.navButtonText}>Messages</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.contentTitle}>
            Welcome to the Employee Dashboard!
          </Text>
          <View style={styles.divider} />
          <Text style={styles.contentText}>
            Here you can manage your projects, tasks, and communicate with your team.
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Footer Content</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    backgroundColor: 'black',
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  menuButton: {
    padding: 8,
    // Add any additional styling for the menu button
  },
  middleSection: {
   flexGrow: 1, // Important: Use flexGrow for ScrollView's content
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  navigation: {
    backgroundColor: 'black',
    width: '25%', // Adjust as needed
    padding: 24,
  },
  navigationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  navigationItems: {
    // Style for the navigation buttons container
  },
  navButton: {
    paddingVertical: 10,
    // Add any additional styling for navigation buttons
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    // Add any additional styling for navigation button text
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333', // Adjust color as needed
    marginBottom: 16,
  },
  divider: {
    borderBottomColor: '#ccc',
    borderBottomWidth: StyleSheet.hairlineWidth,
    width: '100%',
    marginBottom: 16,
  },
  contentText: {
    fontSize: 16,
    color: '#666', // Adjust color as needed
    textAlign: 'center',
  },
  footer: {
    backgroundColor: 'black',
    width: '100%',
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    color: 'white',
    fontSize: 14,
  },
});

export default EmployeeDashboard;