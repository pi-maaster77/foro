document.getElementById("ingresar").addEventListener("submit", function (event) { // Enviar el usuario y contraseña ingresados.
    event.preventDefault();

    const user = document.getElementById("user").value;
    const passwd = document.getElementById("passwd").value; 
    // Obtener de la encuesta los usuarios y contraseñas.

    fetch("/ingresar", { // Subir los datos al servidor con el metodo POST.
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ user, passwd })
        })
        .then(response => {
            if (response.ok) {
                localStorage.setItem("username", user) // guardar el nombre de usuario en el navegador.
                window.location.href = "/" //redirigir al inicio.
                return response.json();
            } else {
                throw new Error("Error en el inicio de sesion.");
            }

        })
        .catch(error => {
            error = document.getElementById("mensajeError")
            error.innerText = "Error: Nombre de usuario o contraseña incorrectos"; // Si el inicio de sesion falla, notificar al usuario.
        });
});