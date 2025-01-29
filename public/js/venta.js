document.addEventListener('DOMContentLoaded', function () { 
    
    const totalIncomeElement = document.getElementById('total-income');
    const totalEfectivoElement = document.getElementById('total-efectivo');
    const totalTarjetaElement = document.getElementById('total-tarjeta');
    const totalTransferenciaElement = document.getElementById('total-transferencia');
    const salesListElement = document.getElementById('sales-list');
    
    // Función para cargar las ventas desde el archivo JSON
    function loadSales() {
        return fetch('http://localhost:3000/api/sales')
            .then(response => response.json())
            .catch(err => {
                console.error("Error al cargar las ventas:", err);
                return [];
            });
    }

    // Función para calcular el total de ingresos y mostrarlo
    function updateIncomeSummary(ventas) {
        let totalIncome = 0;
        let totalEfectivo = 0;
        let totalTarjeta = 0;
        let totalTransferencia = 0;

        ventas.forEach(venta => {
            const totalVenta = venta.precio * venta.quantity; // Calcular el total de cada venta
            totalIncome += totalVenta;

            if (venta.paymentMethod === 'Efectivo') {
                totalEfectivo += totalVenta;
            } else if (venta.paymentMethod === 'Tarjeta') {
                totalTarjeta += totalVenta;
            } else if (venta.paymentMethod === 'Transferencia') {
                totalTransferencia += totalVenta;
            }
        });

        // Actualizar los elementos en el DOM
        totalIncomeElement.textContent = `Total de Ingresos: $${totalIncome.toFixed(2)}`;
        totalEfectivoElement.textContent = `Total en Efectivo: $${totalEfectivo.toFixed(2)}`;
        totalTarjetaElement.textContent = `Total en Tarjeta: $${totalTarjeta.toFixed(2)}`;
        totalTransferenciaElement.textContent = `Total en Transferencia: $${totalTransferencia.toFixed(2)}`;
    }

    // Función para filtrar ventas por fecha
    function viewSalesByDate() {
        const dateInput = document.getElementById('date-picker').value;
        if (!dateInput) return;

        const selectedDate = new Date(dateInput).toISOString().split('T')[0]; // Formatear la fecha a 'YYYY-MM-DD'

        loadSales().then(ventas => {
            const filteredSales = ventas.filter(venta => venta.fecha.startsWith(selectedDate));
            viewSales(filteredSales);
            updateIncomeSummary(filteredSales);
            // Mostrar el div solo cuando haya ventas filtradas
            document.getElementById('sales-filter').style.display = filteredSales.length > 0 ? 'block' : 'none';
        });
    }

    // Función para filtrar ventas por mes
    function viewSalesByMonth() {
        const monthInput = document.getElementById('month-picker').value;
        if (!monthInput) return;

        const selectedMonth = monthInput; // El formato es 'YYYY-MM'

        loadSales().then(ventas => {
            const filteredSales = ventas.filter(venta => venta.fecha.startsWith(selectedMonth));
            viewSales(filteredSales);
            updateIncomeSummary(filteredSales);
            // Mostrar el div solo cuando haya ventas filtradas
            document.getElementById('sales-filter').style.display = filteredSales.length > 0 ? 'block' : 'none';
        });
    }

    // Función para filtrar ventas por año
    function viewSalesByYear() {
        const yearInput = document.getElementById('year-picker').value;
        if (!yearInput) return;

        const selectedYear = yearInput; // El formato es 'YYYY'

        loadSales().then(ventas => {
            const filteredSales = ventas.filter(venta => venta.fecha.startsWith(selectedYear));
            viewSales(filteredSales);
            updateIncomeSummary(filteredSales);
            // Mostrar el div solo cuando haya ventas filtradas
            document.getElementById('sales-filter').style.display = filteredSales.length > 0 ? 'block' : 'none';
        });
    }

    // Función para mostrar las ventas en la tabla
    function viewSales(filteredSales) {
        const salesTable = document.getElementById('salesTable');
        salesTable.innerHTML = ''; // Limpiar la tabla antes de agregar las nuevas ventas

        // Crear la cabecera de la tabla solo una vez
        if (salesTable.rows.length === 0) {
            const header = salesTable.createTHead();
            const headerRow = header.insertRow();
            headerRow.innerHTML = `
                <th>Cédula</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Método de Pago</th>
                <th>Precio</th>
                <th>Fecha</th>
                <th>Acciones</th>
            `;
        }

        // Ordenar las ventas de más reciente a más antigua
        filteredSales.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        filteredSales.forEach((venta, index) => {
            const row = salesTable.insertRow();
            row.innerHTML = `
                <td>${venta.cc}</td>
                <td>${venta.productName}</td>
                <td>${venta.quantity}</td>
                <td>${venta.paymentMethod}</td>
                <td>$${(venta.precio * venta.quantity).toFixed(2)}</td>
                <td>${new Date(venta.fecha).toLocaleString()}</td>
                <td><button class="delete-btn" data-index="${index}">Eliminar</button></td>
            `;
        });

        // Asignar el evento de eliminación a cada botón
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const index = event.target.getAttribute('data-index');
                deleteSale(index);
            });
        });
    }

    // Función para eliminar una venta
    function deleteSale(index) {
        fetch(`/api/sales/${index}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Venta eliminada correctamente') {
                alert('Venta eliminada correctamente');
                // Recargar las ventas para mostrar los cambios
                loadSales();
            } else {
                alert('Error al eliminar la venta');
            }
        })
        .catch(error => {
            alert('Error al eliminar la venta');
        });
    }

    // Inicializar el resumen de ingresos con todas las ventas
    loadSales().then(ventas => {
        updateIncomeSummary(ventas);
        viewSales(ventas);
    });

    // Agregar los filtros para las ventas
    document.getElementById('date-picker').addEventListener('change', viewSalesByDate);
    document.getElementById('month-picker').addEventListener('change', viewSalesByMonth);
    document.getElementById('year-picker').addEventListener('change', viewSalesByYear);
});
