import React from 'react';
import { Box } from '@chakra-ui/react';
import BottomNavBar from './BottomNavBar';

const UserLayout = ({ children }) => {
  return (
    <Box minHeight="100vh" display="flex" flexDirection="column" bg="gray.100">
      <Box flex="1" pb="60px">
        {children}
      </Box>
      <BottomNavBar />
    </Box>
  );
};

export default UserLayout;
