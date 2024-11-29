import React, { useState } from 'react';
import { Box, Button, Input, FormControl, FormLabel, Heading, Flex, Text } from '@chakra-ui/react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous error message
    try {
      const user = await login({ username, password });
      if (user) {
        // Redirect based on user type
        if (user.userType === 'admin') {
          navigate('/admin-dashboard');
        } else if (user.userType === 'employee') {
          navigate('/employee-dashboard');
        } else {
          navigate('/user-dashboard');
        }
      }
    } catch (error) {
      console.error('Login error object:', error); // Log full error for debugging
    
      // Check if response and data exist
      if (error.response && error.response.data) {
        // Attempt to extract the message
        setError(error.response.data.message || 'Invalid credentials.');
      } else if (error.message) {
        // Network or Axios-specific error
        setError(error.message);
      } else {
        // Generic fallback
        setError('An unexpected error occurred. Please try again.');
      }
    }
  }      

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
          Login
        </Heading>
        {error && (
          <Text color="red.500" mb={4}>
            {error}
          </Text>
        )}
        <Box bg="gray.800" p={8} borderRadius="md" w="100%">
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
            <FormControl mb={6}>
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
            <Button
              type="submit"
              size="lg"
              bg="brand.500"
              color="white"
              _hover={{ bg: 'brand.600' }}
              w="full"
            >
              Login
            </Button>
          </form>
        </Box>
      </Flex>
    </Box>
  );
};

export default Login;

