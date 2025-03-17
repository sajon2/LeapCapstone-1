const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Import the 'fs' module
const Bar = require('../models/Bars');
const { auth, isAdmin } = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();

// Multer setup
const uploadDir = 'uploads/'; // Define the upload directory

// --- Ensure the 'uploads' directory exists ---
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Use the defined upload directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });


// Create a new bar profile (using GeoJSON)
router.post(
  '/',
  auth,
  isAdmin,
  upload.single('image'),
  [
    body('name').not().isEmpty().withMessage('Name is required'),
    body('address').not().isEmpty().withMessage('Address is required'),
    body('location.coordinates')
      .isArray({ min: 2, max: 2 })
      .withMessage('Coordinates must be an array of [longitude, latitude]'),
    body('location.type').equals('Point').withMessage('Location type must be Point'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, address, description } = req.body;
     // Check if req.file exists before accessing its properties
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';


    try {
        if (!req.body.location || !req.body.location.coordinates) {
            return res.status(400).json({ errors: [{ msg: 'Location coordinates are required' }] });
          }
      const { coordinates } = req.body.location;
      // Ensure coordinates are numbers
      const parsedCoordinates = coordinates.map(Number);

      const bar = new Bar({
        name,
        location: {
          type: 'Point',
          coordinates: parsedCoordinates, // Use the parsed coordinates
        },
        address, // Store the full address
        description,
        imageUrl,
        createdBy: req.user._id,
      });

      await bar.save();
      res.status(201).json(bar);
    } catch (err) {
      console.error('Server error:', err); // More detailed error logging
      res.status(500).send('Server error');
    }
  }
);
// ... (rest of your backend code - the update, get, etc. routes) ...
// Update an existing bar profile (using GeoJSON)
router.put(
    '/:id',
    auth,
    isAdmin,
    upload.single('image'),
    [
        body('name').optional().not().isEmpty().withMessage('Name is required if provided'),
        body('address').optional().not().isEmpty().withMessage('Address is required'), //Validate Address
        body('location.coordinates').optional().isArray({ min: 2, max: 2 }).withMessage('Coordinates must be an array of [longitude, latitude]'),
        body('location.type').optional().equals('Point').withMessage('Location type must be Point'),
        body('description').optional().not().isEmpty().withMessage('Description is required if provided'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, address, description } = req.body;
        //req.file can be undefined, so this sets imageUrl
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
            if (address) bar.address = address;
            if (description) bar.description = description;
            if (imageUrl) bar.imageUrl = imageUrl;

             // Handle location update (if provided)
            if (req.body.location && req.body.location.coordinates) {
                const parsedCoordinates = req.body.location.coordinates.map(Number);
                 bar.location = {
                     type: "Point",
                     coordinates: parsedCoordinates
                };
            }

            await bar.save();
            res.json(bar);
        } catch (err) {
            console.log('Server error:', err.message);
            res.status(500).send('Server error');
        }
    }
);

// Separate route for uploading images (no changes needed here, kept for completeness)
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

// Get all bars created by the authenticated admin (no changes needed)
router.get('/', auth, async (req, res) => {
    try {
        const bars = await Bar.find({ createdBy: req.user._id }).populate('createdBy', 'username');
        res.json(bars);
    } catch (err) {
        console.log('Error fetching bars:', err.message);
        res.status(500).send('Server error');
    }
});

// Get all bars for users (return location data)
router.get('/all', auth, async (req, res) => {
    console.log('Accessing /all bars route');
    console.log('Authenticated user:', req.user);

    try {
        //Populate the address in this section for display to users.
        const bars = await Bar.find().populate('createdBy', 'username');
        res.json(bars);
    } catch (err) {
        console.log('Error fetching bars:', err.message);
        res.status(500).send('Server error');
    }
});

//Get a bar by ID
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

// Get all employees for a specific bar (no changes needed)
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