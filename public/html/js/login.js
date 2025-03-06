document.addEventListener("DOMContentLoaded", () => {
  initLogin();
});

function initLogin() {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  const submitButton = loginForm.querySelector("button[type='submit']");
  const messageDiv = createMessageDiv(loginForm);

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      return showMessage(messageDiv, "⚠️ Todos los campos son obligatorios.", "red");
    }

    console.log(`🔑 Enviando email: ${email}, contraseña: ${password}`);

    // 🔹 Redirige al admin a "a.html"
    if (email === "admin@123" && password === "admin") {
      window.location.href = "./a.html";
      return;
    }

    setLoadingState(submitButton, true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const data = await response.json();
      console.log("🔍 Respuesta del servidor:", data);

      showMessage(messageDiv, data.message, data.success ? "green" : "red");

      if (data.success) {
        // 🔹 Guarda el token en localStorage
        localStorage.setItem("token", data.token);

        // 🔹 Obtiene los datos del usuario
        await obtenerDatosUsuario(data.token);

        // 🔹 Redirige después de 1.5 segundos
        setTimeout(() => {
          window.location.href = "./index.html";
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

// 🔹 Nueva función para obtener los datos del usuario después del login
async function obtenerDatosUsuario(token) {
  try {
    const response = await fetch("/api/auth/user", {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) throw new Error("No se pudieron obtener los datos del usuario");

    const userData = await response.json();
    
    // 🔹 Guardar los datos en localStorage
    localStorage.setItem("user", JSON.stringify(userData));

  } catch (error) {
    console.error("❌ Error obteniendo datos del usuario:", error.message);
  }
}

// 🔹 Mostrar información del usuario al hacer clic en "Cuenta"
document.addEventListener("DOMContentLoaded", () => {
  const userData = JSON.parse(localStorage.getItem("user"));

  if (userData) {
    document.getElementById("openMenu").addEventListener("click", () => {
      mostrarInfoUsuario(userData);
    });
  }
});

function mostrarInfoUsuario(user) {
  alert(`👤 Nombre: ${user.name}\n📧 Email: ${user.email}`);
}

// 🔹 Función para manejar el estado de carga del botón
function setLoadingState(button, isLoading) {
  if (!button) return;

  if (!button.dataset.originalText) {
    button.dataset.originalText = button.textContent;
  }

  button.disabled = isLoading;
  button.textContent = isLoading ? "Cargando..." : button.dataset.originalText;
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

// 🔹 Función para crear un mensaje dinámico en formularios
function createMessageDiv(form) {
  const messageDiv = document.createElement("p");
  Object.assign(messageDiv, {
    style: "font-size: 14px; text-align: center; margin-top: 10px; opacity: 0; transition: opacity 0.5s ease-in-out;"
  });
  form.appendChild(messageDiv);
  return messageDiv;
}
