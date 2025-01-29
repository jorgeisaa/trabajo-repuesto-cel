const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();
const inventoryFilePath = path.join(__dirname, '../data/inventory.json');
const inventoryRoutes = require('./routes/inventoryRoutes');

// Utilidades para manejar el inventario
async function readInventory() {
    try {
        const data = await fs.readFile(inventoryFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') return [];
        throw error;
    }
}

async function writeInventory(data) {
    await fs.writeFile(inventoryFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Endpoints

// Obtener todo el inventario
router.get('/', async (req, res) => {
    try {
        const inventory = await readInventory();
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer el inventario.' });
    }
});

// Buscar productos por nombre o marca
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        const inventory = await readInventory();
        const results = inventory.filter(item =>
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.brand.toLowerCase().includes(query.toLowerCase())
        );
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Error al buscar productos.' });
    }
});

// Filtrar productos por fecha
router.get('/filter', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const inventory = await readInventory();
        const filtered = inventory.filter(item => {
            const itemDate = new Date(item.date);
            return (!startDate || new Date(startDate) <= itemDate) &&
                   (!endDate || new Date(endDate) >= itemDate);
        });
        res.json(filtered);
    } catch (error) {
        res.status(500).json({ error: 'Error al filtrar productos.' });
    }
});

// Agregar un nuevo producto
router.post('/', async (req, res) => {
    try {
        const { name, brand, image, quantity, price, date } = req.body;
        if (!name || !brand || !quantity || !price || !date) {
            return res.status(400).json({ error: 'Faltan datos obligatorios.' });
        }

        const inventory = await readInventory();
        const newProduct = { id: Date.now().toString(), name, brand, image, quantity, price, date };
        inventory.push(newProduct);
        await writeInventory(inventory);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar el producto.' });
    }
});

// Editar un producto existente
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedFields = req.body;
        const inventory = await readInventory();
        const productIndex = inventory.findIndex(item => item.id === id);

        if (productIndex === -1) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        inventory[productIndex] = { ...inventory[productIndex], ...updatedFields };
        await writeInventory(inventory);
        res.json(inventory[productIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Error al editar el producto.' });
    }
});

// Eliminar un producto
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const inventory = await readInventory();
        const newInventory = inventory.filter(item => item.id !== id);

        if (newInventory.length === inventory.length) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        await writeInventory(newInventory);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el producto.' });
    }
});

// Exportar inventario a CSV
router.get('/export', async (req, res) => {
    try {
        const inventory = await readInventory();
        const csv = [
            ['ID', 'Nombre', 'Marca', 'Cantidad', 'Precio', 'Fecha'].join(','),
            ...inventory.map(item =>
                [item.id, item.name, item.brand, item.quantity, item.price, item.date].join(',')
            )
        ].join('\\n');
        res.header('Content-Type', 'text/csv');
        res.attachment('inventory.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ error: 'Error al exportar el inventario.' });
    }
});

module.exports = router;
