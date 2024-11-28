const mongoose = require('mongoose');

// Replace this with your actual MongoDB connection string
const MONGO_URI = 'mongodb+srv://devenzivanovic:MyBoy2002@cluster0.ecxmiby.mongodb.net/Leap?retryWrites=true&w=majority&appName=Cluster0';
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
