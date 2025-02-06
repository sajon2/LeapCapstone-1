import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';


const AdminDashboard = () => {
  const [bars, setBars] = useState([]);
  const [currentBar, setCurrentBar] = useState(null);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const { token, logout } = useAuth();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false); // Separate modals
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchBars = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/bars', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBars(response.data);
      } catch (error) {
        console.error('Error fetching bars:', error);
      }
    };

    fetchBars();
  }, [token]);

    const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
    });

    console.log(result);
    if (!result.canceled) {
        //The response from launchImageLibraryAsync is different from input.
        //It returns an array, and the uri is in the 'assets' object.
        setImage(result.assets[0].uri);
    }
};

  const resetForm = () => {
    setName('');
    setLocation('');
    setDescription('');
    setImage(null);
    setMessage('');
    setCurrentBar(null);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('location', location);
    formData.append('description', description);
     if (image) {
          //This time, we are getting the image from our state, which has a uri property from ImagePicker.
          let localUri = image;
          let filename = localUri.split('/').pop();

          // Infer the type of the image
          let match = /\.(\w+)$/.exec(filename);
          let type = match ? `image/${match[1]}` : `image`;

          formData.append('image', { uri: localUri, name: filename, type });
        }

    try {
      const response = await axios.post('http://localhost:5001/api/bars', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage('Venue created successfully!');
      setBars([...bars, response.data]);
      resetForm();
      setIsCreateModalVisible(false); // Close create modal
       Alert.alert('Success', 'Venue created successfully.');

    } catch (error) {
      setMessage('Error creating venue. Make sure you are logged in as an admin.');
      Alert.alert('Error', 'Failed to create venue.');

    }
  };

  const handleEditSubmit = async () => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('location', location);
    formData.append('description', description);
     if (image) {
        //This time, we are getting the image from our state, which has a uri property from ImagePicker.
        let localUri = image;
        let filename = localUri.split('/').pop();

        // Infer the type of the image
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;

        formData.append('image', { uri: localUri, name: filename, type });
        }

    try {
      const response = await axios.put(
        `http://localhost:5001/api/bars/${currentBar._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage('Venue updated successfully!');
      setBars((prevBars) =>
        prevBars.map((bar) => (bar._id === currentBar._id ? response.data : bar))
      );
      resetForm();
      setIsEditModalVisible(false); // Close edit modal
      Alert.alert('Success', 'Venue updated successfully.');

    } catch (error) {
      setMessage('Error updating venue. Make sure you are logged in as an admin.');
       Alert.alert('Error', 'Failed to update venue.');

    }
  };

  const handleEdit = (bar) => {
    setCurrentBar(bar);
    setName(bar.name);
    setLocation(bar.location);
    setDescription(bar.description);
    //setImage(`http://localhost:5001${bar.imageUrl}`); Don't do this. Keep it a uri.
    setIsEditModalVisible(true); // Open edit modal
  };

  const handleLogout = async () => {
    await logout();
    router.replace({pathname: '/login'});
  };

  const handleViewBar = (barId) => {
     router.push({pathname: `/bar/${barId}`});
  };

  const renderBarItem = ({ item }) => (
    <View style={styles.barItem}>
      <Image
        source={{ uri: `http://localhost:5001${item.imageUrl}` }}
        style={styles.barImage}
      />
      <View style={styles.barInfo}>
        <Text style={styles.barName}>{item.name}</Text>
        <Text style={styles.barLocation}>
          <Text style={styles.bold}>Location:</Text> {item.location}
        </Text>
        <Text style={styles.barDescription}>
          <Text style={styles.bold}>Description:</Text> {item.description}
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() => handleEdit(item)}
          >
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.viewButton]}
            onPress={() => handleViewBar(item._id)}
          >
            <Text style={styles.buttonText}>View</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Middle Section */}
      <View style={styles.middleSection}>
        <Text style={styles.manageVenuesTitle}>Manage Your Venues</Text>
        <FlatList
          data={bars}
          renderItem={renderBarItem}
          keyExtractor={(item) => item._id}
          numColumns={2} // Display bars in a grid
          contentContainerStyle={styles.gridContainer}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Admin Dashboard - All Rights Reserved</Text>
      </View>

      {/* Modal for Creating a New Venue */}
      <Modal
        visible={isCreateModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Create a New Venue</Text>
            <TextInput
              placeholder="Venue Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              placeholder="Location"
              value={location}
              onChangeText={setLocation}
              style={styles.input}
            />
            <TextInput
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              style={[styles.input, styles.textarea]}
              multiline
            />
             <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                 <Text style={styles.buttonText}>Upload Image</Text>
              </TouchableOpacity>
              {image && <Image source={{ uri: image }} style={{ width: 100, height: 100 }} />}
            <TouchableOpacity style={styles.createButton} onPress={handleSubmit}>
              <Text style={styles.createButtonText}>Create New Venue</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsCreateModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for Editing a Venue */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Edit Venue</Text>
            <TextInput
              placeholder="Venue Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              placeholder="Location"
              value={location}
              onChangeText={setLocation}
              style={styles.input}
            />
            <TextInput
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              style={[styles.input, styles.textarea]} // Apply textarea style
              multiline
            />
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                 <Text style={styles.buttonText}>Upload Image</Text>
              </TouchableOpacity>
               {image && <Image source={{ uri: image }} style={{ width: 100, height: 100 }} />}
            <TouchableOpacity style={styles.updateButton} onPress={handleEditSubmit}>
              <Text style={styles.updateButtonText}>Update Venue</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsEditModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    logoutButton: {
        borderColor: 'white',
        borderWidth: 1,
        padding: 8,
        borderRadius: 4,
    },
    logoutButtonText: {
        color: 'white',
    },
    middleSection: {
        flex: 1,
        backgroundColor: '#F0F0F0',
        padding: 24,
    },
    manageVenuesTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 24,
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
        height: 200,
        resizeMode: 'cover',
    },
    barInfo: {
        padding: 16,
    },
    barName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    barLocation: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    barDescription: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
      buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
    editButton: {
        backgroundColor: '#3498db',
    },
    viewButton: {
        backgroundColor: '#2ecc71',
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
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
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 8,
        width: '80%',
    },
    modalHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    input: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Light grey background
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
    width: '100%',
  },
    textarea: {
        height: 100, // Give it a fixed height
        textAlignVertical: 'top', // Start text from the top on Android
    },
      uploadButton: {
      backgroundColor: "#3498db", // Example background color
      padding: 10,
      borderRadius: 5,
      alignItems: "center",
      width: "100%",
      marginBottom: 10
    },
    createButton: {
      backgroundColor: "#3498db", // Example background color
      padding: 10,
      borderRadius: 5,
      alignItems: "center",
      width: "100%",
      marginBottom: 10
    },
    createButtonText: {
        color: 'white',
        fontSize: 16,
    },
    updateButton: {
      backgroundColor: "#3498db", // Example background color
      padding: 10,
      borderRadius: 5,
      alignItems: "center",
      width: "100%",
      marginBottom: 10
    },
    updateButtonText: {
        color: 'white',
        fontSize: 16,
    },
    closeButton: {
        backgroundColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        width: '100%',
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
    },
     bold: {
    fontWeight: 'bold',
  },
});

export default AdminDashboard;