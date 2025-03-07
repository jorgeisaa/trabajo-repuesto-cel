document.addEventListener("DOMContentLoaded", () => {
    const cartKey = "shoppingCart";
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    const cartCounter = document.getElementById("cartCounter");
    const cartContainer = document.getElementById("cartContainer");
    const cartToggleBtn = document.getElementById("cartToggle");
    const cartSidebar = document.getElementById("cartSidebar");
    const closeCartBtn = document.getElementById("closeCart");
    const cartTotal = document.getElementById("cartTotal");

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
       if (!cartTotal) return;
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

   function addToCart(product) {
       const existingProduct = cart.find(item => item.name === product.name);
       if (existingProduct) {
           existingProduct.quantity++;
       } else {
           product.quantity = 1;
           cart.push(product);
       }

       saveCart();
       updateCartCounter();
       renderCart();
       cartSidebar.classList.add("active");
   }

    // Cargar productos desde la API
    fetch('/products')
        .then(response => response.json())
        .then(products => {
            const container = document.getElementById("productsContainer");

            if (!container) return;

            if (products.length === 0) {
                container.innerHTML = "<p style='text-align:center;'>No hay productos disponibles.</p>";
                return;
            }

            products.forEach(product => {
                const productCard = document.createElement("div");
                productCard.classList.add("product-card", "box_main");
            
               // Generar descuento aleatorio entre 5% y 30%
    const discount = Math.floor(Math.random() * (30 - 5 + 1)) + 5; 
    const discountedPrice = (product.price * (1 - discount / 100)).toFixed(2);

    // Generar calificación aleatoria entre 1 y 5 estrellas
    const rating = (Math.random() * (5 - 3.5) + 3.5).toFixed(1);
    const stars = "⭐".repeat(Math.round(rating));

    productCard.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <div class="product-info">
            <p class="product-title">${product.name}</p>
            <p class="product-rating">${stars} (${rating})</p>
            <div class="product-purchase">
                <p class="product-price">
                    <span class="old-price">$${product.price.toFixed(2)}</span> 
                    <span class="new-price">$${discountedPrice}</span> 
                    <span class="discount-tag">-${discount}%</span>
                </p>
                <a href="#" class="product-button add-to-cart"
                   data-id="${product.id}" 
                   data-name="${product.name}" 
                   data-price="${discountedPrice}" 
                   data-image="${product.image}" 
                   data-stock="${product.stock}">
                   🛒
                </a>
            </div>
        </div>
    `;
    
            
                // Evento para mostrar detalles al hacer clic en la tarjeta (excepto en el botón "Agregar al carrito")
                productCard.addEventListener("click", (e) => {
                    if (!e.target.classList.contains("add-to-cart")) { 
                        document.getElementById("modalProductName").textContent = product.name;
                        document.getElementById("modalProductImage").src = product.image;
                        document.getElementById("modalProductDescription").textContent = product.description || "Sin descripción disponible";
                        document.getElementById("modalProductPrice").textContent = `$${product.price.toFixed(2)}`;
                        document.getElementById("modalProductStock").textContent = `${product.stock}`;
            
                        document.getElementById("productModal").style.display = "flex";
                    }
                });
            
                // Evento para agregar al carrito sin abrir el modal
                productCard.querySelector(".add-to-cart").addEventListener("click", (e) => {
                    e.preventDefault();
                    addToCart(product);
                });
            
                container.appendChild(productCard);
            });
            
            // Cerrar modal cuando se hace clic en la "X"
            document.querySelector(".close-modal").addEventListener("click", () => {
                document.getElementById("productModal").style.display = "none";
            });
            
            // Cerrar modal si se hace clic fuera de la ventana modal
            window.addEventListener("click", (e) => {
                const modal = document.getElementById("productModal");
                if (e.target === modal) {
                    modal.style.display = "none";
                }
            });
            
            productCard.querySelector(".add-to-cart").addEventListener("click", (e) => {
                e.preventDefault();
                addToCart({
                    id: product.id,
                    name: product.name,
                    price: parseFloat(discountedPrice),
                    image: product.image
                });
            });

            container.appendChild(productCard);
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

checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    let message = "¡Hola! Quiero comprar:\n";
    cart.forEach(item => {
        message += `- ${item.quantity} x ${item.name} ($${item.price.toFixed(2)} c/u)\n`;
    });

    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    message += `\nTotal: $${total.toFixed(2)}`;

    const phoneNumber = "3044426626";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
});

updateCartCounter();
renderCart();


// Función para buscar productos
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.querySelector(".form-control");
    const container = document.getElementById("productsContainer");

    if (!searchInput || !container) return;

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();

        fetch('/products')
            .then(response => response.json())
            .then(products => {
                document.querySelectorAll(".product-card").forEach(card => card.style.display = "none");
                
                const filteredProducts = products.filter(product => 
                    product.name.toLowerCase().includes(query)
                );

                if (filteredProducts.length === 0) {
                    container.innerHTML = "<p style='text-align:center;'>No hay productos disponibles.</p>";
                    return;
                }

                filteredProducts.forEach(product => {
                    let productCard = [...container.children].find(card => 
                        card.querySelector(".product-title").textContent === product.name
                    );
                    
                    if (productCard) {
                        productCard.style.display = "flex";
                    }
                });
            });
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const categoryFilter = document.getElementById("categoryFilter");
    const container = document.getElementById("productsContainer");

    if (!categoryFilter || !container) return;

    categoryFilter.addEventListener("change", () => {
        const selectedCategory = categoryFilter.value;

        fetch('/products')
            .then(response => response.json())
            .then(products => {
                container.innerHTML = ""; // Limpiar el contenedor

                let filteredProducts = products;

                if (selectedCategory !== "all") {
                    filteredProducts = products.filter(product => 
                        product.category.toLowerCase() === selectedCategory.toLowerCase()
                    );
                }

                if (filteredProducts.length === 0) {
                    container.innerHTML = "<p style='text-align:center;'>No hay productos en esta categoría.</p>";
                    return;
                }

                filteredProducts.forEach(product => {
                    const productCard = document.createElement("div");
                    productCard.classList.add("product-card", "box_main");

                    // Generar descuento y calificación aleatoria
                    const discount = Math.floor(Math.random() * (30 - 5 + 1)) + 5; 
                    const discountedPrice = (product.price * (1 - discount / 100)).toFixed(2);
                    const rating = (Math.random() * (5 - 1) + 1).toFixed(1);
                    const stars = "⭐".repeat(Math.round(rating));

                    productCard.innerHTML = `
                        <img src="${product.image}" alt="${product.name}">
                        <div class="product-info">
                            <p class="product-title">${product.name}</p>
                            <p class="product-rating">${stars} (${rating})</p>
                            <div class="product-purchase">
                                <p class="product-price">
                                    <span class="old-price">$${product.price.toFixed(2)}</span> 
                                    <span class="new-price">$${discountedPrice}</span> 
                                    <span class="discount-tag">-${discount}%</span>
                                </p>
                                <a href="#" class="product-button add-to-cart"
                                   data-id="${product.id}" 
                                   data-name="${product.name}" 
                                   data-price="${discountedPrice}" 
                                   data-image="${product.image}" 
                                   data-stock="${product.stock}">
                                   🛒
                                </a>
                            </div>
                        </div>
                    `;

                    container.appendChild(productCard);
                });
            })
            .catch(error => console.error("❌ Error al filtrar productos:", error));
    });
});
