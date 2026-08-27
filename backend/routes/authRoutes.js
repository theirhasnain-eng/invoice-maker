const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Support both export styles for authMiddleware (named or default)
const authMiddleware = require('../middleware/authMiddleware');
const protect = authMiddleware.protect || authMiddleware;

// Middleware to restrict access to Admins only
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
};

// 1. LOGIN (Blocks deactivated users)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter both email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated. Contact Admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '30d' }
    );

    res.json({
      token,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    console.error('Login Route Error:', error.message);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// 2. ADMIN ONLY: GET ALL SHOPKEEPERS
router.get('/shopkeepers', protect, adminOnly, async (req, res) => {
  try {
    const shopkeepers = await User.find({ role: 'shopkeeper' }).select('-password').sort({ createdAt: -1 });
    res.json(shopkeepers);
  } catch (error) {
    console.error('Fetch Shopkeepers Error:', error.message);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// 3. ADMIN ONLY: CREATE NEW SHOPKEEPER
router.post('/register-shopkeeper', protect, adminOnly, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all required fields (name, email, password).' });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'A user account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newShopkeeper = new User({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: 'shopkeeper',
      isActive: true
    });

    await newShopkeeper.save();
    res.status(201).json({ message: 'Shopkeeper account created successfully!' });
  } catch (error) {
    console.error('Register Shopkeeper Error:', error.message);
    res.status(500).json({ message: `Failed to create account: ${error.message}` });
  }
});

// 4. ADMIN ONLY: TOGGLE ACTIVATE / DEACTIVATE
router.patch('/toggle-status/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Shopkeeper account not found.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `Account ${user.isActive ? 'activated' : 'deactivated'} successfully.` });
  } catch (error) {
    console.error('Toggle Status Error:', error.message);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

module.exports = router;