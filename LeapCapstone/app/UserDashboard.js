// app/user-dashboard.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useRouter } from 'expo-router';
import BottomNavBar from './Users/BottomNavBar';

const UserDashboard = () => {
  const [bars, setBars] = useState([]);
  const [filteredBars, setFilteredBars] = useState([]);
  const [search, setSearch] = useState('');
  const { token } = useAuth();
  const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    const fetchBars = async () => {
      setIsLoading(true); // Start loading
      try {
        const response = await axios.get('http://localhost:5001/api/bars/all', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setBars(response.data);
        setFilteredBars(response.data);
      } catch (error) {
        console.error('Error fetching bars:', error);
        // Handle error appropriately, e.g., show an error message to the user
      } finally {
        setIsLoading(false); // End loading
      }
    };

    fetchBars();
  }, [token]);

  const handleSearch = (value) => {
    const lowerCaseValue = value.toLowerCase();
    setSearch(lowerCaseValue);

    const filtered = bars.filter(
      (bar) =>
        bar.name.toLowerCase().includes(lowerCaseValue) ||
        bar.location.toLowerCase().includes(lowerCaseValue)
    );

    setFilteredBars(filtered);
  };

  const handleVenueClick = (barId) => {
     router.push({pathname: `/venue/${barId}`});
  };

  const renderBarItem = ({ item }) => (
    <TouchableOpacity
      style={styles.barItem}
      onPress={() => handleVenueClick(item._id)}
    >
      <Image
        source={{ uri: `http://localhost:5001${item.imageUrl}` }}
        style={styles.barImage}
      />
      <View style={styles.barInfo}>
        <Text style={styles.barName}>{item.name}</Text>
        <Text style={styles.barLocation}>{item.location}</Text>
      </View>
    </TouchableOpacity>
  );

    if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Venues</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <TextInput
          placeholder="Search venues by name or location"
          value={search}
          onChangeText={handleSearch}
          style={styles.searchBar}
        />
      </View>

      {/* Venue List */}
      <View style={styles.venueListContainer}>
        <Text style={styles.venueListTitle}>Venues List</Text>
        <View style={styles.divider} />
        <FlatList
          data={filteredBars}
          renderItem={renderBarItem}
          keyExtractor={(item) => item._id}
          numColumns={2} // Display bars in a grid
          contentContainerStyle={styles.gridContainer} // Add this
        />
      </View>

      {/* Footer Navigation */}
      <BottomNavBar />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#f0f0f0',
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
  searchBarContainer: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  searchBar: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    width: '100%',
    maxWidth: 600,
  },
  venueListContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
     paddingBottom: 70,
  },
  venueListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  divider: {
    borderBottomColor: '#cccccc',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 16,
  },
  gridContainer: {
    justifyContent: 'space-around', // Distribute space around items
    paddingHorizontal: 10, // Add some horizontal padding
  },
  barItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20, // Space between items
    width: '48%', // Adjust width to fit 2 items per row with some space
    marginHorizontal: '1%', // Horizontal margin for spacing
  },
  barImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  barInfo: {
    padding: 12,
  },
  barName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  barLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Consistent background color
  },
});

export default UserDashboard;