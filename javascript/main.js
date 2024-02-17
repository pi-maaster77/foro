const escribir = document.getElementById("escribir"); // Obtener donde se escribiran los articulos
const nombre = localStorage.getItem("username") || ""; // Obtener el usuario.
async function obtenerLikesUsuario() {
  if(nombre.length === 0) return [] // Verificar si hay un usuario
  try {
    const response = await fetch(`/likes/${nombre}`); // Obtener los articulos que le gustaron al usuario.
    if (response.ok) { // Si no hay errores, proceder.
      const datos = await response.json();
      return datos.likes || [];
    } else { // Caso contrario, enviar errores
      console.error(`Error al obtener likes del usuario desde el servidor: ${response.status}`);
      return [];
    }
  } catch (error) {
    console.error(`Error al obtener likes del usuario desde el servidor: ${error}`);
    return [];
  }
}
function agregarArticulo(articulo) { // Escribir los articulos.
  escribir.innerHTML += `<article>
      <p>${articulo.autor}</p> 
      <h2>${articulo.nombre}</h2>
      <p>${articulo.contenido}</p>
      ${articulo.imagenes ? `<img src="${articulo.imagenes}">` : ""}
      <div class="likes">
      <input type="checkbox" class= "custom-checkbox" id="likes${articulo.id}" name="opciones" value="like" data-articulo-id="${articulo.id}" ${nombre === "" ? "disabled" : ""} ${articulo.liked ? "checked" : ""}>
      <label for="likes${articulo.id}" class="checkbox-label"></label> <span id="cantidad-likes${articulo.id}">${articulo.likes}</span></div>
      
    </article>`;
}

async function actualizarLikes() { // Actualizar los likes.
  const likesArticulos = await fetch(`${window.location.href}data`) // Obtener los likes actualizados.
  const cantidad = await likesArticulos.json() // Transformar lo obtenido en objeto.
  for(articulo of cantidad.articulos){ // Por cada articulo, obtener el contador de likes [1] y actualizarlo [2].
    const actualizar = document.getElementById(`cantidad-likes${articulo.id}`) // 1
    actualizar.innerHTML = articulo.likes // 2
    
  }
}
async function mostrarArticulos() {
  try {
    const response = await fetch(`${window.location.href}data`); // Obtener los datos de la pagina api.
    if (!response.ok) { // Verificar si el servidor respondio
      throw new Error(`Error al obtener datos del servidor: ${response.status}`); // De no ser el caso, Informar.
    }

    const data = await response.json(); // Convertir lo obtenido
    data.liked = await obtenerLikesUsuario(); // Obtener los articulos que le gustaron al usuario.
    
    for (const articulo of data.articulos) { // Por cada articulo, verificar si el usuario le dio like [1] y escribir el articulo [2].
      articulo.liked = data.liked.includes(articulo.id.toString()); // 1
      agregarArticulo(articulo); // 2
    }
  } catch (error) { // Verificar si hay algun error y mostrarlo.
    console.error(`Error al obtener y mostrar artículos: ${error}`);
  }
}

mostrarArticulos(); // Ejecutar la funcion anteriormente descrita.

escribir.addEventListener("change", async (event) => { // Verificar si alguna casilla se marco o desmarco.
  if (event.target.type === "checkbox") {
    const articuloId = event.target.dataset.articuloId;
    try {
      const response = await fetch("/likesd", { // Enviar la casilla marcada y el usuario.
        method: "POST",
        headers: {
          "Content-Type": "application/json"
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
      console.error(`Error al enviar la respuesta: ${error}`);
    }
  }
  actualizarLikes() // Actualizar los likes cuando se suba la encuesta.
});

setInterval(actualizarLikes, 10000); // Actuakuzar los likes cada 10000 milisegundos (10 segundos).