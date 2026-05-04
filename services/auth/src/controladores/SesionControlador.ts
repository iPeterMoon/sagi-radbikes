import { Request, Response } from "express";
import { IServicioInicioSesion } from "../negocio/IServicioInicioSesion";
import { LoginDTO } from "../negocio/DTOsEntrada/LoginDTO";
import { serializarJsonSeguro } from "../utils/serializarJson";

const SESSION_TIMEOUT_HOURS = Number(process.env.SESSION_TIMEOUT_HOURS || "24");
const SAFE_SESSION_TIMEOUT_HOURS =
  Number.isFinite(SESSION_TIMEOUT_HOURS) && SESSION_TIMEOUT_HOURS > 0
    ? SESSION_TIMEOUT_HOURS : 24;

export class SesionControlador {
  constructor(private servicio: IServicioInicioSesion) {}

  async iniciarSesion(req: Request, res: Response): Promise<void> {
    try {
      const dto: LoginDTO = req.body;
      const sesion = await this.servicio.iniciarSesion(dto);
      res
        .cookie("token", sesion.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: SAFE_SESSION_TIMEOUT_HOURS * 60 * 60 * 1000, // ms in Express
        })
        .json(serializarJsonSeguro(sesion));
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  async cerrarSesion(req: Request, res: Response): Promise<void> {
    try {
      const token =
        req.headers.authorization?.replace("Bearer ", "") ||
        req.cookies?.token;
      if (token) await this.servicio.cerrarSesion(token);
      res.clearCookie("token").json({ message: "Logout exitoso" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async validar(req: Request, res: Response): Promise<void> {
    try {
      const token =
        req.headers.authorization?.replace("Bearer ", "") ||
        req.cookies?.token;
      if (!token) {
        res.status(401).json({ error: "No token provided" });
        return;
      }
      const usuario = await this.servicio.validarToken(token);
      res.json(usuario);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }
}