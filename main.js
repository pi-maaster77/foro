const obtenerDatos = async (apiUrl) => {
    try {
      const escribir = document.getElementById("escribir");
      const response = await fetch(apiUrl + "/data");
      const datos = await response.json();
  
      for (const articulo of datos.art) {
        const articuloResponse = await fetch(apiUrl + "/articulos/" + articulo);
        const data = await articuloResponse.json();
  
        const parcial = `
          <article>
            <h2>${data.titulo}</h2>
            <p>${data.contenido}</p>
            ${data.imagen ? `<img src="${data.imagen}">` : ""}
            <input type="checkbox" id="like" name="opciones" value="like">
          </article`;
  
        escribir.innerHTML += parcial;
      }
    } catch (error) {
      console.error('Error al obtener el objeto:', error);
      throw error; // Relanza el error para que pueda ser manejado más arriba si es necesario
    }
  };
  
  // Llamada a la función
obtenerDatos("http://192.168.2.128:3000")
    .then(() => console.log("Datos obtenidos exitosamente"))
    .catch((error) => console.error("Error al obtener datos:", error));
crear = () => {
    window.location.href = "http://192.168.2.128:3000/crear"
}

