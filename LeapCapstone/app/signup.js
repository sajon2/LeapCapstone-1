// app/signup.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useAuth } from './AuthContext';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      // Use toISOString() for consistency across platforms
      await signup({
        username,
        email,
        password,
        dateOfBirth: dateOfBirth.toISOString(),
      });
      router.replace({ pathname: '/login' });
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setError(error.response.data.errors[0].msg);
      } else {
        setError('Signup failed');
      }
    }
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDatePicker(false); // Hide picker after selection (both iOS and Android)
    setDateOfBirth(currentDate);
  };

  // --- Web Date Input Handler ---
  const handleWebDateChange = (event) => {
    const newDate = new Date(event.target.value);
    setDateOfBirth(newDate);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ImageBackground
        //source={require('../assets/logomain.png')} // Path to your image
        style={styles.backgroundImage}
        resizeMode="contain"
      >
        <View style={styles.overlay} />
        <View style={styles.container}>
          <Text style={styles.title}>Sign Up</Text>
          {error && <Text style={styles.errorText}>{error}</Text>}
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="gray"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="gray"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="gray"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="gray"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            {/* --- Conditional Rendering for Date Picker --- */}
            {Platform.OS === 'web' ? (
              <input
                type="date"
                value={dateOfBirth.toISOString().split('T')[0]} // Format for HTML date input
                onChange={handleWebDateChange}
                style={styles.webInput} // Use a style for the web input
              />
            ) : (
              <>
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
                      placeholderTextColor="gray"
                      value={dateOfBirth.toLocaleDateString()}
                      style={styles.input}
                      editable={false}
                    />
                  </Pressable>
                )}
              </>
            )}

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black'
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)'
    },
    container:{
        width: '80%',
        maxWidth: 400,
        padding: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.8)',
        alignItems: 'center',
        zIndex: 1
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 20
    },
    formContainer: {
        width: '100%'
    },
    input: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      color: 'white',
      borderRadius: 5,
      padding: 15,
      marginBottom: 15,
      width: '100%',
    },
    // Style for the web date input
    webInput: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      color: 'white',
      borderRadius: 5,
      padding: 15,
      marginBottom: 15,
      width: '100%',
      height: 50, // Ensure it has a similar height to other inputs
      borderWidth: 0, // Remove default border
    },
    button: {
        backgroundColor: '#3498db',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        width: '100%'
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold'
    },
    errorText:{
        color: 'red',
        marginBottom: 10,
        textAlign: 'center'
    }
});

export default Signup;