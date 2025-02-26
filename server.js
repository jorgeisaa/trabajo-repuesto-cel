require('dotenv').config(); // Carga las variables de entorno
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

connection.connect(err => {
  if (err) {
    console.error('❌ Error conectando a MySQL:', err);
    return;
  }
  console.log('✅ Conectado a la base de datos MySQL');
});

// Ejemplo de una consulta
connection.query('SELECT 1 + 1 AS solution', (err, results) => {
  if (err) throw err;
  console.log('La solución es:', results[0].solution);
});

// Exportar la conexión para usarla en otras partes del proyecto
module.exports = connection;
