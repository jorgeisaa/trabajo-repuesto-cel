const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer'); // Requerir multer para manejar la carga de archivos

const app = express();
const PORT = 3000;
const inventoryFilePath = path.join(__dirname, 'data', 'inventory.json');
const salesFilePath = path.join(__dirname, 'data', 'sales.json');
const suppliersFilePath = path.join(__dirname, 'data', 'proovedor.json');
const employeesFilePath = path.join(__dirname, 'data', 'employees.json');


const imageDirectory = path.join(__dirname, 'uploads');  // Verifica que esta ruta sea la correcta

// Configuración de CORS
app.use(cors({
    origin: 'http://localhost:8080', // Asegúrate de que el puerto sea el correcto
    methods: ['GET', 'POST', 'DELETE', 'PUT'], // Métodos permitidos
    allowedHeaders: ['Content-Type'], // Cabeceras permitidas
}));

// Configuración para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));
app.use(express.json()); // Middleware para parsear datos JSON




const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Carpeta donde se guardan las imágenes
    },
    filename: (req, file, cb) => {
        const filePath = path.join('uploads', file.originalname);

        // Verificar si el archivo ya existe
if (fs.existsSync(filePath)) {
    console.log(`Archivo existente reutilizado: ${file.originalname}`);
    cb(null, file.originalname); // Solo se reutiliza el nombre del archivo existente
} else {
    console.log(`Guardando nuevo archivo: ${file.originalname}`);
    cb(null, file.originalname); // Guarda el archivo nuevo con el nombre proporcionado
}

    }
});
const upload = multer({ storage: storage });


// Ruta para guardar el carrito en un archivo JSON
app.post('/api/save-cart', (req, res) => {
    const cartData = req.body;

    // Ruta del archivo donde se almacenarán los datos
    const filePath = path.join(__dirname, 'data', 'cart.json');

    // Escribir los datos en el archivo
    fs.writeFile(filePath, JSON.stringify(cartData, null, 2), (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error al guardar los datos' });
        }
        res.status(200).json({ message: 'Carrito guardado exitosamente' });
    });
});


function readInventory() {
    try {
        const data = fs.readFileSync(inventoryFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error al leer el inventario:', error);
        return []; // Devuelve un inventario vacío como fallback
    }
}

function writeInventory(inventory) {
    try {
        fs.writeFileSync(inventoryFilePath, JSON.stringify(inventory, null, 2));
    } catch (error) {
        console.error('Error al escribir el inventario:', error);
    }
}

// Ruta para obtener todos los productos
app.get('/api/products', (req, res) => {
    const products = readInventory();
    res.json(products);
});

// Ruta para agregar un nuevo producto
app.post('/api/products', upload.single('image'), (req, res) => {
    const { name, brand, quantity, price, date } = req.body;
    const products = readInventory();

    // Verificar si ya existe un producto con el mismo nombre
    const existingProductIndex = products.findIndex(p => p.name === name);

    if (existingProductIndex !== -1) {
        // Si ya existe un producto con el mismo nombre, se maneja el caso de actualización
        const existingProduct = products[existingProductIndex];

        // Si se sube un archivo nuevo, se usa el nuevo nombre de imagen
        const image = req.file
            ? `/uploads/${req.file.originalname}`
            : existingProduct.image; // Mantener la imagen original si no se sube una nueva

        if (!image) {
            console.error('Error: La imagen existente es null');
        } else {
            console.log(`Imagen existente utilizada: ${image}`);
        }

        products[existingProductIndex] = {
            ...existingProduct,
            brand,
            quantity: parseInt(quantity),
            price,
            date,
            image
        };

        writeInventory(products);
        res.json(products[existingProductIndex]);
    } else {
        // Si el producto es nuevo, se maneja de la siguiente manera:
        const image = req.file ? `/uploads/${req.file.originalname}` : null;

        if (!image) {
            console.error('Error: No se subió ninguna imagen');
        } else {
            console.log(`Nueva imagen guardada: ${image}`);
        }

        const newProduct = {
            id: Date.now(),
            name,
            brand,
            quantity: parseInt(quantity),
            price,
            date,
            image
        };

        products.push(newProduct);
        writeInventory(products);
        res.status(201).json(newProduct);
    }
});


app.put('/api/products/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { name, brand, quantity, price, date } = req.body;
    console.log(`Producto recibido para actualizar: ID = ${id}, name = ${name}, brand = ${brand}, quantity = ${quantity}, price = ${price}, date = ${date}`);
    
    const products = readInventory();
    console.log('Productos cargados desde el JSON:', products);

    const productIndex = products.findIndex(p => p.id === parseInt(id));
    console.log(`Índice del producto a actualizar: ${productIndex}`);

    if (productIndex !== -1) {
        const existingProduct = products[productIndex];
        console.log('Producto existente:', existingProduct);

        let image = existingProduct.image; // Usamos la imagen existente por defecto
        console.log('Imagen inicial del producto:', image);

        console.log('Archivo recibido en PUT:', req.file); // Verificamos si el archivo está llegando

        if (req.file) {
            console.log('Se recibió un archivo para actualizar la imagen.');
            const filePath = path.join('uploads', req.file.originalname);
            console.log(`Ruta de archivo: ${filePath}`);

            // Verificamos si la imagen ya existe en el servidor
            if (fs.existsSync(filePath)) {
                console.log(`Imagen existente reutilizada: /uploads/${req.file.originalname}`);
                image = `/uploads/${req.file.originalname}`; // Usamos el nombre de la imagen existente
            } else {
                console.log(`Guardando nueva imagen: /uploads/${req.file.originalname}`);
                image = `/uploads/${req.file.originalname}`; // Guardamos el nombre de la nueva imagen
            }
        } else {
            console.log('No se ha subido una imagen nueva, reutilizando la existente.');
        }

        // Mostrar el nombre de la imagen antes de actualizar el JSON
        console.log(`Imagen que se va a guardar en el JSON: ${image}`);

        // Actualizamos el producto con la imagen correcta (puede ser reutilizada o nueva)
        products[productIndex] = {
            ...existingProduct,
            name,
            brand,
            quantity: parseInt(quantity),
            price,
            date,
            image // Asignamos el nombre correcto de la imagen al JSON
        };

        console.log('Producto actualizado en el JSON:', products[productIndex]);

        writeInventory(products);
        console.log('Inventario actualizado en el archivo JSON.');
        res.json(products[productIndex]);
    } else {
        console.log('Producto no encontrado en el inventario.');
        res.status(404).json({ message: 'Producto no encontrado' });
    }
});


