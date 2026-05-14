import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { AuthAccesoDatos } from "./datos/AuthAccesoDatos";
import { ServicioInicioSesion } from "./negocio/ServicioInicioSesion";
import { SesionControlador } from "./controladores/SesionControlador";

/**
 * Punto de entrada de la aplicación. Configura el servidor Express, las rutas y los controladores para manejar las 
 * operaciones de autenticación de usuarios, como inicio de sesión, cierre de sesión y validación de tokens. 
 * Utiliza el servicio de inicio de sesión para delegar la lógica de negocio relacionada con la autenticación.
 */
const app = express();
app.use(express.json());
app.use(cookieParser());

/* Inicialización de dependencias */
const accesoDatos = new AuthAccesoDatos();
const servicio = new ServicioInicioSesion(accesoDatos);
const controlador = new SesionControlador(servicio);

/* Rutas */
app.get("/health", (_req, res) => res.json({ status: "ok", service: "auth" }));
app.post("/login", (req, res) => controlador.iniciarSesion(req, res));
app.post("/logout", (req, res) => controlador.cerrarSesion(req, res));
app.get("/validate", (req, res) => controlador.validar(req, res));

/* Inicio del servidor */
app.listen(3001, () => console.log("Auth service running on :3001"));