document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('product-list');
    const pagination = document.getElementById('pagination');
    const productsPerPage = 4;
    let currentPage = 1;
    let products = [];

 
    
    // Función para obtener los productos desde la API
    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            products = await response.json();
            displayProducts();
            setupPagination();
        } catch (error) {
            console.error('Error al obtener los productos:', error);
        }
    };


    
    // Función para mostrar los productos en el HTML
    const displayProducts = (productsToDisplay = products) => {
        productList.innerHTML = '';
        const start = (currentPage - 1) * productsPerPage;
        const end = start + productsPerPage;
        const paginatedProducts = productsToDisplay.slice(start, end);
    
        paginatedProducts.forEach(product => {
            const productElement = document.createElement('section');
            productElement.classList.add('product');
            productElement.innerHTML = `
                <div class="product__image">
                    <img src="${product.image}" alt="Imagen del producto">
                </div>
                <div class="product__info">
                    <h2>${product.name}</h2>
                    <p>${product.brand}</p>
                    <div class="formfield">
                        <label for="cantidad-${product.id}" class="formfield__label">Cantidad</label>
                        <input id="cantidad-${product.id}" class="formfield__input" type="number" min="1" value="1">
                    </div>
                    <div class="counter__inner">
                        <button class="counter__button" aria-label="Disminuir cantidad">-</button>
                        <span class="counter__value">1</span>
                        <button class="counter__button" aria-label="Aumentar cantidad">+</button>
                    </div>
                </div>
                <div class="product__summary">
                    <div class="product__total">
                        <p>Total: $<span class="total-price">${product.price}</span></p>
                    </div>
                    <button class="add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">Agregar al carrito</button>
                </div>
            `;
            productList.appendChild(productElement);
    
            // Código para manejar la cantidad y añadir al carrito
            const decrementButton = productElement.querySelector('.counter__button:first-child');
            const incrementButton = productElement.querySelector('.counter__button:last-child');
            const counterValue = productElement.querySelector('.counter__value');
            const quantityInput = productElement.querySelector(`#cantidad-${product.id}`);
            const totalPriceElement = productElement.querySelector('.total-price');
    
            const updateTotalPrice = () => {
                const quantity = parseInt(counterValue.textContent, 10);
                const totalPrice = quantity * product.price;
                totalPriceElement.textContent = totalPrice.toFixed(2); // Mostrar el total con 2 decimales
            };
    
            decrementButton.addEventListener('click', () => {
                let value = parseInt(counterValue.textContent, 10);
                if (value > 1) {
                    value -= 1;
                    counterValue.textContent = value;
                    quantityInput.value = value;
                    updateTotalPrice();
                }
            });
    
            incrementButton.addEventListener('click', () => {
                let value = parseInt(counterValue.textContent, 10);
                value += 1;
                counterValue.textContent = value;
                quantityInput.value = value;
                updateTotalPrice();
            });
    
            // Agregar al carrito
            const addToCartButton = productElement.querySelector('.add-to-cart');
            addToCartButton.addEventListener('click', () => {
                const productId = addToCartButton.getAttribute('data-id');
                const productName = addToCartButton.getAttribute('data-name');
                const productPrice = parseFloat(addToCartButton.getAttribute('data-price'));
                const quantity = parseInt(quantityInput.value);
    
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const existingProduct = cart.find(item => item.id === productId);
    
                if (existingProduct) {
                    existingProduct.quantity += quantity;
                } else {
                    cart.push({ id: productId, name: productName, price: productPrice, quantity });
                }
    
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartButton();
            });
        });
    };
      

   // Función para configurar la paginación
   const setupPagination = (productsToDisplay = products) => {
    pagination.innerHTML = ''; // Limpiar paginación existente
    const pageCount = Math.ceil(productsToDisplay.length / productsPerPage); // Número total de páginas
    const visiblePages = 10; // Número máximo de botones visibles
    let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2)); // Calcular la página de inicio
    let endPage = Math.min(pageCount, startPage + visiblePages - 1); // Calcular la página final visible

    // Asegurarse de que haya al menos 10 botones visibles
    if (endPage - startPage < visiblePages - 1) {
        startPage = Math.max(1, endPage - visiblePages + 1);
    }

    // Botón de "Anterior"
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Anterior';
        prevButton.classList.add('pagination__button');
        prevButton.addEventListener('click', () => {
            currentPage--;
            displayProducts(productsToDisplay);
            setupPagination(productsToDisplay);
        });
        pagination.appendChild(prevButton);
    }

    // Botones de las páginas
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.add('pagination__button');
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        pageButton.addEventListener('click', () => {
            currentPage = i;
            displayProducts(productsToDisplay);
            setupPagination(productsToDisplay);
        });
        pagination.appendChild(pageButton);
    }

    // Botón de "Siguiente"
    if (currentPage < pageCount) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Siguiente';
        nextButton.classList.add('pagination__button');
        nextButton.addEventListener('click', () => {
            currentPage++;
            displayProducts(productsToDisplay);
            setupPagination(productsToDisplay);
        });
        pagination.appendChild(nextButton);
    }
};

    // Función para actualizar el botón del carrito
    const updateCartButton = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartButton = document.getElementById('view-cart');
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        cartButton.textContent = `Ver carrito (${totalItems})`;
    };

    // Función para mostrar el carrito
    document.getElementById('view-cart').addEventListener('click', () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartModal = document.getElementById('cart-modal');
        const cartItemsList = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');

        cartItemsList.innerHTML = ''; // Limpiar lista de productos del carrito
        let total = 0;
        cart.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.name} - $${item.price} x ${item.quantity}`;
            
            // Botones de eliminar y actualizar cantidades
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Eliminar';
            removeButton.classList.add('remove-item');
            removeButton.addEventListener('click', () => {
                removeFromCart(item.id);
            });

            const updateQuantityDiv = document.createElement('div');
            const decrementButton = document.createElement('button');
            decrementButton.textContent = '-';
            const incrementButton = document.createElement('button');
            incrementButton.textContent = '+';
            updateQuantityDiv.appendChild(decrementButton);
            updateQuantityDiv.appendChild(incrementButton);

            decrementButton.addEventListener('click', () => {
                updateQuantity(item.id, -1);
            });

            incrementButton.addEventListener('click', () => {
                updateQuantity(item.id, 1);
            });

            li.appendChild(removeButton);
            li.appendChild(updateQuantityDiv);
            cartItemsList.appendChild(li);

            total += item.price * item.quantity;
        });

        cartTotal.textContent = `Total: $${total.toFixed(2)}`;
        cartModal.style.display = 'block';
    });

    // Función para eliminar un producto del carrito
    const removeFromCart = (productId) => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartButton();
        document.getElementById('view-cart').click(); // Actualiza el carrito visualmente
    };

    // Función para actualizar la cantidad de un producto en el carrito
    const updateQuantity = (productId, change) => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const product = cart.find(item => item.id === productId);
        if (product) {
            product.quantity += change;
            if (product.quantity <= 0) {
                removeFromCart(productId);
            } else {
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartButton();
                document.getElementById('view-cart').click(); // Actualiza el carrito visualmente
            }
        }
    };

    // Cerrar el modal del carrito
    document.getElementById('close-cart').addEventListener('click', () => {
        document.getElementById('cart-modal').style.display = 'none';
    });

    // Llamar a la función para obtener los productos al cargar la página
    fetchProducts();
});

const searchProducts = () => {
    const searchQuery = document.getElementById('search-bar').value.toLowerCase();
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery) || 
        product.brand.toLowerCase().includes(searchQuery)
    );

    // Actualiza la lista de productos con los resultados filtrados
    currentPage = 1; // Resetear la página a la primera al realizar una búsqueda
    displayProducts(filteredProducts);
    setupPagination(filteredProducts);
};

// Función para redirigir a WhatsApp con los productos del carrito
const redirectToWhatsApp = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('El carrito está vacío. Por favor, agrega productos antes de proceder a la compra.');
        return;
    }

    // Construir el mensaje para WhatsApp
    let message = "Hola, estoy interesado en comprar los siguientes productos:%0A";
    cart.forEach(item => {
        message += `- ${item.name} (Cantidad: ${item.quantity}) - $${item.price} c/u%0A`;
    });

    // Calcular el total
    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    message += `%0A%0ATotal: $${total.toFixed(2)}`;

    // Redirigir a WhatsApp
    const whatsappNumber = "573204535477"; // Cambia este número por el tuyo (incluye el código de país)
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
};

// Asociar el evento al botón "Proceder a la compra"
document.getElementById('checkout-button').addEventListener('click', redirectToWhatsApp);
