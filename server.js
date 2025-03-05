require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Crear la carpeta 'uploads' si no existe
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const app = express();
const port = process.env.PORT || 3000;

// Configuración de multer para almacenar imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Almacenamos las imágenes en la carpeta 'uploads'
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Usamos la fecha para evitar nombres duplicados
  },
});

const upload = multer({ storage: storage });

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// Habilitar CORS
app.use(cors());

// Middlewares para parsear el body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar express para servir archivos estáticos (las imágenes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Servir archivos estáticos desde el directorio "public"
app.use(express.static(path.join(__dirname, 'public', 'html')));

// Ruta principal: enviar el archivo de login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'login.htm'));
});

// Rutas
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');  // Nueva ruta para órdenes

// Usar rutas
// Usar las rutas de autenticación
app.use('/api/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);  // Ruta para órdenes

// Middleware para rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Middleware para el manejo general de errores (500)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Error del servidor' });
});

// Iniciar el servidor y abrir el enlace en el navegador
app.listen(port, async () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
  try {
    // Carga dinámica del módulo "open" (ESM-only)
    const openModule = await import('open');
    await openModule.default(`http://localhost:3000/login.htm`);
    console.log('Se ha abierto el enlace en el navegador');
  } catch (error) {
    console.error('No se pudo abrir el enlace en el navegador', error);
  }
});
