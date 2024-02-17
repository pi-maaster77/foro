document.getElementById("crear").addEventListener("submit", function (event) {// Subir el articulo.
    event.preventDefault();          
    respuesta = {
      nombre : document.getElementById("titulo").value,
      contenido : document.getElementById("contenido").value,
      imagenes : document.getElementById("imagen").value,
      autor : localStorage.getItem("username")
    }; // Obtener el contenido de la encuesta.
    fetch("/crear", { // Enviar el articulo al servidor usando el metodo POST
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }, 
      body: JSON.stringify(respuesta)
      })
      .then(response => response.json())
      .then(window.location.href = "/") // Volver al inicio.
      .catch(error => console.error("Error al enviar la respuesta:", error));
  });
