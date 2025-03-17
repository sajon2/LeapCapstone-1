import React from 'react';
import { Box, Flex, IconButton, Text } from '@chakra-ui/react';
import { FaHome, FaPlusCircle, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

const AdminBottomNavBar = ({ onOpenAddVenue }) => {
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
      height="70px"
    >
      <Flex justify="space-around" align="center" height="100%">
        {/* Dashboard */}
        <Flex direction="column" align="center" onClick={() => navigate('/admin-dashboard')}>
          <IconButton
            aria-label="Dashboard"
            icon={<FaHome />}
            variant="ghost"
            color="white"
            size="lg"
          />
          <Text fontSize="xs">Dashboard</Text>
        </Flex>

        {/* Add Venue */}
        <Flex direction="column" align="center" onClick={onOpenAddVenue}>
          <IconButton
            aria-label="Add Venue"
            icon={<FaPlusCircle />}
            variant="ghost"
            color="white"
            size="lg"
          />
          <Text fontSize="xs">Add Venue</Text>
        </Flex>

        {/* Logout */}
        <Flex direction="column" align="center" onClick={logout}>
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

export default AdminBottomNavBar;
