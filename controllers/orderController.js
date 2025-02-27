const Order = require('../models/Order');

// Crear una nueva orden
exports.createOrder = async (req, res) => {
  try {
    const { userId, products, totalPrice, shippingAddress } = req.body;

    const newOrder = new Order({ userId, products, totalPrice, shippingAddress });
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Obtener todas las órdenes de un usuario
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Obtener una orden por su ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};
