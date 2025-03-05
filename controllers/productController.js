const Product = require('../models/product');

// Obtener todos los productos
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Obtener un producto por su ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);  // Cambié 'productId' por 'id'
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Crear un nuevo producto
exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;

    const newProduct = new Product({ name, description, price, stock, category });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Actualizar un producto
exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });  // Cambié 'productId' por 'id'
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Eliminar un producto
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);  // Usar req.params.id directamente
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(204).json({ message: 'Producto eliminado' });
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};


