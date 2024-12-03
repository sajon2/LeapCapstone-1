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
router.put('/update', auth, upload.single('profilePicture'), async (req, res) => {
  const { username, email, dateOfBirth } = req.body;
  const profilePicture = req.file ? `/uploads/${req.file.filename}` : undefined;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update user fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();
    res.json({ msg: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
