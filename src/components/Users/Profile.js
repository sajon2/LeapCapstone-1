import React from 'react';
import {
  Box,
  Flex,
  Heading,
  VStack,
  Avatar,
  Text,
  Divider,
  Button,
} from '@chakra-ui/react';
import { useAuth } from '../../AuthContext';
import BottomNavBar from '../Users/BottomNavBar'; // Import BottomNavBar component

const Profile = () => {
  const { user } = useAuth();

  return (
    <Box minHeight="100vh" bg="gray.100" pb="80px">
      {/* Header */}
      <Box bg="gray.900" py={6} px={4} textAlign="center" color="white">
        <Heading as="h1" size="lg">
          Profile
        </Heading>
        <Text mt={2} fontSize="sm" color="gray.400">
          View your profile details
        </Text>
      </Box>

      {/* Profile Section */}
      <Flex direction="column" align="center" mt={6} px={4}>
        <Box
          bg="white"
          p={6}
          borderRadius="lg"
          boxShadow="lg"
          width="100%"
          maxWidth="500px"
          textAlign="center"
        >
          <VStack spacing={4}>
            {/* Profile Picture */}
            <Avatar
              size="2xl"
              src={user?.profilePicture || ''}
              name={user?.username}
              mb={2}
              borderColor="gray.300"
              borderWidth="2px"
            />
            <Divider />

            {/* User Information */}
            <Box width="100%">
              <Flex justify="space-between" py={2}>
                <Text fontWeight="bold">Username:</Text>
                <Text>{user?.username || 'N/A'}</Text>
              </Flex>
              <Divider />
              <Flex justify="space-between" py={2}>
                <Text fontWeight="bold">Email:</Text>
                <Text>{user?.email || 'N/A'}</Text>
              </Flex>
              <Divider />
              <Flex justify="space-between" py={2}>
                <Text fontWeight="bold">Date of Birth:</Text>
                <Text>
                  {user?.dateOfBirth
                    ? new Date(user.dateOfBirth).toLocaleDateString()
                    : 'N/A'}
                </Text>
              </Flex>
            </Box>

            {/* Edit Profile Button */}
            <Button
              mt={4}
              colorScheme="blue"
              onClick={() => console.log('Edit Profile Clicked')} // Replace with navigation or modal logic
              width="full"
            >
              Edit Profile
            </Button>
          </VStack>
        </Box>
      </Flex>

      {/* Bottom Navigation */}
      <BottomNavBar />
    </Box>
  );
};

export default Profile;
