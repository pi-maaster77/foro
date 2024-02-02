nombre = localStorage.getItem("username") || "",
sesion = (usuario) => {
nav = document.getElementById("nav")
    if(usuario.length > 0){
        nav.innerHTML = 
        `<a>${usuario}</a><hr>
        <button onclick="logout()">cerrar sesion</button>`
    }
    else {
        nav.innerHTML = 
        `<button onclick="window.location.href = '/ingresar'">ingresar</button><hr>
        <button onclick="window.location.href = '/registrar'">registrar</button>`
    }
}
sesion(nombre)
    
  
logout = () => {
    var respuesta = window.confirm("¿Quieres cerrar sesion?");
    if (respuesta) {
        localStorage.clear();
        location.reload();
    }
}