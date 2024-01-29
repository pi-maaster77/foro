nombre = localStorage.getItem("username") || "", 
  
console.log(nombre)
sesion = (usuario) => {
nav = document.getElementById("nav")
    if(usuario.length > 0){
        nav.innerHTML = `<a onclick="logout()">${usuario}</a><hr>`
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