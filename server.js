const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;
const usersFilePath = path.join(__dirname, 'data', 'users.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Middleware para servir archivos estáticos sin que `index.htm` se cargue automáticamente
app.use(express.static(path.join(__dirname, 'public', 'html'), { index: false }));

// Función para cargar usuarios desde JSON
const loadUsers = () => {
    try {
        if (!fs.existsSync(usersFilePath)) {
            fs.writeFileSync(usersFilePath, JSON.stringify([]), 'utf-8');
            return [];
        }
        const data = fs.readFileSync(usersFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Error al leer el archivo de usuarios:', error);
        return [];
    }
};

// Función para guardar usuarios en JSON
const saveUsers = (users) => {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
        console.log('✅ Usuarios guardados correctamente.');
    } catch (error) {
        console.error('❌ Error al guardar usuarios:', error);
    }
};

// Ruta para registrar usuarios
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    let users = loadUsers();
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ success: false, message: 'El usuario ya existe' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        users.push({ username, password: hashedPassword });
        saveUsers(users);
        res.json({ success: true, message: 'Registro exitoso, ahora puede iniciar sesión', redirect: '/login.htm' });
    } catch (error) {
        console.error('❌ Error al registrar usuario:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// Ruta para iniciar sesión
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`📝 Usuario: ${username}, Contraseña ingresada: ${password}`);

    const users = loadUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
        console.log("❌ Usuario no encontrado");
        return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }

    console.log(`🔐 Hash almacenado: ${user.password}`);

    try {
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            console.log("✅ Contraseña correcta");
            return res.json({ success: true, message: 'Inicio de sesión exitoso', redirect: '/index.html' });

        } else {
            console.log("❌ Contraseña incorrecta");
            return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
        }
    } catch (error) {
        console.error("⚠️ Error en bcrypt.compare():", error);
        return res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// Ruta por defecto para servir `login.htm`
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'login.htm'));
});

// Ruta para servir `register.htm`
app.get('/register.htm', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'register.htm'));
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
