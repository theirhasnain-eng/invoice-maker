const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 0 },
  minQuantity: { type: Number, required: true, default: 5 } // Low-stock threshold
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);