// Ruta para eliminar un producto
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const products = readInventory();
    const productIndex = products.findIndex(p => p.id === parseInt(id));
    if (productIndex !== -1) {
        products.splice(productIndex, 1);
        writeInventory(products);
        res.status(204).end();
    } else {
        res.status(404).json({ message: 'Producto no encontrado' });
    }
});


// Rutas de ventas

// Obtener todas las ventas registradas (GET)
// Obtener todas las ventas registradas (GET)
app.get('/api/sales', (req, res) => {
    fs.readFile(salesFilePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ message: 'Error al leer el archivo de ventas' });

        let sales = [];
        try {
            sales = JSON.parse(data); // Parsear el archivo como un array de ventas
        } catch (parseError) {
            return res.status(500).json({ message: 'Error al parsear el archivo de ventas' });
        }

        res.json(sales);
    });
});
// Obtener una venta específica por índice o ID (GET)
app.get('/api/sales/:index', (req, res) => {
    const { index } = req.params;

    fs.readFile('./data/sales.json', 'utf8', (err, data) => {
        if (err) return res.status(500).json({ message: 'Error al leer el archivo de ventas' });

        const sales = data
            .split('\n')
            .filter(line => line.trim() !== '') // Filtrar líneas vacías
            .map(line => JSON.parse(line)); // Parsear cada línea como JSON

        const sale = sales[index];

        if (!sale) return res.status(404).json({ message: 'Venta no encontrada' });

        res.json(sale);
    });
});

app.post('/api/add', express.json(), (req, res) => {
    const newProduct = req.body;

    const inventoryFilePath = path.join(__dirname, 'data', 'inventory.json');
    fs.readFile(inventoryFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            return res.status(500).json({ error: 'No se pudo cargar el inventario.' });
        }

        try {
            const inventory = JSON.parse(data); // Convertir el contenido del archivo a un objeto
            inventory.push(newProduct); // Agregar el nuevo producto al inventario

            fs.writeFile(inventoryFilePath, JSON.stringify(inventory, null, 2), (err) => {
                if (err) {
                    console.error('Error al guardar el archivo:', err);
                    return res.status(500).json({ error: 'No se pudo agregar el producto.' });
                }
                res.status(201).json(newProduct); // Responder con el producto agregado
            });
        } catch (parseError) {
            console.error('Error al procesar el archivo JSON:', parseError);
            res.status(500).json({ error: 'No se pudo procesar el inventario.' });
        }
    });
});


app.get('/api/export', (req, res) => {
    const inventoryFilePath = path.join(__dirname, 'data', 'inventory.json');
    
    fs.readFile(inventoryFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            return res.status(500).json({ error: 'No se pudo exportar el inventario.' });
        }

        res.setHeader('Content-Disposition', 'attachment; filename=inventory.json');
        res.setHeader('Content-Type', 'application/json');
        res.send(data); // Enviar el archivo JSON como respuesta para descarga
    });
});


