const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Crear una nueva orden
router.post('/', orderController.createOrder);

// Obtener todas las órdenes de un usuario
router.get('/user/:userId', orderController.getUserOrders);

// Obtener una orden por su ID
router.get('/:orderId', orderController.getOrderById);

module.exports = router;
