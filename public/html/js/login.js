document.addEventListener("DOMContentLoaded", () => {
    initLogin();
    initRegister();
});

// 🔹 Función para manejar el inicio de sesión
function initLogin() {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return;

    const messageDiv = createMessageDiv(loginForm);
    const submitButton = loginForm.querySelector("button[type='submit']");

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!username || !password) {
            return showMessage(messageDiv, "⚠️ Todos los campos son obligatorios.", "red");
        }

        console.log(`🔑 Enviando usuario: ${username}, contraseña: ${password}`);

        // ⏳ Deshabilitar botón durante la petición
        setLoadingState(submitButton, true);

        try {
            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

            const data = await response.json();
            console.log("🔍 Respuesta del servidor:", data);

            showMessage(messageDiv, data.message, data.success ? "green" : "red");

            if (data.success) {
                setTimeout(() => {
                    window.location.href = data.redirect;
                }, 1500);
            }
        } catch (error) {
            console.error("❌ Error de conexión:", error);
            showMessage(messageDiv, "❌ Error de conexión con el servidor.", "red");
        } finally {
            setLoadingState(submitButton, false);
        }
    });
}

// 🔹 Función para manejar el registro de usuarios
function initRegister() {
    const registerForm = document.getElementById("registerForm");
    if (!registerForm) return;

    const messageDiv = document.getElementById("registerMessage");
    const submitButton = registerForm.querySelector("button[type='submit']");

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("newUsername").value.trim();
        const password = document.getElementById("newPassword").value.trim();
        const confirmPassword = document.getElementById("confirmPassword").value.trim();

        if (!username || !password || !confirmPassword) {
            return showMessage(messageDiv, "⚠️ Todos los campos son obligatorios.", "red");
        }

        if (password.length < 6) {
            return showMessage(messageDiv, "🔒 La contraseña debe tener al menos 6 caracteres.", "red");
        }

        if (password !== confirmPassword) {
            return showMessage(messageDiv, "❌ Las contraseñas no coinciden.", "red");
        }

        console.log(`🆕 Registrando usuario: ${username}`);

        // ⏳ Deshabilitar botón mientras se procesa
        setLoadingState(submitButton, true);

        try {
            const response = await fetch("http://localhost:3000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

            const data = await response.json();
            console.log("✅ Respuesta del servidor:", data);

            showMessage(messageDiv, data.message, data.success ? "green" : "red");

            if (data.success) {
                setTimeout(() => {
                    window.location.href = "./login.htm"; // Redirigir al login tras registro exitoso
                }, 1500);
            }
        } catch (error) {
            console.error("❌ Error de conexión:", error);
            showMessage(messageDiv, "❌ Error de conexión con el servidor.", "red");
        } finally {
            setLoadingState(submitButton, false);
        }
    });
}

// 🔹 Función para mostrar mensajes animados
function showMessage(element, text, color) {
    element.textContent = text;
    element.style.color = color;
    element.style.opacity = "1";

    setTimeout(() => {
        element.style.opacity = "0";
    }, 3000);
}

// 🔹 Función para manejar el estado de carga del botón
function setLoadingState(button, isLoading) {
    button.disabled = isLoading;
    button.textContent = isLoading ? "Cargando..." : button.dataset.originalText || button.textContent;
}

// 🔹 Función para crear un mensaje dinámico en formularios
function createMessageDiv(form) {
    const messageDiv = document.createElement("p");
    Object.assign(messageDiv, {
        style: "font-size: 14px; text-align: center; margin-top: 10px; opacity: 0; transition: opacity 0.5s ease-in-out;"
    });
    form.appendChild(messageDiv);
    return messageDiv;
}
