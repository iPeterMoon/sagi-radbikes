import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { AuthAccesoDatos } from "./datos/AuthAccesoDatos";
import { ServicioInicioSesion } from "./negocio/ServicioInicioSesion";
import { SesionControlador } from "./controladores/SesionControlador";

const app = express();
app.use(express.json());
app.use(cookieParser());

const accesoDatos = new AuthAccesoDatos();
const servicio = new ServicioInicioSesion(accesoDatos);
const controlador = new SesionControlador(servicio);

app.get("/health", (_req, res) => res.json({ status: "ok", service: "auth" }));
app.post("/login",  (req, res) => controlador.iniciarSesion(req, res));
app.post("/logout", (req, res) => controlador.cerrarSesion(req, res));
app.get("/validate",(req, res) => controlador.validar(req, res));

app.listen(3001, () => console.log("Auth service running on :3001"));