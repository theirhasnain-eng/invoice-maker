const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database connection
const connectDB = require('./database');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));

// Connect Database
connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});