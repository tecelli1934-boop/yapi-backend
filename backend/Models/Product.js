const mongoose = require('mongoose');

const variationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['length', 'color', 'technical', 'combined', null],
    default: null
  },
  unit: String,
  options: mongoose.Schema.Types.Mixed,
  dimensions: [{
    size: String,
    price: Number
  }],
  colors: [{
    value: String,
    color: String
  }]
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['aluminyum', 'kapi-pencere', 'pvc', 'demir', 'vida', 'dekoratif']
  },
  basePrice: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    default: 0
  },
  variations: variationSchema
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);