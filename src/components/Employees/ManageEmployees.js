import React, { useState, useEffect, forwardRef } from 'react';
import { Box, Heading, Flex, Text, VStack, Button, Divider, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input, useDisclosure, Image, IconButton } from '@chakra-ui/react';
import { ArrowBackIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
  <Input
    placeholder="Date of Birth"
    value={value}
    onClick={onClick}
    readOnly
    ref={ref}
  />
));

const ManageEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [profilePicture, setProfilePicture] = useState(null);
  const [message, setMessage] = useState('');
  const [expandedEmployee, setExpandedEmployee] = useState(null);
  const { token } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/employees', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setEmployees(response.data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, [token]);

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPassword('');
    setDateOfBirth(new Date());
    setProfilePicture(null);
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const employeeData = {
      fullName,
      email,
      password,
      dateOfBirth: dateOfBirth.toISOString(), // Format the date of birth properly
      profilePicture // For now, we'll handle this as a string URL or base64, update backend if necessary
    };

    console.log('Employee Data:', employeeData);

    try {
      const response = await axios.post('http://localhost:5001/api/employees', employeeData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setMessage('Employee created successfully!');
      setEmployees([...employees, response.data.employee]);
      resetForm();
      onClose();
    } catch (error) {
      setMessage('Error creating employee.');
      console.error('Error creating employee:', error.response?.data || error.message);
    }
  };

  const toggleEmployeeDetails = (employeeId) => {
    setExpandedEmployee(expandedEmployee === employeeId ? null : employeeId);
  };

  return (
    <Box position="relative" minHeight="100vh" display="flex" flexDirection="column">
      {/* Header */}
      <Box bg="gray.900" width="100%" py={4} px={6} display="flex" justifyContent="space-between" alignItems="center">
        <Heading as="h1" size="lg" color="white">Manage Employees</Heading>
        <Button onClick={() => navigate(-1)} colorScheme="whiteAlpha" variant="outline">Back</Button>
      </Box>

      {/* Middle Section */}
      <Flex flex="1" direction={{ base: "column", md: "row" }} bg="white">
        <Box bg="gray.900" color="white" width={{ base: "100%", md: "250px" }} py={6} px={4} display="flex" flexDirection="column" alignItems="start">
          <Text fontSize="lg" fontWeight="bold" mb={4}>Navigation</Text>
          <VStack align="start" spacing={4} w="full">
            <Button onClick={onOpen} variant="link" colorScheme="whiteAlpha">Create Employee</Button>
          </VStack>
        </Box>
        <Flex flex="1" direction="column" align="center" justify="center" py={10} px={6}>
          <VStack spacing={4} w="full" maxW="xl" align="stretch">
            <Text fontSize="xl" fontWeight="bold" color="gray.700">Employees List</Text>
            <Divider />
            {employees.map(employee => (
              <Flex key={employee._id} p={4} shadow="md" borderWidth="1px" width="100%" alignItems="center">
                {employee.profilePicture && (
                  <Image src={`http://localhost:5001${employee.profilePicture}`} alt={employee.fullName} boxSize="100px" objectFit="cover" marginRight={4} />
                )}
                <Box flex="1">
                  <Heading fontSize="xl">{employee.fullName}</Heading>
                  <Text mt={2}><strong>Email:</strong> {employee.email}</Text>
                  <Text mt={2}><strong>Employee ID:</strong> {employee.employeeId}</Text>
                  {expandedEmployee === employee._id && (
                    <>
                      <Text mt={2}><strong>Date of Birth:</strong> {new Date(employee.dateOfBirth).toLocaleDateString()}</Text>
                      {/* Add other relevant employee details here */}
                    </>
                  )}
                </Box>
                <IconButton
                  icon={expandedEmployee === employee._id ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  onClick={() => toggleEmployeeDetails(employee._id)}
                  aria-label="Toggle Employee Details"
                  ml={4}
                />
              </Flex>
            ))}
          </VStack>
        </Flex>
      </Flex>

      {/* Footer */}
      <Box bg="gray.900" width="100%" py={4} display="flex" justifyContent="center">
        <Text color="white" fontSize="sm">Footer Content</Text>
      </Box>

      {/* Modal for Creating a New Employee */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a New Employee</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <Box mb={4}>
                <Input placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </Box>
              <Box mb={4}>
                <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </Box>
              <Box mb={4}>
                <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </Box>
              <Box mb={4}>
                <DatePicker
                  selected={dateOfBirth}
                  onChange={(date) => setDateOfBirth(date)}
                  dateFormat="yyyy-MM-dd"
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={15}
                  maxDate={new Date()}
                  customInput={<CustomDateInput />}
                />
              </Box>
              <Box mb={4}>
                <Input type="file" onChange={(e) => setProfilePicture(e.target.files[0])} />
              </Box>
              <Button type="submit" colorScheme="blue">Create Employee</Button>
            </form>
            {message && (
              <Text mt={4} color={message.includes('successfully') ? 'green.500' : 'red.500'}>
                {message}
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ManageEmployees;
