const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId, // Referencia al usuario
  products: [
    {
      productId: mongoose.Schema.Types.ObjectId, // Referencia al producto
      quantity: Number,
      price: Number
    }
  ],
  totalPrice: Number,
  shippingAddress: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
