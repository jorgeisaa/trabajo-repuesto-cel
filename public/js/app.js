document.addEventListener("DOMContentLoaded", () => {
    // Definir los índices del carrusel
    let carouselIndex = 0;
    const carouselItems = document.querySelectorAll('.carousel-item');
    const totalItems = carouselItems.length;

    // Función para mover el carrusel
    function moveCarousel(direction) {
        carouselIndex += direction;
        if (carouselIndex < 0) {
            carouselIndex = totalItems - 1;
        } else if (carouselIndex >= totalItems) {
            carouselIndex = 0;
        }
        updateCarousel();
    }

    // Actualizar el carrusel
    function updateCarousel() {
        const offset = -carouselIndex * 100;
        document.querySelector('.carousel-inner').style.transform = `translateX(${offset}%)`;
    }

    // Llamada para actualizar las estadísticas del dashboard
    function updateDashboard() {
        fetch('/api/stats')  // Asume que tienes una API para obtener las estadísticas
            .then(response => response.json())
            .then(data => {
                document.getElementById('total-sales').textContent = data.totalSales;
                document.getElementById('total-transactions').textContent = data.totalTransactions;
                document.getElementById('net-balance').textContent = data.netBalance;
            })
            .catch(err => console.error('Error al cargar las estadísticas', err));
    }

    // Función para cargar los gráficos utilizando Chart.js
    function loadCharts() {
        fetch('/api/graphs')  // Asume que tienes una API para obtener los datos de los gráficos
            .then(response => response.json())
            .then(data => {
                // Gráfico de Ventas
                const salesCtx = document.getElementById('salesChart').getContext('2d');
                new Chart(salesCtx, {
                    type: 'bar',
                    data: {
                        labels: data.sales.labels,
                        datasets: [{
                            label: 'Ventas',
                            data: data.sales.data,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        }]
                    }
                });

                // Gráfico de Transacciones
                const transactionsCtx = document.getElementById('transactionsChart').getContext('2d');
                new Chart(transactionsCtx, {
                    type: 'line',
                    data: {
                        labels: data.transactions.labels,
                        datasets: [{
                            label: 'Transacciones',
                            data: data.transactions.data,
                            fill: false,
                            borderColor: 'rgba(153, 102, 255, 1)',
                            tension: 0.1
                        }]
                    }
                });

                // Gráfico de Categorías
                const categoriesCtx = document.getElementById('categoriesChart').getContext('2d');
                new Chart(categoriesCtx, {
                    type: 'pie',
                    data: {
                        labels: data.categories.labels,
                        datasets: [{
                            label: 'Categorías de Productos',
                            data: data.categories.data,
                            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                            hoverOffset: 4
                        }]
                    }
                });

                // Gráfico de Balance Neto
                const balanceCtx = document.getElementById('balanceChart').getContext('2d');
                new Chart(balanceCtx, {
                    type: 'doughnut',
                    data: {
                        labels: data.balance.labels,
                        datasets: [{
                            label: 'Balance Neto',
                            data: data.balance.data,
                            backgroundColor: ['#FF6347', '#4CAF50'],
                            hoverOffset: 4
                        }]
                    }
                });
            })
            .catch(err => console.error('Error al cargar los gráficos', err));
    }

    // Llamar a las funciones al cargar la página
    updateDashboard();
    loadCharts();

    // Añadir eventos para los botones del carrusel
    document.querySelector('.carousel-controls button:nth-child(1)').addEventListener('click', () => moveCarousel(-1));
    document.querySelector('.carousel-controls button:nth-child(2)').addEventListener('click', () => moveCarousel(1));
});
