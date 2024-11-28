// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    console.log('No token provided');
    return res.status(401).send({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded:', decoded);
    const user = await User.findOne({ _id: decoded.id, 'tokens.token': token });

    if (!user) {
      console.log('User not found');
      throw new Error('User not found');
    }

    req.token = token;
    req.user = user;
    console.log('User authenticated:', user);
    next();
  } catch (e) {
    console.log('Invalid token', e.message);
    res.status(401).send({ error: 'Invalid token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.userType === 'admin') {
    console.log('User is admin');
    next();
  } else {
    console.log('User is not authorized');
    res.status(403).json({ msg: 'Access denied. Admins only.' });
  }
};

module.exports = { auth, isAdmin };
