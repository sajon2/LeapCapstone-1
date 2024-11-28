import React from 'react';
import { Box, Button, Heading, Text, Flex, VStack, StackDivider } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Box
      bg="gray.900"
      color="white"
      minHeight="100vh"
      bgImage="url('/logomain.png')"
      bgSize="contain" // Changed from 'cover' to 'contain'
      bgRepeat="no-repeat"
      bgPosition="center"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      textAlign="center"
      px={4}
    >
      <Box
        bg="rgba(0, 0, 0, 0.6)"
        p={8}
        borderRadius="md"
        boxShadow="lg"
        maxWidth="lg"
        width="100%"
      >
        <Flex direction="column" align="center" mb={6}>
          <Heading as="h1" size="2xl" mb={4}>
            Welcome to Leap
          </Heading>
          <Text fontSize="lg" mb={6}>
            Sign in or create an account to get started.
          </Text>
        </Flex>
        <VStack spacing={4} divider={<StackDivider borderColor="gray.700" />}>
          <Link to="/login" style={{ width: '100%' }}>
            <Button
              size="lg"
              bg="brand.500"
              color="white"
              _hover={{ bg: 'brand.600' }}
              width="100%"
            >
              Login
            </Button>
          </Link>
          <Link to="/signup" style={{ width: '100%' }}>
            <Button
              size="lg"
              bg="brand.500"
              color="white"
              _hover={{ bg: 'brand.600' }}
              width="100%"
            >
              Sign Up
            </Button>
          </Link>
        </VStack>
      </Box>
    </Box>
  );
};

export default Home;
