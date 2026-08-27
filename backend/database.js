const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Falls back to local MongoDB if process.env.MONGO_URI is not set in .env
    const conn = await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shop_management'
    );

    console.log(`MongoDB Database Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1); // Stop server process on failure
  }
};

module.exports = connectDB;