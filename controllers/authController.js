const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Registro de usuario
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Usuario ya registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ message: 'Usuario creado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Iniciar sesión de usuario
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password"); // Asegura traer la contraseña
    if (!user) {
      return res.status(400).json({ success: false, message: 'Usuario no encontrado' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ success: false, message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });

    res.json({ success: true, message: "Inicio de sesión exitoso", token });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};

// Obtener datos del usuario autenticado
exports.getUserData = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Obtener el token
    if (!token) {
      return res.status(401).json({ success: false, message: "No autorizado" });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.userId).select("-password"); // Excluye la contraseña

    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
};
