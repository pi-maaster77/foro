document.getElementById("registrar").addEventListener("submit", function (event) { // Esperar a que se pueda escribir en el documento.
    event.preventDefault();

    const user = document.getElementById("user").value;
    const passwd = document.getElementById("passwd").value;
    const cpasswd = document.getElementById("cpasswd").value
    // Conseguir los datos ingresados.
    if(cpasswd != passwd){ // Verificar si las contraseñas son diferentes
        document.getElementById("mensajeError").innerHTML = "Error al crear la cuenta: las contraseñas no coinciden"
    } else { // De ser el caso, continuar.
    fetch("/registrar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ user, passwd })
    }) // Enviar el nuevo usuario al servidor.
        .then(response => {
            if (response.ok) { // Verificar si la respuesta no es un error
                localStorage.setItem("username", user) // Guardar el usuario.
                window.location.href = "/"
                return response.json();
            } else { // De no ser el caso, informar al usuario.
                throw new Error("Error al crear la cuenta");
            }
    })
        .catch(error => {
            document.getElementById("mensajeError").innerText = "Error: el usuario ya existe"; // Informar al usuario si el nombre de usuario ya existe.
    });
}});
