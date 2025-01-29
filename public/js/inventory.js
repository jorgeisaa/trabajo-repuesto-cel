
// Función para buscar productos
async function searchProducts() {
    const searchTerm = document.getElementById('search-bar').value.toLowerCase();
    const response = await fetch('/api/products');
    
    if (response.ok) {
        const products = await response.json();
        const filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchTerm));

        const productCardsContainer = document.getElementById('product-cards');
        productCardsContainer.innerHTML = ''; // Limpiar el contenedor antes de agregar las tarjetas

        // Crear tarjetas para los productos filtrados
        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');

            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-brand">Marca: ${product.brand}</p>
                <p class="product-quantity ${product.quantity < 5 ? 'low' : ''}">Cantidad: ${product.quantity}</p>
                <p class="product-price">Precio: ${formatPrice(product.price)}</p>
                <p class="product-date">Fecha: ${product.date}</p>
                <button onclick='openEditProductForm(${JSON.stringify(product)})'>Editar</button>
                <button onclick="deleteProduct(${product.id})">Eliminar</button>
            `;

            productCardsContainer.appendChild(productCard);
        });
    } else {
        console.log('Error al obtener los productos:', response.statusText);
    }
}



// Función para abrir el formulario de agregar producto
function openAddProductForm() {
    document.getElementById('add-product-form').classList.remove('hidden');
    document.getElementById('add-product-form').style.display = 'block';
    document.getElementById('modal-overlay').classList.add('visible');
}

// Función para cerrar el formulario de agregar producto
function closeAddProductForm() {
    document.getElementById('add-product-form').classList.add('hidden');
    document.getElementById('add-product-form').style.display = 'none';
    document.getElementById('modal-overlay').classList.remove('visible');
}

// Función para manejar el envío del formulario de agregar producto
async function addProduct(event) {
    event.preventDefault();

    const name = document.getElementById('product-name').value;
    const brand = document.getElementById('product-brand').value;
    const imageFile = document.getElementById('product-image').files[0];
    const quantity = document.getElementById('product-quantity').value;
    const price = document.getElementById('product-price').value;
    const date = document.getElementById('product-date').value;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('brand', brand);
    formData.append('quantity', quantity);
    formData.append('price', price);
    formData.append('date', date);

    // Si se selecciona una nueva imagen, la subimos
    if (imageFile) {
        formData.append('image', imageFile); // Subir la imagen nueva
    } else {
        // Si no se selecciona una nueva imagen, se debe mantener el nombre original
        const existingImage = document.getElementById('current-product-image').value;
        if (existingImage) {
            formData.append('image', existingImage); // Mantener la imagen original
        }
    }

    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const newProduct = await response.json();
            console.log('Producto agregado:', newProduct);
            alert('Producto agregado correctamente.');
            closeAddProductForm();
            displayProducts(); // Actualizar la lista de productos en la interfaz
        } else {
            const errorData = await response.json();
            console.log('Error al agregar el producto:', errorData);
            alert('Hubo un problema al agregar el producto. Intenta nuevamente.');
        }
    } catch (error) {
        console.log('Error al hacer la solicitud:', error);
        alert('Error al intentar agregar el producto.');
    }
}


// Función para abrir el formulario de edición con los datos del producto
function openEditProductForm(product) {
    document.getElementById('edit-product-id').value = product.id;
    document.getElementById('edit-product-name').value = product.name;
    document.getElementById('edit-product-brand').value = product.brand;
    document.getElementById('edit-product-quantity').value = product.quantity;
    document.getElementById('edit-product-price').value = product.price;
    document.getElementById('edit-product-date').value = product.date;
    document.getElementById('edit-product-form').classList.remove('hidden');
    document.getElementById('edit-product-form').style.display = 'block';
    document.getElementById('modal-overlay').classList.add('visible');
}

// Función para cerrar el formulario de edición
function closeEditProductForm(event) {
    const form = document.getElementById('edit-product-form');
    const overlay = document.getElementById('modal-overlay');
    if (!event || event.target === form || event.target.tagName === 'BUTTON' || event.target === overlay) {
        form.classList.add('hidden');
        form.style.display = 'none';
        overlay.classList.remove('visible');
        console.log('Formulario de edición cerrado.');
    }
}

// Función para manejar el envío del formulario de edición
async function editProduct(event) {
    event.preventDefault();

    const id = document.getElementById('edit-product-id').value;
    const name = document.getElementById('edit-product-name').value;
    const brand = document.getElementById('edit-product-brand').value;
    const imageFile = document.getElementById('edit-product-image').files[0];
    const quantity = document.getElementById('edit-product-quantity').value;
    const price = document.getElementById('edit-product-price').value;
    const date = document.getElementById('edit-product-date').value;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('brand', brand);

    // Aquí manejamos la imagen: si no se selecciona una nueva, usamos la existente
    const existingImage = document.getElementById('edit-product-image').getAttribute('data-existing-image');
    if (imageFile) {
        // Si se selecciona una nueva imagen, la agregamos
        formData.append('image', imageFile);
    } else if (existingImage) {
        // Si no se selecciona una nueva imagen, enviamos la imagen existente
        formData.append('image', existingImage);
    }

    formData.append('quantity', quantity);
    formData.append('price', price);
    formData.append('date', date);

    try {
        const response = await fetch(`/api/products/${id}`, {
            method: 'PUT',
            body: formData
        });

        if (response.ok) {
            const updatedProduct = await response.json();
            console.log('Producto actualizado:', updatedProduct);
            alert('Producto actualizado correctamente.');
            closeEditProductForm();
            displayProducts(); // Actualizar la lista de productos en la interfaz
        } else {
            const errorData = await response.json();
            console.log('Error al actualizar el producto:', errorData);
            alert('Hubo un problema al actualizar el producto. Intenta nuevamente.');
        }
    } catch (error) {
        console.log('Error al hacer la solicitud:', error);
        alert('Error al intentar actualizar el producto.');
    }
}


// Función para formatear el precio en pesos colombianos
function formatPrice(price) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(price);
}

// Función para mostrar los productos con paginación
async function displayProducts(currentPage = 1, filteredProducts = null) {
    try {
        let products;
        if (filteredProducts) {
            products = filteredProducts; // Usamos los productos filtrados por búsqueda
        } else {
            const response = await fetch('/api/products');
            if (response.ok) {
                products = await response.json();
            } else {
                console.log('Error al obtener los productos:', response.statusText);
                return;
            }
        }

        const paginatedResult = paginateProducts(products, currentPage);
        const productCardsContainer = document.getElementById('product-cards');
        productCardsContainer.innerHTML = ''; // Limpiar el contenedor antes de agregar las tarjetas

        paginatedResult.products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');

            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-brand">Marca: ${product.brand}</p>
                <p class="product-quantity ${product.quantity < 5 ? 'low' : ''}">Cantidad: ${product.quantity}</p>
                <p class="product-price">Precio: ${formatPrice(product.price)}</p>
                <p class="product-date">Fecha: ${product.date}</p>
                <button onclick='openEditProductForm(${JSON.stringify(product)})'>Editar</button>
                <button onclick="deleteProduct(${product.id})">Eliminar</button>
            `;

            productCardsContainer.appendChild(productCard);
        });

        // Mostrar controles de paginación
        displayPaginationControls(paginatedResult.totalPages, currentPage);
    } catch (error) {
        console.log('Error al hacer la solicitud:', error);
    }
}


