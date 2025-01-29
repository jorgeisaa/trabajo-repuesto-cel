// Variables globales
let ventas = JSON.parse(localStorage.getItem('ventas')) || [];
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let totalEfectivo = 0;
let totalTarjeta = 0;
let totalTransferencia = 0;

async function registerSale(event) {
    event.preventDefault();

    const cc = document.getElementById('sale-cc').value.trim();
    const paymentMethod = document.getElementById('sale-payment-method').value;
    const selectedProducts = getSelectedProducts(); // Función que recoge los productos seleccionados
    let totalSale = 0;

    if (!cc || !paymentMethod) {
        alert("Por favor complete los campos de CC y Forma de Pago.");
        return;
    }

    if (selectedProducts.length === 0) {
        const productName = document.getElementById('producto').value.trim();
        const quantity = parseInt(document.getElementById('sale-quantity').value);

        if (!productName || !quantity || isNaN(quantity) || quantity <= 0) {
            alert("Por favor complete todos los campos.");
            return;
        }

        const inventoryProduct = inventory.find(p => p.name === productName);
        if (!inventoryProduct || parseInt(inventoryProduct.quantity) < quantity) { // Convertir la cantidad a número
            alert(`No hay suficiente stock de ${productName}.`);
            return;
        }

        selectedProducts.push({
            name: productName,
            quantity: quantity,
            price: inventoryProduct.price,
        });

        inventoryProduct.quantity = parseInt(inventoryProduct.quantity) - quantity; // Convertir la cantidad a número
        totalSale = inventoryProduct.price * quantity;
    } else {
        selectedProducts.forEach(product => {
            totalSale += product.price * product.quantity;

            const inventoryProduct = inventory.find(p => p.name === product.name);
            if (inventoryProduct) {
                inventoryProduct.quantity = parseInt(inventoryProduct.quantity) - product.quantity; // Convertir la cantidad a número
            }
        });
    }

    localStorage.setItem('inventory', JSON.stringify(inventory));

    const sale = {
        cc,
        products: selectedProducts,
        paymentMethod,
        total: totalSale,
        date: new Date().toLocaleString(),
    };

    ventas.push(sale);
    localStorage.setItem('ventas', JSON.stringify(ventas));
    updatePaymentSummary(paymentMethod, totalSale);

    alert('Venta registrada exitosamente.');
    document.getElementById('sale-form').reset();
    document.getElementById('selected-products').innerHTML = '';
    
    // Actualizar la lista de ventas
    updateSalesList();
}

// Función para obtener los productos seleccionados para la venta
function getSelectedProducts() {
    const selectedProducts = [];
    const productElements = document.querySelectorAll('.product-item');
    productElements.forEach(productElement => {
        const name = productElement.querySelector('.product-name').textContent;
        const quantity = parseInt(productElement.querySelector('.product-quantity').value);
        const price = parseFloat(productElement.querySelector('.product-price').textContent);
        if (name && quantity > 0) {
            selectedProducts.push({ name, quantity, price });
        }
    });
    return selectedProducts;
}

// Función para actualizar el resumen de pagos
function updatePaymentSummary(paymentMethod, totalSale) {
    if (paymentMethod === 'Efectivo') {
        totalEfectivo += totalSale;
        document.getElementById('total-efectivo').textContent = `Total en Efectivo: $${totalEfectivo.toFixed(2)}`;
    } else if (paymentMethod === 'Tarjeta') {
        totalTarjeta += totalSale;
        document.getElementById('total-tarjeta').textContent = `Total en Tarjeta: $${totalTarjeta.toFixed(2)}`;
    } else if (paymentMethod === 'Transferencia') {
        totalTransferencia += totalSale;
        document.getElementById('total-transferencia').textContent = `Total en Transferencia: $${totalTransferencia.toFixed(2)}`;
    }
    document.getElementById('total-income').textContent = `Total de Ingresos: $${(totalEfectivo + totalTarjeta + totalTransferencia).toFixed(2)}`;
}

// Función para mostrar las ventas filtradas
function displaySales(sales) {
    const salesList = document.getElementById('sales-list');
    salesList.innerHTML = ''; // Limpia el contenido previo

    if (sales.length === 0) {
        salesList.innerHTML = '<p>No se encontraron ventas.</p>';
        return;
    }

    sales.forEach(sale => {
        const saleItem = document.createElement('div');
        saleItem.classList.add('sale-item');
        saleItem.innerHTML = `
            <p>Cédula: ${sale.cc}</p>
            <p>Productos:</p>
            <ul>
                ${sale.products.map(product => `
                    <li>${product.name} - Cantidad: ${product.quantity} - Precio: $${(product.price * product.quantity).toFixed(2)}</li>
                `).join('')}
            </ul>
            <p>Forma de Pago: ${sale.paymentMethod}</p>
            <p>Total Venta: $${sale.total.toFixed(2)}</p>
        `;
        salesList.appendChild(saleItem);
    });
}

// Función para mostrar las ventas registradas
function updateSalesList() {
    displaySales(ventas);
}

// Evento al enviar el formulario de venta
document.getElementById('sale-form').addEventListener('submit', registerSale);

// Evento para el botón de agregar producto
document.getElementById('add-product-btn').addEventListener('click', () => {
    const productName = document.getElementById('producto').value;
    const product = inventory.find(p => p.name === productName);

    if (product) {
        const productElement = document.createElement('div');
        productElement.classList.add('product-item');
        productElement.innerHTML = `
            <span class="product-name">${product.name}</span>
            <input type="number" class="product-quantity" min="1" max="${product.quantity}" value="1">
            <span class="product-price">${product.price}</span>
        `;
        document.getElementById('selected-products').appendChild(productElement);
    }
});

// Evento para resetear las ventas
document.getElementById('reset-button').addEventListener('click', () => {
    localStorage.removeItem('ventas');
    ventas = [];
    totalEfectivo = totalTarjeta = totalTransferencia = 0;
    updatePaymentSummary('Efectivo', 0);
    updatePaymentSummary('Tarjeta', 0);
    updatePaymentSummary('Transferencia', 0);
    document.getElementById('sales-list').innerHTML = '';
    alert('Ventas reseteadas.');
});
