let inventoryChartInstance; // Variable global para almacenar la instancia del gráfico

// Función para obtener los datos de la API
async function fetchData(endpoint) {
    const response = await fetch(`http://localhost:3000${endpoint}`);
    return response.json();
}

// Función para actualizar el gráfico de inventario
function updateChart(chartData) {
    // Si ya existe un gráfico, destrúyelo antes de crear uno nuevo
    if (inventoryChartInstance) {
        inventoryChartInstance.destroy();
    }

    // Crear el gráfico con los nuevos datos
    inventoryChartInstance = new Chart(document.getElementById('inventoryChart'), {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Cantidad de Productos',
                data: chartData.data,
                backgroundColor: chartData.backgroundColors,
                borderColor: chartData.borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return `Cantidad: ${tooltipItem.raw}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Productos'
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Cantidad'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

// Función para mostrar los productos por página
function displayProductsByPage(page) {
    fetchData(`/api/products`).then(data => {
        // Ordenar los productos por cantidad
        const sortedData = data.sort((a, b) => b.quantity - a.quantity);

        // Calcular el inicio y el fin para la paginación (15 productos por página)
        const startIndex = (page - 1) * 15;
        const endIndex = page * 15;

        // Filtrar los productos para mostrar solo los 15 correspondientes
        const pagedProducts = sortedData.slice(startIndex, endIndex);

        const productNames = pagedProducts.map(item => item.name);
        const quantities = pagedProducts.map(item => item.quantity);

        // Generar colores dinámicos para los gráficos
        const backgroundColors = quantities.map(() => 
            `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`
        );
        const borderColors = backgroundColors.map(color => color.replace('0.6', '1'));

        // Actualizar el gráfico con los nuevos datos
        updateChart({
            labels: productNames,
            data: quantities,
            backgroundColors: backgroundColors,
            borderColors: borderColors
        });
    });
}



// Función para mostrar las gráficas de ventas, proveedores y empleados
function displayOtherCharts() {
    // Gráfico de Ventas
    fetchData('/api/sales').then(data => {
        const dates = data.map(sale => new Date(sale.fecha).toLocaleDateString());
        const uniqueDates = [...new Set(dates)];
        const salesCounts = uniqueDates.map(date => dates.filter(d => d === date).length);

        new Chart(document.getElementById('salesChart'), {
            type: 'line',
            data: {
                labels: uniqueDates,
                datasets: [{
                    label: 'Ventas por Fecha',
                    data: salesCounts,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 2,
                    tension: 0.4
                }]
            }
        });
    });

    // Gráfico de Proveedores
    fetchData('/api/suppliers').then(data => {
        const statuses = [...new Set(data.map(sup => sup.status))];
        const counts = statuses.map(status => data.filter(sup => sup.status === status).length);

        new Chart(document.getElementById('suppliersChart'), {
            type: 'pie',
            data: {
                labels: statuses,
                datasets: [{
                    label: 'Proveedores por Estado',
                    data: counts,
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                    hoverOffset: 4
                }]
            }
        });
    });

    // Gráfico de Empleados por Oficio
    fetchData('/api/employees').then(data => {
        const job = [...new Set(data.map(emp => emp.job))];
        const counts = job.map(job => data.filter(emp => emp.job === job).length);

        new Chart(document.getElementById('employeesChart'), {
            type: 'doughnut',
            data: {
                labels: job,
                datasets: [{
                    label: 'Empleados por Oficio',
                    data: counts,
                    backgroundColor: ['#4BC0C0', '#FF9F40', '#9966FF', '#FF6384'],
                    hoverOffset: 4
                }]
            }
        });
    });
}

// Función para manejar la paginación de productos
let currentPage = 1;
document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayProductsByPage(currentPage);
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    currentPage++;
    displayProductsByPage(currentPage);
});

// Inicializar la primera página de productos y otras gráficas
displayProductsByPage(currentPage);
displayOtherCharts();
