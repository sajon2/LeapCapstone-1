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
  Platform,
  Pressable,
} from 'react-native';
import { useAuth } from '../AuthContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { AntDesign } from '@expo/vector-icons';


const ManageEmployees = () => {
    const { barId } = useLocalSearchParams();
    const [employees, setEmployees] = useState([]);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false); // For DatePicker visibility
    const [profilePicture, setProfilePicture] = useState(null);
    const [message, setMessage] = useState('');
    const [expandedEmployee, setExpandedEmployee] = useState(null);
    const { token } = useAuth();
    const [isModalVisible, setIsModalVisible] = useState(false); // Use a boolean for modal visibility
    const router = useRouter();

    useEffect(() => {
        if (!barId) {
            console.error('Bar ID is not defined.');
            return;
        }

        const fetchEmployees = async () => {
            try {
                const response = await axios.get(`http://localhost:5001/api/employees/${barId}/employees`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setEmployees(response.data);
            } catch (error) {
                console.error('Error fetching employees:', error.message);
            }
        };

        fetchEmployees();
    }, [barId, token]);

    const resetForm = () => {
        setFullName('');
        setEmail('');
        setPassword('');
        setDateOfBirth(new Date());
        setProfilePicture(null);
        setMessage('');
    };

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
            setProfilePicture(result.assets[0].uri);
        }
    };

    const handleDeleteEmployee = async (employeeId) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) {
            return;
        }

        try {
            await axios.delete(`http://localhost:5001/api/employees/${employeeId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEmployees(employees.filter((employee) => employee._id !== employeeId));
            setMessage('Employee deleted successfully!');
        } catch (error) {
            console.error('Error deleting employee:', error.response?.data || error.message);
            setMessage('Error deleting employee.');
        }
    };

    const handleSubmit = async () => {

        const formData = new FormData();
        formData.append('fullName', fullName);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('dateOfBirth', dateOfBirth.toISOString());
        formData.append('barId', barId);
        if (profilePicture) {
          //This time, we are getting the image from our state, which has a uri property from ImagePicker.
          let localUri = profilePicture;
          let filename = localUri.split('/').pop();

          // Infer the type of the image
          let match = /\.(\w+)$/.exec(filename);
          let type = match ? `image/${match[1]}` : `image`;

          formData.append('profilePicture', { uri: localUri, name: filename, type });
        }

        try {
            const response = await axios.post('http://localhost:5001/api/employees', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            setMessage('Employee created successfully!');
            setEmployees([...employees, response.data.employee]);
            resetForm();
            setIsModalVisible(false); // Close modal on success
        } catch (error) {
            console.error('Error creating employee:', error.response?.data || error.message);
            setMessage('Error creating employee.');
        }
    };
    const toggleEmployeeDetails = (employeeId) => {
        setExpandedEmployee(expandedEmployee === employeeId ? null : employeeId);
    };

      const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || dateOfBirth;
        setShowDatePicker(Platform.OS === 'ios'); // Only close on iOS, Android closes automatically
        setDateOfBirth(currentDate);
    };

    const renderEmployeeItem = ({ item }) => (
      <View style={styles.employeeContainer}>
        {item.profilePicture && (
          <Image
            source={{ uri: `http://localhost:5001${item.profilePicture}` }}
            style={styles.profileImage}
          />
        )}
        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName}>{item.fullName}</Text>
          <Text>
            <Text style={styles.bold}>Email:</Text> {item.email}
          </Text>
          <Text>
            <Text style={styles.bold}>Employee ID:</Text> {item.employeeId}
          </Text>
          {expandedEmployee === item._id && (
            <Text>
              <Text style={styles.bold}>Date of Birth:</Text>{" "}
              {new Date(item.dateOfBirth).toLocaleDateString()}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => toggleEmployeeDetails(item._id)}
          style={styles.iconButton}
        >
          <AntDesign
            name={expandedEmployee === item._id ? "up" : "down"}
            size={24}
            color="black"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.deleteButton]}
          onPress={() => handleDeleteEmployee(item._id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );

    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Manage Employees</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>

        {/* Middle Section */}
        <View style={styles.middleSection}>
          <View style={styles.navigation}>
            <Text style={styles.navigationText}>Navigation</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setIsModalVisible(true)}
            >
              <Text style={styles.createButtonText}>Create Employee</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.employeeListContainer}>
            <Text style={styles.employeeListTitle}>Employees List</Text>
            <View style={styles.divider} />
            <FlatList
              data={employees}
              renderItem={renderEmployeeItem}
              keyExtractor={(item) => item._id}
              style={styles.flatList}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Footer Content</Text>
        </View>

        {/* Modal for Creating a New Employee */}
        <Modal visible={isModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Create a New Employee</Text>
              <TextInput
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
                style={styles.input}
              />
              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
              />
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry
              />
                 {showDatePicker && (
                    <DateTimePicker
                        value={dateOfBirth}
                        mode="date"
                        display="default"
                        onChange={onChangeDate}
                    />
                )}
                {!showDatePicker && (
                <Pressable onPress={() => setShowDatePicker(true)}>
                    <TextInput
                        placeholder="Date of Birth"
                        value={dateOfBirth.toLocaleDateString()}
                        style={styles.input}
                        editable={false} // Prevent manual editing
                    />
                </Pressable>
                )}
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                 <Text style={styles.buttonText}>Upload Image</Text>
              </TouchableOpacity>
              {profilePicture && <Image source={{ uri: profilePicture }} style={{ width: 100, height: 100 }} />}
              <TouchableOpacity style={styles.createButton} onPress={handleSubmit}>
                <Text style={styles.createButtonText}>Create Employee</Text>
              </TouchableOpacity>
              {message && (
                <Text
                  style={[
                    styles.messageText,
                    message.includes("successfully")
                      ? styles.successMessage
                      : styles.errorMessage,
                  ]}
                >
                  {message}
                </Text>
              )}

                <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
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
    backButton: {
        borderColor: 'white',
        borderWidth: 1,
        padding: 8,
        borderRadius: 4,
    },
    backButtonText: {
        color: 'white',
    },
    middleSection: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'white',
    },
    navigation: {
        backgroundColor: 'black',
        width: '25%',
        padding: 24,
    },
    navigationText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 16,
    },
    createButton: {
      backgroundColor: "transparent", // Example background color
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
    employeeListContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    employeeListTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4A4A4A',
        marginBottom: 16,
    },
    divider: {
        borderBottomColor: '#ccc',
        borderBottomWidth: StyleSheet.hairlineWidth,
        width: '100%',
        marginBottom: 24,
    },
     employeeContainer: {
    flexDirection: 'row',
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginBottom: 8,
    width: '100%',
    alignItems: 'center',
  },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 16,
    },
    employeeInfo: {
        flex: 1,
    },
    employeeName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    bold: {
        fontWeight: 'bold',
    },
    deleteButton: {
        backgroundColor: 'red',
        padding: 8,
        borderRadius: 4,
    },
    deleteButtonText: {
        color: 'white',
    },
    iconButton:{
        marginRight: 8
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    modalHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)', // Light grey background
        borderRadius: 5,
        padding: 15,
        marginBottom: 15,
        width: '100%',
    },
     uploadButton: {
      backgroundColor: "#3498db", // Example background color
      padding: 10,
      borderRadius: 5,
      alignItems: "center",
      width: "100%",
      marginBottom: 10
    },
    buttonText: {
        color: 'white',
    },
     messageText: {
        marginTop: 10,
        textAlign: 'center',
        fontSize: 16,
    },
    successMessage: {
        color: 'green',
    },
    errorMessage: {
        color: 'red',
    },
    closeButton: {
      backgroundColor: "#ccc", // Example background color
      padding: 10,
      borderRadius: 5,
      alignItems: "center",
      width: "100%",
      marginTop: 10,
    },
    closeButtonText:{
        color: 'white'
    },
     flatList: {
    width: '100%', // Ensure it takes the full width available
  },
});

export default ManageEmployees;