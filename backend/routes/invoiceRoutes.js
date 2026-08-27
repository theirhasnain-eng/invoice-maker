const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Item = require('../models/Item');
const Invoice = require('../models/Invoice');

const authMiddleware = require('../middleware/authMiddleware');
const protect = authMiddleware.protect || authMiddleware;

// GET /api/invoices - Get all sales
router.get('/', protect, async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    console.error('Fetch Invoices Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch invoice history' });
  }
});

// POST /api/invoices/create - Save cash memo with actual user name
router.post('/create', protect, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { customerName, items, discount = 0 } = req.body;
    let subtotal = 0;
    const processedItems = [];

    for (let cartItem of items) {
      const item = await Item.findById(cartItem.itemId).session(session);

      if (!item) {
        throw new Error('Item not found');
      }
      if (item.quantity < cartItem.quantity) {
        throw new Error(`Insufficient stock for "${item.name}". Available: ${item.quantity}`);
      }

      item.quantity -= cartItem.quantity;
      await item.save({ session });

      const itemSubtotal = item.price * cartItem.quantity;
      subtotal += itemSubtotal;

      processedItems.push({
        itemId: item._id,
        name: item.name,
        price: item.price,
        quantity: cartItem.quantity,
        subtotal: itemSubtotal
      });
    }

    const discountAmount = parseFloat(discount) || 0;
    const totalAmount = Math.max(0, subtotal - discountAmount);
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    // Get exact user name (Admin or Shopkeeper)
    const issuerName = req.user && req.user.name ? req.user.name : 'Admin';

    const newInvoice = new Invoice({
      invoiceNumber,
      customerName: customerName || 'Walk-in Customer',
      issuedBy: issuerName,
      items: processedItems,
      subtotal,
      discount: discountAmount,
      totalAmount
    });

    await newInvoice.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: 'Invoice created successfully', invoice: newInvoice });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Create Invoice Error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;