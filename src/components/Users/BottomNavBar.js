import React from 'react';
import { Box, Flex, IconButton, Text } from '@chakra-ui/react';
import { FaHome, FaUser, FaSignOutAlt, FaMapMarkerAlt } from 'react-icons/fa'; // Import FaMapMarkerAlt
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

const BottomNavBar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg="gray.900"
      color="white"
      borderTop="1px solid gray"
      zIndex={1000}
      height="70px" // Explicit height for consistent padding
    >
      <Flex justify="space-around" align="center" height="100%">
        <Flex direction="column" align="center" onClick={() => navigate('/user-dashboard')}>
          <IconButton
            aria-label="Home"
            icon={<FaHome />}
            variant="ghost"
            color="white"
            size="lg"
          />
          <Text fontSize="xs">Home</Text>
        </Flex>

        {/* Map Icon */}
        <Flex direction="column" align="center" onClick={() => navigate('/map')}>
          <IconButton
            aria-label="Map"
            icon={<FaMapMarkerAlt />} // Use the map marker icon
            variant="ghost"
            color="white"
            size="lg"
          />
          <Text fontSize="xs">Map</Text>
        </Flex>

        <Flex direction="column" align="center" onClick={() => navigate('/profile')}>
          <IconButton
            aria-label="Profile"
            icon={<FaUser />}
            variant="ghost"
            color="white"
            size="lg"
          />
          <Text fontSize="xs">Profile</Text>
        </Flex>
        <Flex direction="column" align="center" onClick={() => logout()}>
          <IconButton
            aria-label="Logout"
            icon={<FaSignOutAlt />}
            variant="ghost"
            color="white"
            size="lg"
          />
          <Text fontSize="xs">Logout</Text>
        </Flex>
      </Flex>
    </Box>
  );
};

export default BottomNavBar;