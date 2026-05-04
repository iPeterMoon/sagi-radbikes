import { UsuarioDTO } from "./UsuarioDTO";

/** Datos de respuesta tras un inicio de sesión exitoso. */
export interface SesionDTO {
  /** Token JWT firmado con el que se autentican las peticiones. */
  token: string;
  /** Datos del usuario autenticado. */
  usuario: UsuarioDTO;
  /** Fecha y hora en que expira el token. */
  fechaExpiracion: Date;
}