app.put('/api/inventory/:index', upload.single('image'), express.json(), (req, res) => {
    const index = parseInt(req.params.index); // Obtener el índice desde la URL
    const updatedProduct = req.body; // Obtener el producto actualizado desde el cuerpo de la solicitud

    const inventoryFilePath = path.join(__dirname, 'data', 'inventory.json');
    
    // Leer el archivo JSON del inventario
    fs.readFile(inventoryFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            return res.status(500).json({ error: 'No se pudo cargar el inventario.' });
        }

        try {
            const inventory = JSON.parse(data); // Convertir el contenido del archivo a un objeto

            // Verificar si el índice es válido
            if (isNaN(index) || index < 0 || index >= inventory.length) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }

            // Actualizar la imagen del producto
            let image = inventory[index].image; // Usamos la imagen existente por defecto
            if (req.file) {
                const filePath = path.join('uploads', req.file.originalname);
                if (fs.existsSync(filePath)) {
                    image = `/uploads/${req.file.originalname}`; // Usamos el nombre de la imagen existente
                } else {
                    image = `/uploads/${req.file.originalname}`; // Guardamos el nombre de la nueva imagen
                }
            }

            // Actualizar el producto en el inventario
            inventory[index] = {
                ...inventory[index],
                ...updatedProduct,
                image // Asignamos el nombre correcto de la imagen al JSON
            };

            // Guardar el inventario actualizado
            fs.writeFile(inventoryFilePath, JSON.stringify(inventory, null, 2), (err) => {
                if (err) {
                    console.error('Error al guardar el archivo:', err);
                    return res.status(500).json({ error: 'No se pudo actualizar el producto.' });
                }

                // Responder con el producto actualizado
                res.json(inventory[index]);
            });
        } catch (parseError) {
            console.error('Error al procesar el archivo JSON:', parseError);
            res.status(500).json({ error: 'No se pudo procesar el inventario.' });
        }
    });
});




app.delete('/api/delete/:id', (req, res) => {
    const productId = req.params.id;
    const inventoryFilePath = path.join(__dirname, 'data', 'inventory.json');

    fs.readFile(inventoryFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            return res.status(500).json({ error: 'No se pudo cargar el inventario.' });
        }

        try {
            const inventory = JSON.parse(data); // Convertir el contenido del archivo a un objeto
            const productIndex = inventory.findIndex(product => product.id === productId);

            if (productIndex === -1) {
                return res.status(404).json({ error: 'Producto no encontrado.' });
            }

            // Eliminar el producto
            const deletedProduct = inventory.splice(productIndex, 1)[0];

            fs.writeFile(inventoryFilePath, JSON.stringify(inventory, null, 2), (err) => {
                if (err) {
                    console.error('Error al guardar el archivo:', err);
                    return res.status(500).json({ error: 'No se pudo actualizar el inventario.' });
                }

                res.status(200).json({ message: `Producto ${deletedProduct.name} eliminado correctamente.` });
            });
        } catch (parseError) {
            console.error('Error al procesar el archivo JSON:', parseError);
            res.status(500).json({ error: 'No se pudo procesar el inventario.' });
        }
    });
});

// Ruta para buscar productos por nombre o marca
app.get('/api/search', (req, res) => {
    const searchQuery = req.query.q?.toLowerCase(); // Obtener la consulta de búsqueda desde los parámetros
    const inventoryFilePath = path.join(__dirname, 'data', 'inventory.json');

    if (!searchQuery) {
        return res.status(400).json({ error: 'Se requiere un término de búsqueda.' });
    }

    fs.readFile(inventoryFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            return res.status(500).json({ error: 'No se pudo cargar el inventario.' });
        }

        try {
            const inventory = JSON.parse(data); // Convertir el contenido del archivo a un objeto
            // Filtrar productos que coincidan con la consulta (nombre o marca)
            const filteredProducts = inventory.filter(product => 
                product.name.toLowerCase().includes(searchQuery) || 
                product.brand.toLowerCase().includes(searchQuery)
            );

            res.json(filteredProducts); // Enviar los productos filtrados como respuesta
        } catch (parseError) {
            console.error('Error al procesar el archivo JSON:', parseError);
            res.status(500).json({ error: 'No se pudo procesar el inventario.' });
        }
    });
});


