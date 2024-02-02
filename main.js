const escribir = document.getElementById("escribir");
const nombre = localStorage.getItem("username") || "";

// Función para obtener los likes del usuario desde el servidor
async function obtenerLikesUsuario() {
  try {
    const response = await fetch(`/likes/${nombre}`);
    if (response.ok) {
      const datos = await response.json();
      return datos.likes || [];
    } else {
      console.error(`Error al obtener likes del usuario desde el servidor: ${response.status}`);
      return [];
    }
  } catch (error) {
    console.error('Error al obtener likes del usuario desde el servidor:', error);
    return [];
  }
}

// Función para agregar un artículo al DOM
function agregarArticulo(articulo) {
  escribir.innerHTML += `<article>
      <p>${articulo.autor}</p>
      <h2>${articulo.nombre}</h2>
      <p>${articulo.contenido}</p>
      ${articulo.imagenes ? `<img src="${articulo.imagenes}">` : ""}
      <div class="likes">
      <input type="checkbox" class= "custom-checkbox" id="likes${articulo.id}" name="opciones" value="like" data-articulo-id="${articulo.id}" ${nombre === "" ? "disabled" : ""} ${articulo.liked ? "checked" : ""}>
      <label for="likes${articulo.id}" class="checkbox-label"></label> ${articulo.likes}</div>
      
    </article>`;
}

// Obtener datos y mostrar artículos
async function mostrarArticulos() {
  try {
    const response = await fetch(window.location.href + "data");
    if (!response.ok) {
      throw new Error(`Error al obtener datos del servidor: ${response.status}`);
    }

    const data = await response.json();
    data.liked = await obtenerLikesUsuario();
    
    for (const articulo of data.articulos) {
      articulo.liked = data.liked.includes(articulo.id.toString());
      agregarArticulo(articulo);
    }
  } catch (error) {
    console.error('Error al obtener y mostrar artículos:', error);
  }
}

// Llamada a la función para mostrar artículos
mostrarArticulos();

// Agrega un solo manejador de eventos a #escribir para delegar eventos de cambio
escribir.addEventListener('change', async (event) => {
  if (event.target.type === 'checkbox') {
    const articuloId = event.target.dataset.articuloId;
    
    // Realiza la solicitud POST para actualizar la base de datos
    try {
      const response = await fetch("/likes", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user: nombre,
          id: articuloId
        })
      });

      if (!response.ok) {
        throw new Error(`Error al enviar la respuesta: ${response.status}`);
      }
    } catch (error) {
      console.error('Error al enviar la respuesta:', error);
    }
  }
});
