import React, { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Input,
  FormControl,
  FormLabel,
  Text,
  Flex,
  Checkbox,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isAdmin, setIsAdmin] = useState(false); // Checkbox state for admin
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous error message
  
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
  
    try {
      // Include isAdmin in the signup payload
      const userType = isAdmin ? 'admin' : 'user'; // Check the checkbox state
      await signup({
        username,
        email,
        password,
        dateOfBirth,
        userType, // Pass the userType to the backend
      });
      navigate('/login');
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setError(error.response.data.errors[0].msg);
      } else {
        setError('Signup failed');
      }
    }
  };
  

  return (
    <Box
      position="relative"
      bg="gray.900"
      bgImage="url('/logomain.png')" // Background image
      bgSize="contain"
      bgRepeat="no-repeat"
      bgPosition="center"
      minHeight="100vh"
      py={20}
      px={6}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="gray.900"
        opacity={0.8}
      />
      <Flex
        direction="column"
        align="center"
        maxW="md"
        w="100%"
        mx="auto"
        position="relative"
        zIndex={1}
        color="white"
      >
        <Heading as="h1" size="xl" mb={6}>
          Sign Up
        </Heading>
        <Box bg="gray.800" p={8} borderRadius="md" w="100%">
          {error && (
            <Text color="red.500" mb={4}>
              {error}
            </Text>
          )}
          <form onSubmit={handleSubmit}>
            <FormControl mb={4}>
              <FormLabel>Username</FormLabel>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                bg="gray.700"
                color="white"
                _placeholder={{ color: 'gray.400' }}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                bg="gray.700"
                color="white"
                _placeholder={{ color: 'gray.400' }}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                bg="gray.700"
                color="white"
                _placeholder={{ color: 'gray.400' }}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Confirm Password</FormLabel>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                bg="gray.700"
                color="white"
                _placeholder={{ color: 'gray.400' }}
              />
            </FormControl>
            <FormControl mb={6}>
              <FormLabel>Date of Birth</FormLabel>
              <Input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                bg="gray.700"
                color="white"
                _placeholder={{ color: 'gray.400' }}
              />
            </FormControl>
            <FormControl display="flex" alignItems="center" mb={6}>
              <Checkbox
                colorScheme="blue"
                isChecked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
              >
                Sign up as Admin
              </Checkbox>
            </FormControl>
            <Button
              type="submit"
              size="lg"
              bg="brand.500"
              color="white"
              _hover={{ bg: 'brand.600' }}
              w="full"
            >
              Sign Up
            </Button>
          </form>
        </Box>
      </Flex>
    </Box>
  );
};

export default Signup;
