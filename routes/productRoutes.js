const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Obtener todos los productos
router.get('/', productController.getAllProducts);

// Obtener un producto por ID
router.get('/:id', productController.getProductById);

// Agregar un nuevo producto con imagen
router.post('/', productController.uploadImage, productController.addProduct);

// Actualizar un producto con imagen opcional
router.put('/:id', productController.uploadImage, productController.updateProduct);

// Eliminar un producto
router.delete('/:id', productController.deleteProduct);

module.exports = router;
