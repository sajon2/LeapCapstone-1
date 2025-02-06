// app/profile.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView, // Import ScrollView
} from 'react-native';
import { useAuth } from '../AuthContext'; // Correct relative path
import BottomNavBar from './BottomNavBar'; // Correct relative path

const Profile = () => {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Text style={styles.headerSubtitle}>View your profile details</Text>
      </View>

      {/* Profile Section (Wrap in ScrollView) */}
      <ScrollView contentContainerStyle={styles.profileSection}>
        <View style={styles.profileContainer}>
          {/* Profile Picture */}
          <Image
            style={styles.profilePicture}
            // source={
            //   user?.profilePicture
            //     ? { uri: user.profilePicture }
            //     : require('../assets/default-profile.png') //  Provide a default image!
            // }
          />
          <View style={styles.divider} />

          {/* User Information */}
          <View style={styles.userInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Username:</Text>
              <Text style={styles.infoValue}>{user?.username || 'N/A'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date of Birth:</Text>
              <Text style={styles.infoValue}>
                {user?.dateOfBirth
                  ? new Date(user.dateOfBirth).toLocaleDateString()
                  : 'N/A'}
              </Text>
            </View>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => console.log('Edit Profile Clicked')} // Replace with your logic
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Light grey background
  },
  header: {
    backgroundColor: 'black',
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'gray',
    marginTop: 8,
  },
  profileSection: {
    flexGrow: 1, // Important for ScrollView
    alignItems: 'center',
    padding: 16,
  },
  profileContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 8,
    width: '100%',
    maxWidth: 500,
    alignItems: 'center', // Center content horizontally
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60, // Circular image
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#cccccc',
  },
  divider: {
    borderBottomColor: '#cccccc',
    borderBottomWidth: StyleSheet.hairlineWidth,
    width: '100%',
    marginVertical: 8,
  },
  userInfo: {
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoValue: {
    fontSize: 16,
  },
  editButton: {
    backgroundColor: '#3498db', // Blue color
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    width: '100%', // Full width
    alignItems: 'center', // Center text
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Profile;