// Lógica para alternar formularios
const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

registerBtn.addEventListener('click', () => {
  container.classList.add('active');
});

loginBtn.addEventListener('click', () => {
  container.classList.remove('active');
});

document.addEventListener("DOMContentLoaded", () => {
  initLogin();
  initRegister();
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
        setTimeout(() => {
          window.location.href = "./index.html";  // Redirige a index.html después de login exitoso
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

function initRegister() {
  const registerForm = document.getElementById("registerForm");
  if (!registerForm) return;

  const submitButton = registerForm.querySelector("button[type='submit']");
  const messageDiv = createMessageDiv(registerForm);

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("newEmail").value.trim();
    const password = document.getElementById("newPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    if (!name || !email || !password || !confirmPassword) {
      return showMessage(messageDiv, "⚠️ Todos los campos son obligatorios.", "red");
    }

    if (password.length < 6) {
      return showMessage(messageDiv, "🔒 La contraseña debe tener al menos 6 caracteres.", "red");
    }

    if (password !== confirmPassword) {
      return showMessage(messageDiv, "❌ Las contraseñas no coinciden.", "red");
    }

    console.log(`🆕 Registrando usuario: ${name}, email: ${email}`);

    setLoadingState(submitButton, true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const data = await response.json();
      console.log("✅ Respuesta del servidor:", data);

      showMessage(messageDiv, data.message, data.success ? "green" : "red");
      if (data.success) {
        setTimeout(() => {
          window.location.href = "./index.html";  // Redirige a index.html después del login exitoso
        }, 1500);
      } else {
        showMessage(messageDiv, data.message, "red");
      }
      
    } catch (error) {
      console.error("❌ Error de conexión:", error);
      showMessage(messageDiv, "❌ Error de conexión con el servidor.", "red");
    } finally {
      setLoadingState(submitButton, false);
    }
  });
}

// Función para mostrar mensajes animados
function showMessage(element, text, color) {
  element.textContent = text;
  element.style.color = color;
  element.style.opacity = "1";

  setTimeout(() => {
    element.style.opacity = "0";
  }, 3000);
}

// Función para manejar el estado de carga del botón
function setLoadingState(button, isLoading) {
  button.disabled = isLoading;
  button.textContent = isLoading ? "Cargando..." : button.dataset.originalText || button.textContent;
}

// Función para crear un mensaje dinámico en formularios
function createMessageDiv(form) {
  const messageDiv = document.createElement("p");
  Object.assign(messageDiv, {
    style: "font-size: 14px; text-align: center; margin-top: 10px; opacity: 0; transition: opacity 0.5s ease-in-out;"
  });
  form.appendChild(messageDiv);
  return messageDiv;
}
