const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('✗ MONGODB_URI is not set in environment variables');
    return false;
  }

  try {
    await mongoose.connect(uri);
    console.log('✓ MongoDB connected successfully');
    return true;
  } catch (err) {
    console.error('✗ MongoDB connection failed:', err.message);
    return false;
  }
}

module.exports = { connectDB, mongoose };
