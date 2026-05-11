import "dotenv/config";
import express from "express";
import { POSAccesoDatos } from "./datos/POSAccesoDatos";
import { ServicioVenta } from "./negocio/ServicioVenta";
import { POSControlador } from "./controladores/POSControlador";

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

// ---------- Health ----------
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "pos-service", port: PORT });
});

// ---------- Wiring ----------
const accesoDatos = new POSAccesoDatos();
const servicio = new ServicioVenta(accesoDatos);
const controlador = new POSControlador(servicio);

// ---------- Routes ----------

// Catálogo (lectura de productos disponibles en POS)
app.get("/productos", controlador.buscarProductos);

// Venta
app.post("/venta", controlador.registrarVenta);

// Carrito (estado en memoria por instancia del servicio)
app.get("/carrito", controlador.obtenerCarrito);
app.post("/carrito/agregar", controlador.agregarProductoCarrito);
app.patch("/carrito/:idProducto/cantidad", controlador.cambiarCantidad);
app.delete("/carrito/:idProducto", controlador.eliminarProductoCarrito);
app.delete("/carrito", controlador.limpiarCarrito);

// ---------- Start ----------
app.listen(PORT, () => {
  console.log(`[pos-service] Corriendo en http://localhost:${PORT}`);
});