// Llamar a la función para mostrar los productos cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
    displayProducts(); // Mostrar productos al cargar la página
});

// Asumiendo que ya tienes un buscador en tu HTML
document.getElementById('search-bar').addEventListener('input', () => {
    searchProducts(); // Llamar a la función de búsqueda cuando el usuario escriba algo
});


// Llamar a la función para mostrar los productos cuando se cargue la página
document.addEventListener('DOMContentLoaded', displayProducts);


// Llamar a la función para mostrar los productos cuando se cargue la página
document.addEventListener('DOMContentLoaded', displayProducts);


// Llamar a la función para mostrar los productos cuando se cargue la página
document.addEventListener('DOMContentLoaded', displayProducts);

// Función para abrir el formulario de edición con los datos del producto
function openEditProductForm(product) {
    document.getElementById('edit-product-id').value = product.id;
    document.getElementById('edit-product-name').value = product.name;
    document.getElementById('edit-product-brand').value = product.brand;
    document.getElementById('edit-product-quantity').value = product.quantity;
    document.getElementById('edit-product-price').value = product.price;
    document.getElementById('edit-product-date').value = product.date;
    document.getElementById('edit-product-form').classList.remove('hidden');
    document.getElementById('edit-product-form').style.display = 'block';
    document.getElementById('modal-overlay').classList.add('visible');
}

// Función para cerrar el formulario de edición
function closeEditProductForm(event) {
    const form = document.getElementById('edit-product-form');
    const overlay = document.getElementById('modal-overlay');
    if (!event || event.target === form || event.target.tagName === 'BUTTON' || event.target === overlay) {
        form.classList.add('hidden');
        form.style.display = 'none';
        overlay.classList.remove('visible');
        console.log('Formulario de edición cerrado.');
    }
}


