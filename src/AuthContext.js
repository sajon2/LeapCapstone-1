import React, { createContext, useContext, useState, useEffect } from 'react';


import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const loadUser = async () => {
    if (token) {
      console.log('Token found in local storage:', token);

      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        console.log('Decoded token:', decodedToken);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          console.log('Token expired:', decodedToken.exp, 'Current time:', currentTime);
          setToken(null);
          setUser(null);
          localStorage.removeItem('token');
          return;
        }

        const response = await axios.get('http://localhost:5001/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('User data retrieved:', response.data);
        setUser(response.data);
      } catch (error) {
        console.error('Error loading user:', error);
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
      }
    } else {
      console.log('No token found in local storage');
    }
  };

  useEffect(() => {
    loadUser();
  }, [token]);

  const signup = async ({ username, email, password, dateOfBirth }) => {
    try {
      const response = await axios.post('http://localhost:5001/signup', { username, email, password, dateOfBirth });
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      console.log('User signed up:', response.data.user);
      return response.data;
    } catch (error) {
      console.error('Signup error:', error.response.data.errors);
      throw error;
    }
  };

  const login = async ({ username, password }) => {
    try {
      const response = await axios.post('http://localhost:5001/login', { username, password });
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      console.log('User logged in:', response.data.user);
      return response.data.user;
    } catch (error) {
      console.error('Login error:', error.response?.data?.msg || error.message);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    console.log('User logged out');
   
  };

  return (
    <AuthContext.Provider value={{ user, token, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
