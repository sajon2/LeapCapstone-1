import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { AntDesign, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const BarPage = () => {
  const { barId } = useLocalSearchParams();
  const [bar, setBar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newLocation, setNewLocation] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const { token } = useAuth();
  const router = useRouter();
  const locationInputRef = useRef(null); // Ref for location input
  const descriptionInputRef = useRef(null);


  useEffect(() => {
    const fetchBar = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/bars/${barId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBar(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bar:', error);
        setError('Bar not found or an error occurred');
        setLoading(false);
      }
    };

    fetchBar();
  }, [barId, token]);
  
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
        handleImageUpload(result.assets[0].uri)
    }
};

  const handleImageUpload = async (uri) => {

    const formData = new FormData();
      if (uri) {
          //This time, we are getting the image from our state, which has a uri property from ImagePicker.
          let localUri = uri;
          let filename = localUri.split('/').pop();

          // Infer the type of the image
          let match = /\.(\w+)$/.exec(filename);
          let type = match ? `image/${match[1]}` : `image`;

          formData.append('image', { uri: localUri, name: filename, type });
        }

    try {
      const response = await axios.put(
        `http://localhost:5001/api/bars/${barId}/upload-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBar({ ...bar, imageUrl: response.data.imageUrl });
      Alert.alert('Success', 'Image uploaded successfully.');
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image.');

    }
  };

  const handleEditLocation = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5001/api/bars/${barId}`,
        { location: newLocation },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBar({ ...bar, location: response.data.location });
      setIsEditingLocation(false);
       Alert.alert('Success', 'Location Updated successfully.');
    } catch (error) {
      console.error('Error updating location:', error);
       Alert.alert('Error', 'Failed to update location.');

    }
  };

  const handleEditDescription = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5001/api/bars/${barId}`,
        { description: newDescription },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBar({ ...bar, description: response.data.description });
      setIsEditingDescription(false);
      Alert.alert('Success', 'Description updated successfully.');
    } catch (error) {
      console.error('Error updating description:', error);
      Alert.alert('Error', 'Failed to update description.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{bar?.name}</Text>
        <TouchableOpacity style={styles.menuButton}>
          {/* Replace with your desired menu icon/component */}
          <Feather name="menu" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Banner Image or Upload Icon */}
       <View style={styles.bannerContainer}>
        {bar?.imageUrl ? (
          <TouchableOpacity style={styles.imageOverlay} onPress={pickImage}>
            <Image
              source={{ uri: `http://localhost:5001${bar.imageUrl}` }}
              style={styles.bannerImage}
            />
            <View style={styles.editIconContainer}>
              <Feather name="edit" size={24} color="white" />
             </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Feather name="plus" size={48} color="grey" />
          </TouchableOpacity>
        )}
      </View>
       {/* Content */}
      <ScrollView style={styles.contentContainer}>
          <View style={styles.editableTextContainer}>
            <Text style={styles.label}>Location:</Text>
            {isEditingLocation ? (
              <TextInput
                value={newLocation}
                onChangeText={setNewLocation}
                onBlur={() => setIsEditingLocation(false)}
                onSubmitEditing={handleEditLocation} //For when enter is pressed.
                style={styles.input}
                autoFocus
                ref={locationInputRef}
              />
            ) : (
              <TouchableOpacity onPress={() => {setIsEditingLocation(true); setNewLocation(bar.location);}}>
                <Text style={styles.editableText}>
                   {bar.location} <Feather name="edit-2" size={16} color="black" />
                </Text>
               
              </TouchableOpacity>
            )}
          </View>

        <View style={styles.editableTextContainer}>
          <Text style={styles.label}>Description:</Text>
          {isEditingDescription ? (
            <TextInput
              value={newDescription}
              onChangeText={setNewDescription}
              onBlur={() => setIsEditingDescription(false)}
              onSubmitEditing={handleEditDescription}
              style={[styles.input, styles.textarea]} // Apply textarea style
              multiline
              autoFocus
              ref={descriptionInputRef}
            />
          ) : (
             <TouchableOpacity onPress={() => {setIsEditingDescription(true); setNewDescription(bar.description);}}>
            <Text style={styles.editableText}>
              {bar.description}  <Feather name="edit-2" size={16} color="black" />
            </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push({pathname: `/Bars/${barId}/ManageEmployees`})}
          >
            <Text style={styles.buttonText}>Manage Employees</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push({pathname: `/Bars/${barId}/ManageQueue`})}
          >
            <Text style={styles.buttonText}>Manage Queue</Text>
          </TouchableOpacity>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'black',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  menuButton: {
    padding: 8,
  },
   bannerContainer: {
    position: 'relative',
    width: '100%',
    height: 300,  // Or whatever height you want
  },
    bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
    uploadButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ddd', // Light gray background
  },
    imageOverlay: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
   editIconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 24,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
   editableTextContainer: {
    marginBottom: 16,
  },
  editableText: {
    fontSize: 16,
     marginBottom: 8,
  },
   label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
   input: {
    backgroundColor: 'white',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
   textarea: {
    height: 120, // Adjust as needed
  },
  divider: {
    borderBottomColor: '#ccc',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginVertical: 24,
  },
  buttonGroup: {
    flexDirection: 'column', // Stack buttons vertically
    alignItems: 'stretch', // Stretch buttons to full width
    width: '100%',
  },
  button: {
    backgroundColor: '#007bff', // Example button color
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 12, // Spacing between buttons
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: 'black',
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    color: 'white',
    fontSize: 14,
  },
    loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BarPage;