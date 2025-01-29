let suppliers = [];

// Función para cargar los proveedores desde el servidor
function loadSuppliers() {
    fetch('http://localhost:3000/api/suppliers')
        .then(response => response.json())
        .then(data => {
            suppliers = data;
            updateSuppliersTable();
        })
        .catch(error => console.error('Error al cargar proveedores:', error));
}

// Función para agregar un proveedor al servidor
function addSupplier(event) {
    event.preventDefault();

    const name = document.getElementById('supplier-name').value;
    const address = document.getElementById('supplier-address').value;
    const phone = document.getElementById('supplier-phone').value;
    const email = document.getElementById('supplier-email').value;
    const paymentTerms = document.getElementById('supplier-payment-terms').value;
    const status = document.getElementById('supplier-status').value;

    const newSupplier = { name, address, phone, email, paymentTerms, status };

    fetch('http://localhost:3000/api/suppliers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSupplier)
    })
        .then(response => response.json())
        .then(data => {
            suppliers.push(data); // Agregar el nuevo proveedor a la lista local
            updateSuppliersTable();
            closeAddSupplierForm(); // Cerrar el modal
        })
        .catch(error => console.error('Error al agregar proveedor:', error));
}

// Función para eliminar un proveedor
function deleteSupplier(index) {
    fetch(`http://localhost:3000/api/suppliers/${index}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(() => {
            suppliers.splice(index, 1); // Eliminar el proveedor de la lista local
            updateSuppliersTable();
        })
        .catch(error => console.error('Error al eliminar proveedor:', error));
}

// Función para actualizar la tabla de proveedores
function updateSuppliersTable() {
    const suppliersTableBody = document.querySelector('#suppliers-table tbody');
    suppliersTableBody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevas filas

    suppliers.forEach((supplier, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${supplier.name}</td>
            <td>${supplier.address}</td>
            <td>${supplier.phone}</td>
            <td>${supplier.email}</td>
            <td>${supplier.paymentTerms}</td>
            <td>${supplier.status}</td>
            <td>
                <button onclick="deleteSupplier(${index})">Eliminar</button>
            </td>
        `;

        suppliersTableBody.appendChild(row);
    });
}

// Función para abrir y cerrar el formulario
function openAddSupplierForm() {
    document.getElementById('add-supplier-form').classList.remove('hidden');
    document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeAddSupplierForm() {
    document.getElementById('add-supplier-form').classList.add('hidden');
    document.getElementById('modal-overlay').classList.add('hidden');
}

// Cargar proveedores al iniciar
window.onload = loadSuppliers;

function obtenerYMostrarProveedores() {
    fetch('http://localhost:3000/api/suppliers')
        .then(response => response.json())
        .then(data => {
            const suppliersTableBody = document.querySelector('#suppliers-table tbody');
            suppliersTableBody.innerHTML = ''; // Limpiar contenido anterior

            // Iterar sobre los datos obtenidos y crear filas de tabla
            data.forEach((supplier, index) => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${supplier.name}</td>
                    <td>${supplier.address}</td>
                    <td>${supplier.phone}</td>
                    <td>${supplier.email}</td>
                    <td>${supplier.paymentTerms}</td>
                    <td>${supplier.status}</td>
                `;

                suppliersTableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error al obtener y mostrar proveedores:', error));
}

// Llamar a la función para mostrar proveedores al cargar la página
window.onload = obtenerYMostrarProveedores;
