const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const fs = require("fs").promises;                         
const app   = express();
// require("dotenv").config()
/* 
en el caso de no usar docker, descomentar la linea anterior y escribir un archivo ".env" siguiendo la siguiente plantilla: 

    IP_DB = "ip de la base de datos"
    USER_DB = "usuario que usara el servidor"
    PASSWORD_DB = "contraseña de la base de datos"
    DB = "nombre de la base de datos"
    PORT_DB = puerto_de_la_base_de_datos
    PORT_SERVER = puerto_donde_se_ejecutara_la_aplicacion_web

*/


const connection = mysql.createConnection({
    host: process.env.IP_DB || "localHost",
    user: process.env.USER_DB || "foro",
    password: process.env.PASSWORD_DB || "123456",
    database: process.env.DB || "foro",
    port: process.env.PORT_DB || 3306
}); //conectarse con la base de datos
const port  = process.env.PORT_SERVER;  
ordenar = (a , b) => b.likes - a.likes;
/* 
    esta funcion define como se ordenaran los articulos. Se pueden usar los siguientes parametros: 
    likes
    id
    creacion

*/
 


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Configuracion basica de express.

app.get("/", (req,res) => {
    res.sendFile(path.resolve("html/index.html"));
}); // Pagina de inicio.
app.get("/style", (req,res) => {
    res.sendFile(path.resolve("styles/style.css"));
}); // Declaracion de los estilos.
app.get("/script/:scr", (req,res) => {
    const scr = req.params.scr;
    res.sendFile(path.resolve(`javascript/${scr}.js`));
}); // Envio de los archivos de javascript
app.get("/assets/:img", (req,res) => {
    const img = req.params.img;
    res.sendFile(path.resolve(`assets/${img}.png`));
}); // Envio de las imagenes.
app.get("/data", (req,res) => {
    connection.query(`SELECT * FROM articulos`, (error, results, fields) => {
        
        if (results.length > 0) {
            ordenado = results.sort(ordenar);
            res.json({articulos : ordenado});
        } else {
            res.status(401).json({ mensaje: "no hay articulos aqui"});
        }
        if (error) throw error;
    })
}); // Envio de los articulos.


app.get("/crear", (req,res) => {
    res.sendFile(path.resolve("html/crear.html"))
}); // Enviar la pagina de creacion de articulos
app.post("/crear", async (req, res) => {
    const respuesta = req.body;
    connection.query(
        "INSERT INTO articulos(nombre, contenido, autor, imagenes, creacion, likes) VALUES(? ,? , ?, ?, ?, 0);",
        [respuesta.nombre, respuesta.contenido, respuesta.autor, respuesta.imagenes, new Date()])
}); // Uso de sql para insertar en la tabla articulos, un articulo con las caracteristicas ingresadas por el usuario.

/*
    El anterior bloque de codigo cumple la funcion de crear nuevos articulos. 
*/

app.get("/ingresar", (req,res) => {
    res.sendFile(path.resolve("html/ingresar.html"))
}); // Enviar la pagina de ingreso.

app.post("/ingresar", (req, res) => {
    const { user, passwd } = req.body; // Recibir el usuario y la contraseña, 
    connection.query(`SELECT name, passwd FROM users WHERE name = ? AND passwd = ?`, [user, passwd], (error, results, fields) => {
        if (error) throw error;
        if (results.length > 0) { // Verificar si el usuario y la contraseña son los correctos.
            const usuarioEncontrado = results[0]; 
            res.json({ redireccion: true, usuario: usuarioEncontrado }); // De ser el caso, enviar el usuario que se usara en la sesion.
        } else {
            res.status(401).json({ mensaje: "Nombre de usuario o contraseña incorrectos" }); // Caso contrario, enviar un mensaje de error informando que el usuario y la contraseña no corresponden
        }
    });
}); 
/*
    El anterior bloque de codigo cumplia la funcion del inicio de sesion.
*/


app.get("/registrar", (req,res) => {
    res.sendFile(path.resolve("html/registrar.html"))
}); // Enviar la pagina de inicio de sesion.
app.post("/registrar",(req, res) => {
    const { user, passwd } = req.body;
    connection.query(`SELECT * FROM users WHERE name = ?`, user, (error, results, fields) => {
        if (error) throw error; // Verificar si hay algun error.
        if (results.length > 0) {  // Verificar si el usuario existe.
            res.status(401).json({ mensaje: "el usuario ya existe. Use otro nombre"}); // De ser el caso, informarle al usuario que use otro nombre de usuario.
        } else { // Caso contrario, crear nuevo usuario.
            connection.query(`INSERT INTO users (name,passwd) VALUES (?,?)`, [user, passwd], async (error, results,fields) =>  {
                if(error){
                    console.error(`Error al crear el usuario: ${error}`);
                    res.status(500).json({ mensaje: "Error interno al crear el usuario" });
                } else {
                    const jsonContent = JSON.stringify({ "likes": [] }, null, 4);
                    await fs.writeFile(`likes/${user}.json`, jsonContent, { flag: 'w' });
                    res.status(200).json({redireccion: true, mensaje: "Usuario creado con éxito" });
        }})}
    });
});

/*
    El anterior bloque de codigo cumplia la funcion de crear usuarios
*/


app.get("/likes/:user", (req, res) => {
    const user = req.params.user;
    res.sendFile(path.resolve(`likes/${user}.json`))
}); // obtener informacion sobre los likes que dio cada usuario para el lado del cliente.
app.post("/likesd", async (req, res) => {
    try {
        const { id, user } = req.body; // se recibe la encuesta 
        const datos = await fs.readFile(`likes/${user}.json`, "utf8"); // obtener informacion sobre los likes que dio cada usuario para el lado del servidor.
        const nuevos = JSON.parse(datos); // convierte en objeto los datos obtenidos

        const indice = nuevos.likes.indexOf(id); // obtiene el indice del articulo al que se dio like.
        const inc = indice === -1; // verifica si tiene indice valido el like añadido.

        if (inc) {
            nuevos.likes.push(id); // en el caso de que no existan, se añaden a la lista de articulos que le gustaron al usuario.
        } else {
            nuevos.likes.splice(indice, 1); // de no ser este el caso, se eliminan.
        }
        connection.query("SELECT * FROM articulos WHERE id = ?", [id], (error, resultados) => { // busca el articulo con el id al que el usuario le dio like.
            if (error) {
                console.error(error);
                return;
            } // verificar si hay algun error.

            if (resultados.length > 0) { // verificar si se obutuvo un resultado.
                let valorActual = resultados[0].likes; // obtener los likes del articulo.
                valorActual = inc ? valorActual + 1 : valorActual - 1; 
                connection.query("UPDATE articulos SET likes = ? WHERE id = ?", [valorActual, id], (errorActualizacion) => {
                    if (errorActualizacion) {
                        console.error(errorActualizacion);
                        return;
                    }
                }); // actualizar los likes del articulo en la base de datos.
            } else {
                console.log(`No se encontró ningún elemento con ID ${id}.`);
            }
        });
        await fs.writeFile(`likes/${user}.json`, JSON.stringify(nuevos, null, 2), "utf8");

        res.status(200).send("Operación completada correctamente");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error interno del servidor");
    }
});
/* 
    El anterior bloque de codigo esta relacionado con la parte de los likes a los articulos.
*/

app.listen(port, () => {
    console.log(`el servidor esta en escucha${port}`);
}); // Iniciar el servidor en el puerto establecido anteriormente.
