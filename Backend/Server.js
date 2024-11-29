const express = require('express');
const cors = require('cors');
const connectDB = require('./DB');
const User = require('./models/User');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const barRoutes = require('./routes/barRoutes'); // Import the bar routes
const employeeRoutes = require('./routes/employeeRoutes'); // Import the employee routes
const userRoutes = require('./routes/userRoutes'); // Import user routes
const queueRoutes = require('./routes/queueRoutes'); // Import queue routes
const { auth, isAdmin } = require('./middleware/authMiddleware'); // Import auth and isAdmin middleware

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Hardcoded JWT secret key
const JWT_SECRET = 'your_jwt_secret';

// Initialize Express app
const app = express();

// Middleware to parse JSON requests
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// CORS Middleware
app.use(cors({
  origin: 'http://localhost:3000' // Allow requests from this origin
}));

// Serve static files from the uploads directory
app.use('/uploads', express.static(uploadDir));

// Connect to MongoDB
connectDB();

// Simple route
app.get('/', (req, res) => res.send('API is running'));

// Signup route
app.post('/signup', [
  body('username').not().isEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Email is invalid'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('dateOfBirth').not().isEmpty().withMessage('Date of birth is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, dateOfBirth } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    user = new User({
      username,
      email,
      password: hashedPassword,
      dateOfBirth,
      userType: 'user' // Default userType to 'user'
    });

    await user.save();

    // Generate JWT token
    const token = await user.generateAuthToken();

    res.status(201).json({ msg: 'User registered successfully', token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: 'User does not exist' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = await user.generateAuthToken();

    res.json({ user, token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get authenticated user
app.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Bar routes
app.use('/api/bars', barRoutes);

// Employee routes
app.use('/api/employees', employeeRoutes);

// User routes
app.use('/api', userRoutes);

// Queue routes
app.use('/api/queue', queueRoutes);

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
