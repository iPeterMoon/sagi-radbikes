import "dotenv/config";
import express from "express";
import multer from "multer";
import { CatalogoAccesoDatos } from "./datos/CatalogoAccesoDatos";
import { ServicioInventario } from "./negocio/ServicioInventario";
import { InventarioControlador } from "./controladores/InventarioControlador";
import { startStockWorker } from "./queue/stockWorker";

const app = express();
const upload = multer();
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
app.patch("/productos",    (req, res) => controlador.ajustarStock(req, res));
app.delete("/productos/:id",(req, res) => controlador.eliminarProducto(req, res));

// Catálogos
app.get("/categorias",    (req, res) => controlador.obtenerCategorias(req, res));
app.post("/categorias",   (req, res) => controlador.crearCategoria(req, res));
app.get("/marcas",        (req, res) => controlador.obtenerMarcas(req, res));
app.post("/marcas",       (req, res) => controlador.crearMarca(req, res));
app.get("/subcategorias", (req, res) => controlador.obtenerSubCategorias(req, res));
app.post("/subcategorias", (req, res) => controlador.crearSubCategoria(req, res));
app.get("/etiquetas/:productoId", (req, res) => controlador.obtenerEtiquetas(req, res));
app.post("/etiquetas",    (req, res) => controlador.crearEtiqueta(req, res));
app.delete("/etiquetas/:id", (req, res) => controlador.eliminarEtiqueta(req, res));

// Imágenes
app.post(
  "/productos/:id/imagenes",
  upload.array("archivos"),
  (req, res) => controlador.agregarImagenes(req, res),
);
app.delete("/imagenes/:id", (req, res) => controlador.eliminarImagen(req, res));
app.patch("/imagenes/:id/principal", (req, res) => controlador.establecerImagenPrincipal(req, res));

app.listen(3002, () => {
  console.log("Catalog service running on :3002");
  startStockWorker();
});