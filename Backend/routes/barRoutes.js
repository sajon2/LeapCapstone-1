const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const Bar = require('../models/Bars');
const { auth, isAdmin } = require('../middleware/authMiddleware');
const User = require('../models/User');

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

// Create a new bar profile
router.post(
  '/',
  auth, 
  isAdmin, 
  upload.single('image'), 
  [
    body('name').not().isEmpty().withMessage('Name is required'),
    body('location').not().isEmpty().withMessage('Location is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, location, description } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    try {
      const bar = new Bar({
        name,
        location,
        description,
        imageUrl,
        createdBy: req.user._id,
      });

      await bar.save();
      res.status(201).json(bar);
    } catch (err) {
      console.log('Server error:', err.message);
      res.status(500).send('Server error');
    }
  }
);

// Update an existing bar profile
router.put(
  '/:id',
  auth, 
  isAdmin, 
  upload.single('image'), 
  [
    body('name').optional().not().isEmpty().withMessage('Name is required if provided'),
    body('location').optional().not().isEmpty().withMessage('Location is required if provided'),
    body('description').optional().not().isEmpty().withMessage('Description is required if provided'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, location, description } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    try {
      const bar = await Bar.findById(req.params.id);
      if (!bar) {
        return res.status(404).json({ msg: 'Bar not found' });
      }

      // Only the creator can update the bar
      if (bar.createdBy.toString() !== req.user._id.toString()) {
        return res.status(401).json({ msg: 'User not authorized' });
      }

      if (name) bar.name = name;
      if (location) bar.location = location;
      if (description) bar.description = description;
      if (imageUrl) bar.imageUrl = imageUrl;

      await bar.save();
      res.json(bar);
    } catch (err) {
      console.log('Server error:', err.message);
      res.status(500).send('Server error');
    }
  }
);

// Separate route for uploading images
router.put('/:id/upload-image', auth, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const bar = await Bar.findById(req.params.id);
    if (!bar) {
      return res.status(404).json({ msg: 'Bar not found' });
    }

    // Only the creator can update the bar
    if (bar.createdBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    bar.imageUrl = imageUrl;

    await bar.save();
    res.json(bar);
  } catch (err) {
    console.log('Server error:', err.message);
    res.status(500).send('Server error');
  }
});

// Get all bars created by the authenticated admin
router.get('/', auth, async (req, res) => {
  try {
    const bars = await Bar.find({ createdBy: req.user._id }).populate('createdBy', 'username');
    res.json(bars);
  } catch (err) {
    console.log('Error fetching bars:', err.message);
    res.status(500).send('Server error');
  }
});

// Get all bars for users
router.get('/all', auth, async (req, res) => {
  console.log('Accessing /all bars route');
  console.log('Authenticated user:', req.user);

  try {
    const bars = await Bar.find().populate('createdBy', 'username');
    res.json(bars);
  } catch (err) {
    console.log('Error fetching bars:', err.message);
    res.status(500).send('Server error');
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const bar = await Bar.findById(req.params.id);
    if (!bar) {
      return res.status(404).json({ msg: 'Bar not found' });
    }
    res.json(bar);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/:barId/employees', auth, isAdmin, async (req, res) => {
  try {
    const bar = await Bar.findById(req.params.barId);
    if (!bar) {
      return res.status(404).json({ msg: 'Bar not found' });
    }

    if (bar.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Unauthorized access to this bar' });
    }

    const employees = await User.find({ barId: req.params.barId, userType: 'employee' });
    res.json(employees);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});



module.exports = router;
