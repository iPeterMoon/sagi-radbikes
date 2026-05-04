import "dotenv/config";
import express from "express";
import { CatalogoAccesoDatos } from "./datos/CatalogoAccesoDatos";
import { ServicioInventario } from "./negocio/ServicioInventario";
import { InventarioControlador } from "./controladores/InventarioControlador";

const app = express();
app.use(express.json());

const accesoDatos = new CatalogoAccesoDatos();
const servicio = new ServicioInventario(accesoDatos);
const controlador = new InventarioControlador(servicio);

app.get("/health", (_req, res) => res.json({ status: "ok", service: "catalog" }));

// Productos
app.get("/productos",      (req, res) => controlador.obtenerProductos(req, res));
app.get("/productos/:id",  (req, res) => controlador.obtenerPorId(req, res));
app.post("/productos",     (req, res) => controlador.crearProducto(req, res));
app.put("/productos",      (req, res) => controlador.actualizarProducto(req, res));
app.delete("/productos/:id",(req, res) => controlador.eliminarProducto(req, res));

// Catálogos
app.get("/categorias",    (req, res) => controlador.obtenerCategorias(req, res));
app.get("/marcas",        (req, res) => controlador.obtenerMarcas(req, res));
app.get("/subcategorias", (req, res) => controlador.obtenerSubCategorias(req, res));
app.get("/etiquetas",     (req, res) => controlador.obtenerEtiquetas(req, res));

app.listen(3002, () => console.log("Catalog service running on :3002"));