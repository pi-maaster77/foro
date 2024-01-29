// importar librerias

const express = require("express");
const path = require("path");
const { readdir, writeFile } = require('fs/promises');
const mysql = require('mysql2');
require("dotenv/config");

// definir constantes 
const ip            = process.env.ip                            ;
const port          = process.env.port                          ; 
const directorio    = './articulos'                             ;
const app           = express()                                 ;


const connection = mysql.createConnection({
    host: "localHost",
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
});





// configurar express
app.use(express.urlencoded({ extended: true }))                 ;
app.use(express.json())                                         ;

// definir donde enviarte dependiendo de la barra 
app.get("/", (req,res) => {
    res.sendFile(path.resolve("index.html"))                    ;
})                                                              ;
app.get("/style", (req,res) => {
    res.sendFile(path.resolve("style.css"))                     ;
})                                                              ;
app.get("/script", (req,res) => {
    res.sendFile(path.resolve("main.js"))
});

app.get("/articulos/:articulo", (req,res) => {
    res.sendFile(path.resolve(`articulos/${req.params.articulo}.json`));
});

// listar los articulos
app.get("/data", async (req,res) => {
    try {
        const archivos = await readdir(directorio);
        const nombres  = archivos.map(nombre => path.basename(nombre, '.json'));
        console.log('articulos guardados:');
        nombres.forEach(nombre => {
            console.log(nombre);
        });
        res.send({
            art: nombres
        });
    } catch (error) {
        console.error('Error al leer el directorio:', error);
        res.status(500).send("Error al obtener la lista de archivos");
    }
});

// todo lo relacionado con crear articulos
app.get("/crear", (req,res) => {
    res.sendFile(path.resolve("html/crear.html"))
});
app.post("/crear", async (req, res) => {
    const { titulo, contenido, imagen } = req.body;
    const tituloUnico = titulo.replace(/\s+/g, '_').toLowerCase();
    const nuevoArticulo = {
        titulo,
        contenido,
        imagen: imagen || "" 
    };
    const nombreArchivo = `${tituloUnico}.json`;
    try {
        await writeFile(`${directorio}/${nombreArchivo}`, JSON.stringify(nuevoArticulo));    
        res.set({
            "content-type" : "text/html; charset=utf-8"
        });
        res.send(`
        ¡articulo creado con exito!
        <a href=http://${ip+':'+port}>volver al inicio</a>`);
    } catch (error) {
        console.error('Error al escribir el archivo JSON:', error);
        res.status(500).send("Error al crear el artículo");
    }
});

app.get("/ingresar", (req,res) => {
    res.sendFile(path.resolve("html/ingresar.html"))
});
app.post("/ingresar", async (req, res) => {
    const { user, passwd } = req.body;
    const usuario = [user, passwd];
    connection.query(`SELECT * FROM users WHERE name = ? AND passwd = ?`, usuario, (error, results, fields) => {
        if (results.length > 0) {
            const usuarioEncontrado = results[0];
            // Redirige a otra página en caso de éxito
            res.json({ redireccion: '/', usuario: usuarioEncontrado });
        } else {
            // Envía un mensaje de error en caso de usuario no encontrado
            res.status(401).json({ mensaje: 'Nombre de usuario o contraseña incorrectos' });
        }
        if (error) throw error;
    });
});
app.get("/registrar", (req,res) => {
    res.sendFile(path.resolve("html/registrar.html"))
});
app.post("/registrar", async (req, res) => {
    const { user, passwd } = req.body;
    const usuario = [user, passwd];


    connection.query(`SELECT * FROM users WHERE name = ?`, user, (error, results, fields) => {
        if (results.length > 0) {
            const usuarioEncontrado = results[0];
            
            res.status(401).json({ mensaje: "el usuario ya existe"});
        } else {
            connection.query(`INSERT INTO users(name,passwd) VALUES (?,?)`, usuario, (error, results,fields) =>  {
                if(error){
                    console.error('Error al crear el usuario:', error);
                    res.status(500).json({ mensaje: 'Error interno al crear el usuario' });
                } else {
                    res.status(200).json({redireccion: "/", mensaje: 'Usuario creado con éxito' });
                }
    
    })
            
        }
        if (error) throw error;
    });
});


app.listen(port, () => {
    console.log("Iniciando servidor...");
});
