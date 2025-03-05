const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  image: { type: String, default: null },  // Si no se asigna una imagen, será null
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
