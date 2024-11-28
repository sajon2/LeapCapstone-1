import React, { useState, useEffect } from 'react';
import { Box, Heading, Flex, Text, VStack, Button, Divider, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input, useDisclosure, Image, IconButton } from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ManageEmployees = () => {
  const { barId } = useParams(); // Extract barId from the URL
  const [employees, setEmployees] = useState([]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [profilePicture, setProfilePicture] = useState(null); // File object
  const [message, setMessage] = useState('');
  const [expandedEmployee, setExpandedEmployee] = useState(null);
  const { token } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  useEffect(() => {
    if (!barId) {
      console.error('Bar ID is not defined.');
      return;
    }

    
  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/employees/${barId}/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error.message);
    }
  };

  fetchEmployees();
}, [barId, token]);

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPassword('');
    setDateOfBirth(new Date());
    setProfilePicture(null);
    setMessage('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file); // Save the file object directly
  };
  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }
  
    try {
      await axios.delete(`http://localhost:5001/api/employees/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(employees.filter((employee) => employee._id !== employeeId));
      setMessage('Employee deleted successfully!');
    } catch (error) {
      console.error('Error deleting employee:', error.response?.data || error.message);
      setMessage('Error deleting employee.');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('dateOfBirth', dateOfBirth.toISOString());
    formData.append('barId', barId);
    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    try {
      const response = await axios.post('http://localhost:5001/api/employees', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage('Employee created successfully!');
      setEmployees([...employees, response.data.employee]);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error creating employee:', error.response?.data || error.message);
      setMessage('Error creating employee.');
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
      <Flex flex="1" direction={{ base: 'column', md: 'row' }} bg="white">
        <Box bg="gray.900" color="white" width={{ base: '100%', md: '250px' }} py={6} px={4} display="flex" flexDirection="column" alignItems="start">
          <Text fontSize="lg" fontWeight="bold" mb={4}>Navigation</Text>
          <VStack align="start" spacing={4} w="full">
            <Button onClick={onOpen} variant="link" colorScheme="whiteAlpha">Create Employee</Button>
          </VStack>
        </Box>
        <Flex flex="1" direction="column" align="center" justify="center" py={10} px={6}>
          <VStack spacing={4} w="full" maxW="xl" align="stretch">
            <Text fontSize="xl" fontWeight="bold" color="gray.700">Employees List</Text>
            <Divider />
            {employees.map((employee) => (
  <Flex key={employee._id} p={4} shadow="md" borderWidth="1px" width="100%" alignItems="center">
    {employee.profilePicture && (
      <Image
        src={`http://localhost:5001${employee.profilePicture}`}
        alt={employee.fullName}
        boxSize="100px"
        objectFit="cover"
        marginRight={4}
      />
    )}
    <Box flex="1">
      <Heading fontSize="xl">{employee.fullName}</Heading>
      <Text mt={2}><strong>Email:</strong> {employee.email}</Text>
      <Text mt={2}><strong>Employee ID:</strong> {employee.employeeId}</Text>
      {expandedEmployee === employee._id && (
        <Text mt={2}><strong>Date of Birth:</strong> {new Date(employee.dateOfBirth).toLocaleDateString()}</Text>
      )}
    </Box>
    <IconButton
      icon={expandedEmployee === employee._id ? <ChevronUpIcon /> : <ChevronDownIcon />}
      onClick={() => toggleEmployeeDetails(employee._id)}
      aria-label="Toggle Employee Details"
      ml={4}
    />
    <Button
      colorScheme="red"
      onClick={() => handleDeleteEmployee(employee._id)}
      ml={4}
    >
      Delete
    </Button>
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
                <Input
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </Box>
              <Box mb={4}>
                <Input
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Box>
              <Box mb={4}>
                <Input
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
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
                />
              </Box>
              <Box mb={4}>
                <Input type="file" onChange={handleFileUpload} />
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
