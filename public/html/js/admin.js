// Función para obtener todos los productos
async function fetchProducts() {
  try {
    const response = await fetch('/products');
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

    const products = await response.json();
    const tableBody = document.getElementById('productTableBody');
    tableBody.innerHTML = ''; // Limpiar la tabla

    products.forEach(product => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${product._id}</td>
        <td>${product.name}</td>
        <td>${product.price}</td>
        <td>${product.stock}</td>
        <td>${product.category}</td>
        <td>${product.description}</td>
        <td>${product.image ? `<img src="${product.image}" width="100">` : 'No image'}</td>
        <td>
          <button class="edit-btn" onclick="openEditModal('${product._id}', '${product.name}', '${product.price}', '${product.stock}', '${product.category}', '${product.description}', '${product.image}')"><i class="fas fa-edit"></i> Editar</button>
          <button class="delete-btn" onclick="deleteProduct('${product._id}')"><i class="fas fa-trash-alt"></i> Eliminar</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('❌ Error al obtener productos:', error);
    alert(`❌ Error al cargar productos: ${error.message}`);
  }
}

// Event listener para agregar un nuevo producto
document.getElementById('productForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const formData = new FormData(this);

  try {
    const response = await fetch('/products', { method: 'POST', body: formData });
    if (!response.ok) throw new Error('Error al agregar producto.');

    alert('✅ Producto agregado exitosamente');
    this.reset();
    fetchProducts();
  } catch (error) {
    console.error('❌ Error:', error);
    alert(`❌ Error al agregar producto: ${error.message}`);
  }
});

// Función para eliminar un producto
async function deleteProduct(id) {
  if (confirm('⚠️ ¿Estás seguro de eliminar este producto?')) {
    try {
      const response = await fetch(`/products/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error al eliminar producto.');

      alert('✅ Producto eliminado');
      fetchProducts();
    } catch (error) {
      console.error('❌ Error:', error);
      alert(`❌ Error al eliminar producto: ${error.message}`);
    }
  }
}

// Función para abrir el modal de edición
function openEditModal(id, name, price, stock, category, description, image) {
  document.getElementById('editId').value = id;
  document.getElementById('editName').value = name;
  document.getElementById('editPrice').value = price;
  document.getElementById('editStock').value = stock;
  document.getElementById('editCategory').value = category;
  document.getElementById('editDescription').value = description;

  // Si hay imagen, mostrarla como vista previa
  const imagePreview = document.getElementById('editImagePreview');
  if (image) {
    imagePreview.style.display = 'block';
    imagePreview.src = image; // Actualizar la imagen en la vista previa
  } else {
    imagePreview.style.display = 'none';
  }

  // Mostrar el modal cuando se llame a esta función
  document.getElementById('editModal').style.display = 'flex'; // Mostrar el modal con 'flex'
}

// Función para cerrar el modal
function closeModal() {
  document.getElementById('editModal').style.display = 'none'; // Ocultar el modal
}



// Event listener para actualizar un producto
document.getElementById('editForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const id = document.getElementById('editId').value;
  const formData = new FormData(this); // Usamos FormData para manejar el archivo de imagen

  try {
    const response = await fetch(`/products/${id}`, {
      method: 'PUT',
      body: formData, // Enviar FormData, que incluye los datos del producto y la imagen (si se seleccionó)
    });

    if (!response.ok) throw new Error('Error al actualizar producto.');

    alert('✅ Producto actualizado');
    closeModal();
    fetchProducts();
  } catch (error) {
    console.error('❌ Error:', error);
    alert(`❌ Error al actualizar producto: ${error.message}`);
  }
});

// Función para buscar productos en la tabla
function searchProducts() {
  const filter = document.getElementById('searchInput').value.toUpperCase();
  const table = document.getElementById('productTableBody');
  const rows = table.getElementsByTagName('tr');

  Array.from(rows).forEach(row => {
    const cells = row.getElementsByTagName('td');
    let matchFound = false;

    // Recorremos todas las celdas de la fila
    Array.from(cells).forEach(cell => {
      const cellText = cell.textContent || cell.innerText;
      if (cellText.toUpperCase().indexOf(filter) > -1) {
        matchFound = true;
      }
    });

    // Si alguna celda tiene una coincidencia, mostramos la fila
    row.style.display = matchFound ? '' : 'none';
  });
}

// Función para cerrar el modal cuando se haga clic fuera de él
window.onclick = function(event) {
  const modal = document.getElementById('editModal');
  if (event.target == modal) {
    closeModal();
  }
};

// Llamar a la función para obtener los productos al cargar la página
fetchProducts();
