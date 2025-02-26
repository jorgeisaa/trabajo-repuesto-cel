const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Ruta para obtener todos los productos
router.get('/', productController.getAllProducts);

// Ruta para crear un nuevo producto
router.post('/', productController.createProduct);

module.exports = router;
