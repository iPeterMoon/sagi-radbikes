import { IServicioInicioSesion } from "../negocio/IServicioInicioSesion";
import { LoginDTO } from "../negocio/DTOsEntrada/LoginDTO";
import { NextRequest, NextResponse } from "next/server";

/** Duración de sesión leída de la variable de entorno SESSION_TIMEOUT_HOURS. */
const SESSION_TIMEOUT_HOURS = Number(process.env.SESSION_TIMEOUT_HOURS || "24");
/** Duración de sesión validada: mínimo 1 hora, default 24 h. */
const SAFE_SESSION_TIMEOUT_HOURS =
  Number.isFinite(SESSION_TIMEOUT_HOURS) && SESSION_TIMEOUT_HOURS > 0
    ? SESSION_TIMEOUT_HOURS
    : 24;
/** Duración en segundos para la cookie de sesión. */
const SESSION_TIMEOUT_SECONDS = SAFE_SESSION_TIMEOUT_HOURS * 60 * 60;

/**
 * Controlador HTTP de sesión.
 * Expone endpoints de login, logout y validación de token.
 * Lee y escribe la cookie `token` (httpOnly) para mantener la sesión.
 */
export class SesionControlador {
  private servicio: IServicioInicioSesion;

  constructor(servicio: IServicioInicioSesion) {
    this.servicio = servicio;
  }

  /**
   * POST /api/auth/login — Autentica al usuario y establece la cookie de sesión.
   * @param req - Request con body `{ username, password }`
   * @returns JSON con datos de sesión y cookie `token` en la respuesta
   */
  async iniciarSesion(req: NextRequest): Promise<NextResponse> {
    try {
      const dto: LoginDTO = await req.json();
      const sesion = await this.servicio.iniciarSesion(dto);
      const response = NextResponse.json(sesion);
      response.cookies.set("token", sesion.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: SESSION_TIMEOUT_SECONDS,
      });
      return response;
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
  }

  /**
   * POST /api/auth/logout — Invalida la sesión y elimina la cookie `token`.
   * Lee el token desde el header Authorization o desde la cookie.
   * @param req - Request entrante
   */
  async cerrarSesion(req: NextRequest): Promise<NextResponse> {
    try {
      const authHeader = req.headers.get("Authorization");
      const cookieToken = req.cookies.get("token")?.value;
      const token = authHeader?.replace("Bearer ", "") || cookieToken;

      if (token) {
        await this.servicio.cerrarSesion(token);
      }

      const response = NextResponse.json({ message: "Logout exitoso" });
      response.cookies.delete("token");
      return response;
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  /**
   * POST /api/auth/validate — Verifica que el token JWT sea válido.
   * Lee el token desde el header Authorization o desde la cookie `token`.
   * @param req - Request entrante
   * @returns JSON con los datos del usuario si el token es válido, 401 en caso contrario
   */
  async validar(req: NextRequest): Promise<NextResponse> {
    try {
      const authHeader = req.headers.get("Authorization");
      const cookieToken = req.cookies.get("token")?.value;
      const token = authHeader?.replace("Bearer ", "") || cookieToken;

      if (!token) {
        return NextResponse.json({ error: "No token provided" }, { status: 401 });
      }

      const usuario = await this.servicio.validarToken(token);
      return NextResponse.json(usuario);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
  }
}