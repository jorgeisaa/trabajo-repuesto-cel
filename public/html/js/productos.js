document.addEventListener("DOMContentLoaded", () => {
    const cartKey = "shoppingCart";
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    const cartCounter = document.getElementById("cartCounter");
    const cartContainer = document.getElementById("cartContainer");
    const cartToggleBtn = document.getElementById("cartToggle");
    const cartSidebar = document.getElementById("cartSidebar");
    const closeCartBtn = document.getElementById("closeCart");
    const cartTotal = document.getElementById("cartTotal");
    const container = document.getElementById("productsContainer");

    // Botón de Finalizar Compra
    const checkoutBtn = document.createElement("button");
    checkoutBtn.id = "checkoutBtn";
    checkoutBtn.textContent = "Finalizar Compra";
    checkoutBtn.classList.add("checkout-button");

    function updateCartCounter() {
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        cartCounter.textContent = totalItems;
    }

    function updateCartTotal() {
        const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
        cartTotal.textContent = `Total: $${total.toFixed(2)}`;
    }

    function saveCart() {
        localStorage.setItem(cartKey, JSON.stringify(cart));
    }

    function renderCart() {
        cartContainer.innerHTML = "";

        if (cart.length === 0) {
            cartContainer.innerHTML = "<p>🛒 Tu carrito está vacío.</p>";
            cartTotal.textContent = "Total: $0.00";
            checkoutBtn.remove();
            return;
        }

        cart.forEach((product, index) => {
            const cartItem = document.createElement("div");
            cartItem.classList.add("cart-item");
            cartItem.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <p><strong>${product.name}</strong></p>
                    <p>$${product.price.toFixed(2)}</p>
                    <div class="cart-item-actions">
                        <button class="decrease-qty" data-index="${index}">➖</button>
                        <span>${product.quantity}</span>
                        <button class="increase-qty" data-index="${index}">➕</button>
                        <button class="remove-from-cart" data-index="${index}">❌</button>
                    </div>
                </div>
            `;
            cartContainer.appendChild(cartItem);
        });

        cartContainer.appendChild(checkoutBtn);
        updateCartTotal();
    }

    cartContainer.addEventListener("click", (e) => {
        const index = parseInt(e.target.dataset.index);

        if (e.target.classList.contains("increase-qty")) {
            cart[index].quantity++;
        } else if (e.target.classList.contains("decrease-qty")) {
            if (cart[index].quantity > 1) {
                cart[index].quantity--;
            } else {
                cart.splice(index, 1);
            }
        } else if (e.target.classList.contains("remove-from-cart")) {
            cart.splice(index, 1);
        } else {
            return;
        }

        saveCart();
        updateCartCounter();
        renderCart();
    });

    fetch('/products')
        .then(response => response.json())
        .then(products => {
            console.log(products);
            
            if (!container) return;
            container.innerHTML = "";

            if (products.length === 0) {
                container.innerHTML = "<p style='text-align:center;'>No hay productos disponibles.</p>";
                return;
            }

            products.forEach(product => {
                const productCard = document.createElement("div");
                productCard.classList.add("product-card", "box_main");
                productCard.innerHTML = `
                    <img src="${product.image || 'default.jpg'}" alt="${product.name}">
                    <div class="product-info">
                        <p class="product-title">${product.name}</p>
                        <p class="product-price">$${(product.price || 0).toFixed(2)}</p>
                        <a href="#" class="product-button" data-id="${product._id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image || 'default.jpg'}">Agregar al carrito</a>
                    </div>
                `;
                container.appendChild(productCard);
            });

            document.querySelectorAll(".product-button").forEach(button => {
                button.addEventListener("click", (e) => {
                    e.preventDefault();
                    const product = {
                        id: button.dataset.id,
                        name: button.dataset.name,
                        price: parseFloat(button.dataset.price),
                        image: button.dataset.image,
                        quantity: 1
                    };

                    const existingProduct = cart.find(item => item.id === product.id);
                    if (existingProduct) {
                        existingProduct.quantity++;
                    } else {
                        cart.push(product);
                    }

                    saveCart();
                    updateCartCounter();
                    renderCart();
                    cartSidebar.classList.add("active");
                });
            });
        })
        .catch(error => console.error("❌ Error cargando productos:", error));

    cartToggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        cartSidebar.classList.add("active");
    });

    closeCartBtn.addEventListener("click", () => {
        cartSidebar.classList.remove("active");
    });

    updateCartCounter();
    renderCart();
});
