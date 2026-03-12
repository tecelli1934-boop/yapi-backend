const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  id: Number,
  name: String,
  image: String,
  price: Number,
  quantity: Number,
  totalPrice: Number,
  variationText: String,
  variationKey: String
}, { _id: false });

const orderSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: String,
  customerPhone: String,
  address: {
    type: String,
    required: true
  },
  items: [orderItemSchema],
  subtotal: Number,
  kdv: Number,
  total: Number,
  paymentMethod: {
    type: String,
    enum: ['credit', 'transfer', 'cash']
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);