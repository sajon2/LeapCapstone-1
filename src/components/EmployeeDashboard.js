import React from 'react';
import { Box, Heading, Flex, Text, Menu, MenuButton, MenuList, MenuItem, IconButton, VStack, Button, Divider } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';

const EmployeeDashboard = () => {
  return (
    <Box
      position="relative"
      minHeight="100vh"
      display="flex"
      flexDirection="column"
    >
      {/* Header */}
      <Box
        bg="gray.900"
        width="100%"
        py={4}
        px={6}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Heading as="h1" size="lg" color="white">
          Employee Dashboard
        </Heading>
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<ChevronDownIcon />}
            variant="outline"
            colorScheme="whiteAlpha"
            aria-label="Options"
          />
          <MenuList>
            <MenuItem>Option 1</MenuItem>
            <MenuItem>Option 2</MenuItem>
            <MenuItem>Option 3</MenuItem>
          </MenuList>
        </Menu>
      </Box>

      {/* Middle Section */}
      <Flex
        flex="1"
        direction={{ base: "column", md: "row" }}
        bg="white"
      >
        <Box
          bg="gray.900"
          color="white"
          width={{ base: "100%", md: "250px" }}
          py={6}
          px={4}
          display="flex"
          flexDirection="column"
          alignItems="start"
        >
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Navigation
          </Text>
          <VStack align="start" spacing={4} w="full">
            <Button variant="link" colorScheme="whiteAlpha">
              Dashboard
            </Button>
            <Button variant="link" colorScheme="whiteAlpha">
              Projects
            </Button>
            <Button variant="link" colorScheme="whiteAlpha">
              Tasks
            </Button>
            <Button variant="link" colorScheme="whiteAlpha">
              Messages
            </Button>
          </VStack>
        </Box>
        <Flex
          flex="1"
          direction="column"
          align="center"
          justify="center"
          py={10}
          px={6}
        >
          <VStack spacing={4} w="full" maxW="xl" align="stretch">
            <Text fontSize="xl" fontWeight="bold" color="gray.700">
              Welcome to the Employee Dashboard!
            </Text>
            <Divider />
            <Text fontSize="md" color="gray.600">
              Here you can manage your projects, tasks, and communicate with your team.
            </Text>
          </VStack>
        </Flex>
      </Flex>

      {/* Footer */}
      <Box
        bg="gray.900"
        width="100%"
        py={4}
        display="flex"
        justifyContent="center"
      >
        <Text color="white" fontSize="sm">
          Footer Content
        </Text>
      </Box>
    </Box>
  );
};

export default EmployeeDashboard;
