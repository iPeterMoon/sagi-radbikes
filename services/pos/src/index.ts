import "dotenv/config";
import express from "express";
import { POSAccesoDatos } from "./datos/POSAccesoDatos";
import { ServicioVenta } from "./negocio/ServicioVenta";
import { POSControlador } from "./controladores/POSControlador";

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware para JSON en endpoints que no sean /venta
app.use((req, res, next) => {
  // Excluir la ruta /venta del parsing de JSON (será text/xml)
  if (req.path === "/venta" && req.method === "POST") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Middleware personalizado para aceptar XML text en la ruta /venta
app.post("/venta", express.text({ type: "application/xml" }));

/**
 * Endpoint de verificación de salud del servicio (Healthcheck).
 * Utilizado para monitorear el estado del microservicio.
 */
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "pos-service", port: PORT });
});

// ---------- Inyección de Dependencias Manual ----------
const accesoDatos = new POSAccesoDatos();
const servicio = new ServicioVenta(accesoDatos);
const controlador = new POSControlador(servicio);

// ---------- Definición de Rutas ----------

/**
 * Catálogo: Lectura de productos disponibles en el Punto de Venta (POS).
 */
app.get("/productos", controlador.buscarProductos);

/**
 * Venta: Registro de una nueva transacción de venta.
 */
app.post("/venta", controlador.registrarVenta);

/**
 * Carrito: Gestión del estado del carrito en memoria.
 * Nota: El estado vive por instancia del servicio.
 */
app.get("/carrito", controlador.obtenerCarrito);
app.post("/carrito/agregar", controlador.agregarProductoCarrito);
app.patch("/carrito/:idProducto/cantidad", controlador.cambiarCantidad);
app.delete("/carrito/:idProducto", controlador.eliminarProductoCarrito);
app.delete("/carrito", controlador.limpiarCarrito);

// ---------- Inicio del Servidor ----------
app.listen(PORT, () => {
  console.log(`[pos-service] Corriendo en http://localhost:${PORT}`);
});