// Función para eliminar un producto
async function deleteProduct(productId) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                console.log('Producto eliminado correctamente.');
                alert('Producto eliminado correctamente.');
                displayProducts(); // Actualizar la lista de productos en la interfaz
            } else {
                const errorData = await response.json();
                console.log('Error al eliminar el producto:', errorData);
                alert('Hubo un problema al eliminar el producto. Intenta nuevamente.');
            }
        } catch (error) {
            console.log('Error al hacer la solicitud:', error);
            alert('Error al intentar eliminar el producto.');
        }
    }
}

// Función para la paginación
const paginateProducts = (products, currentPage, productsPerPage = 5) => {
    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = products.slice(startIndex, endIndex);

    return {
        currentPage,
        totalPages,
        products: paginatedProducts
    };
};

// Función para mostrar los productos en forma de tarjeta con paginación
async function displayProducts(currentPage = 1) {
    try {
        const response = await fetch('/api/products');
        if (response.ok) {
            const products = await response.json();
            const paginatedResult = paginateProducts(products, currentPage);
            const productCardsContainer = document.getElementById('product-cards');
            productCardsContainer.innerHTML = ''; // Limpiar el contenedor antes de agregar las tarjetas

            paginatedResult.products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.classList.add('product-card');

                productCard.innerHTML = `
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-brand">Marca: ${product.brand}</p>
                    <p class="product-quantity ${product.quantity < 5 ? 'low' : ''}">Cantidad: ${product.quantity}</p>
                    <p class="product-price">Precio: ${formatPrice(product.price)}</p>
                    <p class="product-date">Fecha: ${product.date}</p>
                    <button onclick='openEditProductForm(${JSON.stringify(product)})'>Editar</button>
                    <button onclick="deleteProduct(${product.id})">Eliminar</button>
                `;

                productCardsContainer.appendChild(productCard);
            });

            // Mostrar controles de paginación
            displayPaginationControls(paginatedResult.totalPages, currentPage);
        } else {
            console.log('Error al obtener los productos:', response.statusText);
        }
    } catch (error) {
        console.log('Error al hacer la solicitud:', error);
    }
}

// Función para mostrar los controles de paginación
const displayPaginationControls = (totalPages, currentPage) => {
    const paginationContainer = document.getElementById('pagination-controls');
    paginationContainer.innerHTML = ''; // Limpiar el contenedor antes de agregar los controles

    const maxButtons = 10;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }

    if (startPage > 1) {
        const firstButton = document.createElement('button');
        firstButton.textContent = '<<';
        firstButton.classList.add('pagination-button');
        firstButton.addEventListener('click', () => displayProducts(1));
        paginationContainer.appendChild(firstButton);

        const prevButton = document.createElement('button');
        prevButton.textContent = '<';
        prevButton.classList.add('pagination-button');
        prevButton.addEventListener('click', () => displayProducts(currentPage - 1));
        paginationContainer.appendChild(prevButton);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.add('pagination-button');
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        pageButton.addEventListener('click', () => displayProducts(i));
        paginationContainer.appendChild(pageButton);
    }

    if (endPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = '>';
        nextButton.classList.add('pagination-button');
        nextButton.addEventListener('click', () => {
            const newCurrentPage = Math.min(currentPage + maxButtons, totalPages);
            displayProducts(newCurrentPage);
        });
        paginationContainer.appendChild(nextButton);

        const lastButton = document.createElement('button');
        lastButton.textContent = '>>';
        lastButton.classList.add('pagination-button');
        lastButton.addEventListener('click', () => displayProducts(totalPages));
        paginationContainer.appendChild(lastButton);
    }
};

// Llamar a la función para mostrar los productos en la página inicial
document.addEventListener('DOMContentLoaded', () => {
    displayProducts();
});


// Llamar a la función para mostrar los productos cuando se cargue la página
document.addEventListener('DOMContentLoaded', displayProducts);

// Función para exportar el inventario a CSV
async function exportInventory() {
    try {
        const response = await fetch('/api/products');
        if (response.ok) {
            const products = await response.json();
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "ID,Nombre,Marca,Cantidad,Precio,Fecha de Adquisición,Imagen\n";

            products.forEach(product => {
                const row = [
                    product.id,
                    product.name,
                    product.brand,
                    product.quantity,
                    product.price,
                    product.date,
                    product.image
                ].join(",");
                csvContent += row + "\n";
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "inventario.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            console.log('Error al obtener los productos:', response.statusText);
        }
    } catch (error) {
        console.log('Error al hacer la solicitud:', error);
    }
}
