document.addEventListener('DOMContentLoaded', loadEmployees);

// Cargar empleados cuando la página esté lista
async function loadEmployees() {
    try {
        const response = await fetch('/api/employees');
        if (!response.ok) throw new Error('Error al cargar empleados');
        const employees = await response.json();
        renderEmployeeTable(employees);
        updateTotalExpense(employees); // Actualizar el contador del gasto
    } catch (error) {
        console.error(error.message);
    }
}

// Renderizar la tabla de empleados
function renderEmployeeTable(employees) {
    const tableBody = document.getElementById('employee-table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Limpiar la tabla antes de llenarla

    employees.forEach(employee => {
        const formattedSalary = formatCurrency(employee.salary);
        const formattedPaymentDate = employee.paymentDate ? new Date(employee.paymentDate).toLocaleDateString() : 'N/A';

        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${employee.name}</td>
            <td>${employee.job}</td>
            <td>${formattedSalary}</td>
            <td class="${employee.paymentStatus === 'paid' ? 'status-paid' : 'status-unpaid'}">
                ${employee.paymentStatus === 'paid' ? 'Pagado' : 'No Pagado'}
            </td>
            <td>${formattedPaymentDate}</td>
            <td>
                <button onclick="togglePaymentStatus(${employee.id})">
                    ${employee.paymentStatus === 'paid' ? 'Marcar No Pagado' : 'Marcar Pagado'}
                </button>
                <button onclick="deleteEmployee(${employee.id})">Eliminar</button>
            </td>
        `;
    });
}

// Cambiar el estado de pago de un empleado
async function togglePaymentStatus(id) {
    const newStatus = prompt('Nuevo estado de pago (paid/unpaid):');
    if (!newStatus) return;

    if (!['paid', 'unpaid'].includes(newStatus)) {
        alert('Estado inválido. Usa "paid" o "unpaid".');
        return;
    }

    try {
        const response = await fetch(`/api/employees/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentStatus: newStatus })
        });
        if (!response.ok) throw new Error('Error al actualizar estado de pago');
        loadEmployees(); // Recargar la lista de empleados
    } catch (error) {
        console.error('Error al actualizar estado de pago:', error);
    }
}

// Agregar un nuevo empleado
async function addEmployee() {
    const name = prompt('Nombre del empleado:');
    const job = prompt('Oficio del empleado:');
    const salary = prompt('Sueldo del empleado:');

    if (!name || !job || !salary) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    const newEmployee = {
        name,
        job,
        salary: parseFloat(salary),
        paymentStatus: 'unpaid',  // Inicialmente no pagado
        paymentDate: null
    };

    try {
        const response = await fetch('/api/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newEmployee)
        });
        if (!response.ok) throw new Error('Error al agregar empleado');
        loadEmployees(); // Recargar la lista de empleados
    } catch (error) {
        console.error('Error al agregar empleado:', error);
    }
}

// Eliminar un empleado
async function deleteEmployee(id) {
    if (confirm('¿Estás seguro de que deseas eliminar a este empleado?')) {
        try {
            const response = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Error al eliminar empleado');
            loadEmployees(); // Recargar la lista de empleados
        } catch (error) {
            console.error('Error al eliminar empleado:', error);
        }
    }
}

// Formatear un número en pesos colombianos con punto como separador de miles
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0, // Opcional: para no mostrar decimales
    }).format(amount);
}

// Actualizar el total de gasto (suma de salarios pagados)
function updateTotalExpense(employees) {
    const totalExpense = employees.reduce((total, employee) => {
        if (employee.paymentStatus === 'paid') {
            return total + employee.salary; // Solo sumamos los empleados pagados
        }
        return total;
    }, 0);

    const totalExpenseFormatted = formatCurrency(totalExpense);
    document.getElementById('total-expense').textContent = `Gasto Total: ${totalExpenseFormatted}`;
}


// Función para restar el total de salarios pagados del total de ingresos
function deductEmployeeSalaries(totalIncome, empleados) {
    // Calcular el total de salarios pagados
    const totalSalaryPaid = empleados.reduce((total, employee) => {
        if (employee.paymentStatus === 'paid') {
            return total + employee.salary; // Solo sumamos los empleados pagados
        }
        return total;
    }, 0);

    // Restar el total de salarios pagados al total de ingresos
    const totalAfterDeduction = totalIncome - totalSalaryPaid;

    // Retornar el total después de la resta
    return totalAfterDeduction;
}
