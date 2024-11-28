const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const Employee = require('../models/User'); // Use User model for employees
const Bar = require('../models/Bars'); // Ensure the path to Bars.js is correct
const { auth, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Generate a unique file name
  },
});

const upload = multer({ storage });

// Create a new employee
router.post(
  '/',
  auth,
  isAdmin,
  upload.single('profilePicture'), // Middleware to handle file upload
  [
    body('fullName').not().isEmpty().withMessage('Full Name is required'),
    body('email').isEmail().withMessage('Email is invalid'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('dateOfBirth').not().isEmpty().withMessage('Date of Birth is required'),
    body('barId').not().isEmpty().withMessage('Bar ID is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, email, password, dateOfBirth, barId } = req.body;

    try {
      // Verify the bar exists
      const bar = await Bar.findById(barId);
      if (!bar) {
        return res.status(404).json({ msg: 'Bar not found' });
      }

      // Generate employee ID
      const employeeId = `EMP-${Date.now()}`;

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create the new employee
      const employee = new Employee({
        username: fullName,
        email,
        password: hashedPassword,
        dateOfBirth,
        userType: 'employee',
        profilePicture: req.file ? `/uploads/${req.file.filename}` : '', // Save file path
        employeeId,
        barId, // Associate employee with the specific bar
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

// Get employees for a specific bar
router.get('/:barId/employees', auth, isAdmin, async (req, res) => {
  try {
    const { barId } = req.params;

    // Verify the bar exists
    const bar = await Bar.findById(barId);
    if (!bar) {
      return res.status(404).json({ msg: 'Bar not found' });
    }

    const employees = await Employee.find({ barId, userType: 'employee' });
    res.json(employees);
  } catch (err) {
    console.error('Error fetching employees:', err.message);
    res.status(500).send('Server error');
  }
});
// Delete an employee
router.delete('/:employeeId', auth, isAdmin, async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await Employee.findByIdAndDelete(employeeId);
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    res.status(200).json({ msg: 'Employee deleted successfully' });
  } catch (err) {
    console.error('Error deleting employee:', err.message);
    res.status(500).send('Server error');
  }
});



module.exports = router;
