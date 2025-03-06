document.addEventListener("DOMContentLoaded", () => {
    const openMenu = document.getElementById("openMenu");
    const closeMenu = document.getElementById("closeMenu");
    const userInfo = document.getElementById("userInfo");

    openMenu.addEventListener("click", async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem("token"); // Recuperar el token del localStorage
        if (!token) {
            alert("No estás autenticado.");
            return;
        }

        try {
            const response = await fetch("/api/auth/user", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.message);

            // Mostrar la información del usuario
            document.getElementById("userName").textContent = data.user.name;
            document.getElementById("userEmail").textContent = data.user.email;
            userInfo.style.display = "block";

        } catch (error) {
            console.error("❌ Error obteniendo datos del usuario:", error);
            alert("No se pudieron obtener los datos del usuario.");
        }
    });

    closeMenu.addEventListener("click", () => {
        userInfo.style.display = "none";
    });
});
