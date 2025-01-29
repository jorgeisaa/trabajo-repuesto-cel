document.addEventListener('DOMContentLoaded', function () {
    const productoInput = document.getElementById('producto');
    const cantidadInput = document.getElementById('sale-quantity');
    const metodoPagoInput = document.getElementById('sale-payment-method');
    const ccInput = document.getElementById('sale-cc');
    const submitButton = document.querySelector('button[type="submit"]');

    if (!productoInput || !cantidadInput || !metodoPagoInput || !ccInput || !submitButton) {
        console.error("Faltan elementos en el HTML");
        return;
    }

    const productos = [];
    let selectedProductPrice = 0;

    // Obtener productos del inventario
fetch('http://localhost:3000/api/products')
.then(response => response.json())
.then(data => {
    if (data && Array.isArray(data)) {
        productos.push(...data);
        initAutocomplete(productos);
    } else {
        console.error("No se recibieron productos válidos");
    }
})
.catch(err => console.error("Error al cargar el inventario:", err));

function initAutocomplete(productos) {
const productNames = productos.map(product => product.name);
const suggestionsContainer = document.getElementById('suggestions');

productoInput.addEventListener('input', function () {
    const inputValue = productoInput.value.toLowerCase();
    const suggestions = productNames.filter(product =>
        product.toLowerCase().includes(inputValue)
    );

    showSuggestions(suggestions, suggestionsContainer);
});

function showSuggestions(suggestions, container) {
    container.innerHTML = '';
    if (suggestions.length === 0) return;

    suggestions.forEach(suggestion => {
        const suggestionItem = document.createElement('li');
        suggestionItem.textContent = suggestion;

        suggestionItem.addEventListener('click', () => {
            productoInput.value = suggestion;
            container.innerHTML = '';

            const selectedProduct = productos.find(product => product.name === suggestion);
            if (selectedProduct) {
                selectedProductPrice = selectedProduct.price;
                console.log("Precio del producto seleccionado:", selectedProductPrice);
            }
        });

        container.appendChild(suggestionItem);
    });
}
}


 function validarVenta() {
    const producto = productoInput.value.trim();
    const cantidad = parseInt(cantidadInput.value, 10);
    const metodoPago = metodoPagoInput.value.trim();
    const cc = ccInput.value.trim();

    // Si no hay productos en el arreglo, validar todos los campos
    if (productos.length === 0) {
        if (!producto || !cantidad || isNaN(cantidad) || cantidad <= 0 || !metodoPago || !cc) {
            mostrarNotificacion("Por favor, complete todos los campos correctamente.", "error");
            return false;
        }
    } else {
        // Si hay productos en el arreglo, solo validar CC y método de pago
        if (!metodoPago || !cc) {
            mostrarNotificacion("Por favor, complete el método de pago y el CC.", "error");
            return false;
        }
    }

    return true;
}


    function mostrarNotificacion(mensaje, tipo) {
        const notificacion = document.createElement('div');
        notificacion.textContent = mensaje;
        notificacion.className = `notificacion ${tipo}`;
        document.body.appendChild(notificacion);

        setTimeout(() => {
            notificacion.remove();
        }, 3000);
    }

    function agregarVentaAlDOM(venta) {
        const ventasList = document.getElementById('ventas-list');
        const ventaItem = document.createElement('li');
        ventaItem.textContent = `Producto: ${venta.productName}, Cantidad: ${venta.quantity}, Precio: ${venta.precio}, Método de pago: ${venta.paymentMethod}, CC: ${venta.cc}`;
        ventasList.appendChild(ventaItem);
    }

    submitButton.addEventListener('click', function () {
        if (!validarVenta()) return;

        const venta = {
            cc: ccInput.value,
            productName: productoInput.value,
            quantity: parseInt(cantidadInput.value, 10),
            paymentMethod: metodoPagoInput.value,
            precio: selectedProductPrice,
        };

        fetch('http://localhost:3000/api/sales', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(venta),
        })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Venta registrada correctamente') {
                    mostrarNotificacion('Venta registrada exitosamente', 'success');
                    agregarVentaAlDOM(data.sale);
                } else {
                    mostrarNotificacion('Error al registrar la venta', 'error');
                    console.error('Error:', data.message);
                }
            })
            .catch(err => {
                console.error('Error en la solicitud:', err);
                mostrarNotificacion('Ocurrió un error al registrar la venta', 'error');
            });
    });
});
