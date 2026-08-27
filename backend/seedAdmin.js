// backend/seedAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || '');

    const adminExists = await User.findOne({ email: 'admin@shop.com' });
    if (adminExists) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await User.create({
      name: 'Shop Owner',
      email: 'admin@shop.com',
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Admin account created successfully!');
    console.log('Email: admin@shop.com | Password: admin123');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedAdmin();