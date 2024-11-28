// routes/userRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const { auth, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Get all employees
router.get('/employees', auth, isAdmin, async (req, res) => {
  try {
    const employees = await User.find({ userType: 'employee' });
    res.json(employees);
  } catch (err) {
    console.log('Error fetching employees:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
