exports.createProduct = async (req, res) => {
  try {
    if (!req.body.price) {
      return res.status(400).json({ message: "❌ El precio es obligatorio" });
    }

    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description
    });

    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error("❌ Error al crear producto:", err.message);
    res.status(400).json({ message: "❌ Error al crear el producto", error: err.message });
  }
};
