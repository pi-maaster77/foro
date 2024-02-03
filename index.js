// importar librerias

const express = require("express");
const path = require("path");
const mysql = require('mysql2');
const fs = require("fs").promises

// definir constantes                         
const port  = process.env.PORT_SERVER;                           
const app   = express();

const connection = mysql.createConnection({
    host: process.env.IP_DB,
    user: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.DB,
    port: process.env.PORT_DB
});

ordenar = (a , b) => b.likes - a.likes;
 
// configurar express

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// definir donde enviarte dependiendo de la barra 
app.get("/", (req,res) => {
    res.sendFile(path.resolve("index.html"));
});
app.get("/style", (req,res) => {
    res.sendFile(path.resolve("style.css"));
});
app.get("/script", (req,res) => {
    res.sendFile(path.resolve("main.js"));
});
app.get("/login", (req,res) => {
    res.sendFile(path.resolve("login.js"));
});
app.get("/imagen/:img", (req,res) => {
    const img = req.params.img;
    res.sendFile(path.resolve(`assets/${img}.png`))
});
// listar los articulos
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
});

// todo lo relacionado con crear articulos
app.get("/crear", (req,res) => {
    res.sendFile(path.resolve("html/crear.html"))
});
app.post("/crear", async (req, res) => {
    const respuesta = req.body;
    connection.query(
        "INSERT INTO articulos(nombre, contenido, autor, creacion, likes, imagenes) VALUES(? ,? , ?, ?, 0, ?);",
        [respuesta.nombre, respuesta.contenido, respuesta.autor, new Date(), respuesta.imagenes])
});

app.get("/ingresar", (req,res) => {
    res.sendFile(path.resolve("html/ingresar.html"))
});
app.post("/ingresar", (req, res) => {
    const { user, passwd } = req.body;
    const usuario = [user, passwd];
    connection.query(`SELECT * FROM users WHERE name = ? AND passwd = ?`, usuario, (error, results, fields) => {
        if (results.length > 0) {
            const usuarioEncontrado = results[0];
            // Redirige a otra página en caso de éxito
            res.json({ redireccion: true, usuario: usuarioEncontrado });
        } else {
            // Envía un mensaje de error en caso de usuario no encontrado
            res.status(401).json({ mensaje: 'Nombre de usuario o contraseña incorrectos' });
        } if (error) throw error;
    });
});

app.get("/registrar", (req,res) => {
    res.sendFile(path.resolve("html/registrar.html"))
});
app.post("/registrar",(req, res) => {
    const { user, passwd } = req.body;
    connection.query(`SELECT * FROM users WHERE name = ?`, user, (error, results, fields) => {
        if (results.length > 0) {    
            res.status(401).json({ mensaje: "el usuario ya existe"});
        } else {
            connection.query(`INSERT INTO users (name,passwd) VALUES (?,?)`, [user, passwd], async (error, results,fields) =>  {
                if(error){
                    console.error('Error al crear el usuario:', error);
                    res.status(500).json({ mensaje: 'Error interno al crear el usuario' });
                } else {
                    await fs.writeFile(`likes/${user}.json`, '{"likes":[]}', 'utf8');
                    res.status(200).json({redireccion: true, mensaje: 'Usuario creado con éxito' });
        }})}
        if (error) throw error;
    });
});

app.get('/likes/:user', (req, res) => {
    const user = req.params.user;
    res.sendFile(path.resolve(`likes/${user}.json`))
})
app.post("/likes", async (req, res) => {
    try {
        const { id, user } = req.body;

        // Lee el contenido del archivo JSON de manera asíncrona
        const datos = await fs.readFile(`likes/${user}.json`, 'utf8');
        const nuevos = JSON.parse(datos);

        const indice = nuevos.likes.indexOf(id);
        const inc = indice === -1 ? true : false;

        if (inc) {
            nuevos.likes.push(id);
        } else {
            nuevos.likes.splice(indice, 1);
        }

        // Realiza la actualización en la base de datos (conexión a la base de datos)
        connection.query("SELECT * FROM articulos WHERE id = ?", [id], (error, resultados) => {
            if (error) {
                console.error(error);
                return;
            }

            if (resultados.length > 0) {
                let valorActual = resultados[0].likes;
                valorActual = inc ? valorActual + 1 : valorActual - 1;
                connection.query('UPDATE articulos SET likes = ? WHERE id = ?', [valorActual, id], (errorActualizacion) => {
                    if (errorActualizacion) {
                        console.error(errorActualizacion);
                        return;
                    }
                });
            } else {
                console.log(`No se encontró ningún elemento con ID ${id}.`);
            }
        });

        // Escribe el nuevo contenido en el archivo JSON de manera asíncrona
        await fs.writeFile(`likes/${user}.json`, JSON.stringify(nuevos, null, 2), 'utf8');

        res.status(200).send('Operación completada correctamente');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
});

app.listen(port, () => {
    console.log(`el servidor esta en escucha${port}`);
});
