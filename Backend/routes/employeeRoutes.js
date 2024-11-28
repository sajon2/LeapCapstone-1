// routes/employeeRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const Employee = require('../models/User'); // Use User model for employees
const { auth, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new employee
router.post(
  '/',
  auth,
  isAdmin,
  [
    body('fullName').not().isEmpty().withMessage('Full Name is required'),
    body('email').isEmail().withMessage('Email is invalid'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('dateOfBirth').not().isEmpty().withMessage('Date of Birth is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation Errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, email, password, dateOfBirth, profilePicture } = req.body;

    try {
      // Check if employee already exists
      let employee = await Employee.findOne({ email });
      if (employee) {
        console.log('Employee already exists');
        return res.status(400).json({ errors: [{ msg: 'Employee already exists' }] });
      }

      // Generate employee ID
      const employeeId = `EMP-${Date.now()}`;

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create a new employee
      employee = new Employee({
        username: fullName, // Assuming fullName maps to username
        email,
        password: hashedPassword,
        dateOfBirth,
        userType: 'employee',
        profilePicture: profilePicture || '',
        employeeId
      });

      await employee.save();
      res.status(201).json({ msg: 'Employee created successfully', employee });
    } catch (err) {
      console.error('Server error:', err.message);
      res.status(500).send('Server error');
    }
  }
);

// Get all employees
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const employees = await Employee.find({ userType: 'employee' });
    res.json(employees);
  } catch (err) {
    console.error('Error fetching employees:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
