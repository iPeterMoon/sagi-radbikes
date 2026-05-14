import { Request, Response } from "express";
import { IServicioInicioSesion } from "../negocio/IServicioInicioSesion";
import { LoginDTO } from "../negocio/DTOsEntrada/LoginDTO";
import { serializarJsonSeguro } from "../utils/serializarJson";

/**
 * Controlador de sesión que maneja las rutas relacionadas con la autenticación de usuarios.
 * Utiliza el servicio de inicio de sesión para realizar las operaciones de autenticación,
 * generación de tokens y validación de sesiones.
 */
const SESSION_TIMEOUT_HOURS = Number(process.env.SESSION_TIMEOUT_HOURS || "24");
/**
 * Duración de sesión validada: mínimo 1 hora, default 24 h. Si SESSION_TIMEOUT_HOURS es inválido, se usará 24 horas.
 * Este valor se utiliza para configurar la expiración del token JWT y la cookie de sesión.
 */
const SAFE_SESSION_TIMEOUT_HOURS =
  Number.isFinite(SESSION_TIMEOUT_HOURS) && SESSION_TIMEOUT_HOURS > 0
    ? SESSION_TIMEOUT_HOURS : 24;

/**
 * Controlador de sesión que maneja las rutas relacionadas con la autenticación de usuarios.
 * Utiliza el servicio de inicio de sesión para realizar las operaciones de autenticación,
 * generación de tokens y validación de sesiones.
 */
export class SesionControlador {
  constructor(private servicio: IServicioInicioSesion) { }

  /**
   * Maneja la solicitud de inicio de sesión. Recibe las credenciales del usuario, delega la autenticación al servicio y, si es exitosa, establece una cookie con el token JWT y devuelve los datos de sesión.
   */
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
      console.error("[iniciarSesion] ERROR:", error);
      res.status(401).json({ error: error.message });
    }
  }

  /**
   * Maneja la solicitud de cierre de sesión. Invalida el token JWT y elimina la cookie de sesión.
   */
  async cerrarSesion(req: Request, res: Response): Promise<void> {
    try {
      const token =
        req.headers.authorization?.replace("Bearer ", "") ||
        req.cookies?.token;
      if (token) await this.servicio.cerrarSesion(token);
      res.clearCookie("token").json({ message: "Logout exitoso" });
    } catch (error: any) {
      console.error("[cerrarSesion] ERROR:", error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Maneja la solicitud de validación de token. Verifica la validez del token JWT y devuelve los datos del usuario autenticado.
   */
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
      console.error("[validar] ERROR:", error);
      res.status(401).json({ error: error.message });
    }
  }
}