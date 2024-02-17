nombre = localStorage.getItem("username") || ""; // Obtener el usuario guardado en el navegador.
function sesion (usuario) {
    nav = document.getElementById("nav")
    if(usuario.length > 0){ // Si hay un usuario, colocar su nombre y el boton de cerrar sesion.
        nav.innerHTML = 
        `${usuario}<hr>
        <button onclick="logout()">cerrar sesion</button>`
    }
    else { // Caso contrario, colocar los botones de iniciar sesion y registrar usuario.
        nav.innerHTML = 
        `<button onclick="window.location.href = '/ingresar'">ingresar</button><hr>
        <button onclick="window.location.href = '/registrar'">registrar</button>`
    }
}
sesion(nombre)
    
  
function logout() {
    if (window.confirm("¿Quieres cerrar sesion?")) { // Preguntar si el usuario quiere cerrar sesion.
        localStorage.clear();
        location.reload();
        // De ser el caso, borrar las cookies y recargar la pagina.
    }
}