obtener_datos = apiUrl => {
    const escribir = document.getElementById("escribir")
    fetch(apiUrl+"/data")
    .then(response => response.json())
    .then(datos => {
        datos.art.forEach(articulo => {
            fetch(apiUrl+"/articulos/"+articulo)
            .then(response => response.json())
            .then(data =>{
            let parcial = 
            `<article>
            <h2>${data.titulo}</h2>
            <p>${data.contenido}</p>`
            if(data.imagen != ""){
            parcial  += `<img src="${data.imagen}">`
            }
            parcial += `</article>`
            escribir.innerHTML += parcial
        })
        });

    })
    .catch(error => {
        console.error('Error al obtener el objeto:', error);
        return error
    });
}

obtener_datos("http://192.168.2.128:3000")
crear = () => {
    window.location.href = "http://192.168.2.128:3000/crear"
}