// Buscar facturas (por cédula o número de factura)
app.get('/api/invoices', (req, res) => {
    const { search } = req.query; // Parámetro de búsqueda (CC o número de factura)

    fs.readFile('./data/sales.json', 'utf8', (err, data) => {
        if (err) return res.status(500).json({ message: 'Error al leer las ventas' });

        const sales = data
            .split('\n')
            .filter(line => line.trim() !== '') // Filtrar líneas vacías
            .map(line => JSON.parse(line)); // Parsear cada línea como JSON

        // Filtrar las ventas por cédula (cc) o por índice (número de factura)
        const filteredSales = sales.filter((sale, index) =>
            (sale.cc && sale.cc.includes(search)) || (sale.index && sale.index.toString().includes(search))
        );

        res.json(filteredSales); // Devolver las facturas que coinciden con la búsqueda
    });
});

// Función para leer el archivo de proveedores
function readSuppliersFromFile() {
    if (!fs.existsSync(suppliersFilePath)) {
        return [];
    }
    const data = fs.readFileSync(suppliersFilePath, 'utf8');
    return JSON.parse(data);
}

// Función para escribir el archivo de proveedores
function writeSuppliersToFile(suppliers) {
    fs.writeFileSync(suppliersFilePath, JSON.stringify(suppliers, null, 2), 'utf8');
}

// Endpoint para obtener todos los proveedores
app.get('/api/suppliers', (req, res) => {
    const suppliers = readSuppliersFromFile();
    res.json(suppliers);
});

// Endpoint para agregar un proveedor
app.post('/api/suppliers', (req, res) => {
    const { name, address, phone, email, paymentTerms, status } = req.body;
    const newSupplier = { name, address, phone, email, paymentTerms, status };

    const suppliers = readSuppliersFromFile();
    suppliers.push(newSupplier);

    writeSuppliersToFile(suppliers);
    res.status(201).json(newSupplier);
});

// Endpoint para eliminar un proveedor
app.delete('/api/suppliers/:index', (req, res) => {
    const { index } = req.params;
    const suppliers = readSuppliersFromFile();

    if (suppliers[index]) {
        suppliers.splice(index, 1);
        writeSuppliersToFile(suppliers);
        res.status(200).json({ message: 'Proveedor eliminado correctamente' });
    } else {
        res.status(404).json({ message: 'Proveedor no encontrado' });
    }
});

// Ruta para obtener todos los empleados
app.get('/api/employees', (req, res) => {
    fs.readFile(employeesFilePath, 'utf-8', (err, data) => {
        if (err) return res.status(500).send('Error leyendo el archivo');
        const employees = JSON.parse(data);
        res.json(employees);
    });
});

// Ruta para agregar un empleado
app.post('/api/employees', (req, res) => {
    const newEmployee = req.body;

    fs.readFile(employeesFilePath, 'utf-8', (err, data) => {
        if (err) return res.status(500).send('Error leyendo el archivo');
        
        const employees = JSON.parse(data);
        // Asignamos un ID único al nuevo empleado
        newEmployee.id = employees.length > 0 ? employees[employees.length - 1].id + 1 : 1;
        employees.push(newEmployee);

        fs.writeFile(employeesFilePath, JSON.stringify(employees, null, 2), (err) => {
            if (err) return res.status(500).send('Error escribiendo el archivo');
            res.status(201).send('Empleado agregado');
        });
    });
});

// Ruta para actualizar el estado de pago de un empleado
app.put('/api/employees/:id', (req, res) => {
    const employeeId = parseInt(req.params.id);
    const newStatus = req.body.paymentStatus;

    fs.readFile(employeesFilePath, 'utf-8', (err, data) => {
        if (err) return res.status(500).send('Error leyendo el archivo');
        
        const employees = JSON.parse(data);
        const employee = employees.find(emp => emp.id === employeeId);

        if (!employee) return res.status(404).send('Empleado no encontrado');

        employee.paymentStatus = newStatus;
        
        // Si el estado es "pagado", actualizamos la fecha del pago
        if (newStatus === 'paid') {
            employee.paymentDate = new Date().toISOString(); // Establece la fecha de pago
        } else {
            employee.paymentDate = null; // Si no es pagado, eliminamos la fecha
        }

        fs.writeFile(employeesFilePath, JSON.stringify(employees, null, 2), (err) => {
            if (err) return res.status(500).send('Error escribiendo el archivo');
            res.send('Estado de pago actualizado');
        });
    });
});


// Ruta para eliminar un empleado
app.delete('/api/employees/:id', (req, res) => {
    const employeeId = parseInt(req.params.id);

    fs.readFile(employeesFilePath, 'utf-8', (err, data) => {
        if (err) return res.status(500).send('Error leyendo el archivo');
        
        let employees = JSON.parse(data);
        employees = employees.filter(emp => emp.id !== employeeId);

        fs.writeFile(employeesFilePath, JSON.stringify(employees, null, 2), (err) => {
            if (err) return res.status(500).send('Error escribiendo el archivo');
            res.send('Empleado eliminado');
        });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});