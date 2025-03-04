const Product = require('../models/Product');

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
    const product = await Product.findById(req.params.id); // Cambio aquí
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
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }); // Cambio aquí
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
    console.log("Intentando eliminar el producto con ID:", req.params.id);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log("❌ ID inválido");
      return res.status(400).json({ message: 'ID inválido' });
    }

    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      console.log("❌ Producto no encontrado");
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    console.log("✅ Producto eliminado correctamente");
    res.status(200).json({ message: 'Producto eliminado' });
  } catch (err) {
    console.error("❌ Error en el servidor:", err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
