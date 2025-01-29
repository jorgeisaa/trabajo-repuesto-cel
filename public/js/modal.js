// Selección de elementos del DOM
const addSaleBtn = document.getElementById("add-sale-btn");
const modalOverlay = document.getElementById("modal-overlay");
const addSaleForm = document.getElementById("add-sale-form");
const cancelSaleBtn = document.getElementById("cancel-sale-btn");

const invoiceModal = document.getElementById("invoice-modal");
const printButton = document.getElementById("print-button");
const closeInvoiceBtn = invoiceModal?.querySelector("button");

// Función para mostrar o esconder el modal
function toggleModal(modal, overlay, isOpen) {
    const displayStyle = isOpen ? 'block' : 'none';
    modal.style.display = displayStyle;
    overlay.style.display = isOpen ? 'block' : 'none';
}

// Función para abrir el modal de registro de venta
function openAddSaleModal() {
    console.log("Abriendo modal de registrar venta");
    toggleModal(addSaleForm, modalOverlay, true);
}

// Función para cerrar el modal de registro de venta
function closeAddSaleModal() {
    console.log("Cerrando modal de registrar venta");
    toggleModal(addSaleForm, modalOverlay, false);
}

// Función para abrir el modal de factura
function openInvoiceModal() {
    console.log("Abriendo modal de factura");
    toggleModal(invoiceModal, modalOverlay, true);
    displayInvoiceDetails(); // Llamamos a la función para mostrar los detalles de la factura
}

// Función para cerrar el modal de factura
function closeInvoiceModal() {
    console.log("Cerrando modal de factura");
    toggleModal(invoiceModal, modalOverlay, false);
}

// Función para mostrar los detalles de la factura
function displayInvoiceDetails() {
    const invoiceDetails = document.getElementById("invoice-details");

    // Aquí puedes modificar para mostrar los datos reales de la factura
    const invoiceInfo = `
        <p><strong>Cliente:</strong> Juan Pérez</p>
        <p><strong>Fecha:</strong> 20/01/2025</p>
        <p><strong>Total:</strong> $250.00</p>
        <p><strong>Detalles:</strong></p>
        <ul>
            <li>Producto A - $100</li>
            <li>Producto B - $150</li>
        </ul>
    `;
    
    invoiceDetails.innerHTML = invoiceInfo;
}

// Función para imprimir la factura
function printInvoice() {
    console.log("Imprimiendo factura...");
    window.print();
}

// Eventos para abrir y cerrar el modal de registro de venta
addSaleBtn.addEventListener("click", () => {
    console.log("Botón 'Registrar Venta' clickeado");
    openAddSaleModal();
});

cancelSaleBtn.addEventListener("click", () => {
    console.log("Botón 'Cancelar' clickeado");
    closeAddSaleModal();
});

// Evento para cerrar el modal al hacer clic fuera del formulario
modalOverlay.addEventListener("click", (event) => {
    if (event.target === modalOverlay) {
        console.log("Clic en el fondo del modal");
        closeAddSaleModal();
        closeInvoiceModal();
    }
});

// Eventos para el modal de factura
if (printButton) {
    printButton.addEventListener("click", () => {
        console.log("Botón 'Imprimir' clickeado");
        printInvoice();
    });
}

if (closeInvoiceBtn) {
    closeInvoiceBtn.addEventListener("click", () => {
        console.log("Botón 'Cerrar' del modal de factura clickeado");
        closeInvoiceModal();
    });
}

// Función para obtener los datos de las ventas del servidor y mostrarlos en la tabla
function loadSales() {
    fetch('http://localhost:3000/api/sales')  // Reemplaza esta URL con la que estés usando
        .then(response => response.json())
        .then(sales => viewSales(sales))  // Llamar a la función para mostrar las ventas
        .catch(error => console.error('Error al cargar las ventas:', error));
}

// Función para mostrar las ventas en la tabla
function viewSales(sales) {
    const salesTableBody = document.getElementById('sales-table-body');
    salesTableBody.innerHTML = '';  // Limpiar la tabla antes de agregar nuevas filas

    if (sales.length === 0) {
        // Si no hay ventas, mostrar mensaje
        const emptyRow = document.createElement('tr');
        emptyRow.classList.add('empty');
        emptyRow.innerHTML = '<td colspan="6">No hay ventas para mostrar</td>';
        salesTableBody.appendChild(emptyRow);
    } else {
        sales.forEach(venta => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${venta.producto}</td>
                <td>${venta.cantidad}</td>
                <td>${venta.metodoPago}</td>
                <td>$${venta.precio.toFixed(2)}</td>
                <td>${new Date(venta.fecha).toLocaleString()}</td>
                <td><button onclick="viewDetails(${venta.id})">Ver Detalles</button></td>
            `;

            salesTableBody.appendChild(row);
        });
    }
}

// Función para ver los detalles de una venta (puedes agregar más detalles)
function viewDetails(ventaId) {
    console.log('Ver detalles de la venta con ID:', ventaId);
}

// Cargar las ventas al iniciar
loadSales();
