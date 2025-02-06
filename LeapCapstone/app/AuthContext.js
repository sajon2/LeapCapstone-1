// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';

const AuthContext = createContext(null); // Initialize with null

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // Initialize token state
  const router = useRouter();

  const loadUser = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken); // Update token state
        const decodedToken = JSON.parse(atob(storedToken.split('.')[1]));
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          await AsyncStorage.removeItem('token');
          setToken(null);
          setUser(null);
          return;
        }

        const response = await axios.get('http://localhost:5001/me', {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        setUser(response.data);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      await AsyncStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();
  }, []); // Empty dependency array to run only once on mount


  const signup = async ({ username, email, password, dateOfBirth }) => {
    try {
      const response = await axios.post('http://localhost:5001/signup', { username, email, password, dateOfBirth });
      await AsyncStorage.setItem('token', response.data.token);
      setToken(response.data.token); // Set token state
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      console.error('Signup error:', error.response?.data?.errors || error.message); // More robust error handling
      throw error;
    }
  };

  const login = async ({ username, password }) => {
    try {
      const response = await axios.post('http://localhost:5001/login', { username, password });
      await AsyncStorage.setItem('token', response.data.token);
      setToken(response.data.token); // Set token state
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      console.error('Login error:', error.response?.data?.msg || error.message);
      throw error;
    }
  };
    
  const logout = async () => {
    try{
        await AsyncStorage.removeItem('token');
        setUser(null);
        setToken(null); // Clear token state
        router.replace("/login") //Go back to the login page
    }
    catch(error){
        console.error("Failed to log out", error)
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};