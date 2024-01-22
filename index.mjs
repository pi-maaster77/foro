import express from "express";
import { resolve, basename } from "path";
import { readdir, writeFile } from 'fs/promises';

const ip = "192.168.2.128";
const port = 3000;
const directorio = './articulos';
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req,res) => {
    res.sendFile(resolve("index.html"))
});

app.get("/style", (req,res) => {
    res.sendFile(resolve("style.css"))
});

app.get("/crear", (req,res) => {
    res.sendFile(resolve("crear/crear.html"))
});

app.get("/script", (req,res) => {
    res.sendFile(resolve("main.js"))
});

app.get("/articulos/:articulo", (req,res) => {
    res.sendFile(resolve(`articulos/${req.params.articulo}.json`));
});

app.get("/data", async (req,res) => {
    try {
        const archivos = await readdir(directorio);
        const nombres  = archivos.map(nombre => basename(nombre, '.json'));
        console.log('Archivos JSON en el directorio (sin extensiones):');
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
app.post("/crear", async (req, res) => {
    const { titulo, contenido, imagen } = req.body;

    // Asegurar que el título sea único
    const tituloUnico = titulo.replace(/\s+/g, '_').toLowerCase();

    // Crear un nuevo objeto con los datos del formulario
    const nuevoArticulo = {
        titulo,
        contenido,
        imagen: imagen || "" // Si imagen es undefined, asignar una cadena vacía
    };

    // Generar un nombre único para el nuevo archivo JSON
    const nombreArchivo = `${tituloUnico}.json`;

    // Escribir los datos en un nuevo archivo JSON
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
app.listen(port, () => {
    console.log("Iniciando servidor...");
});
