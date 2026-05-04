import { RolDTO } from "./RolDTO";

/** Datos públicos de un usuario (sin contraseña). */
export interface UsuarioDTO {
  /** Identificador único del usuario. */
  idUsuario: string;
  /** Nombre de usuario utilizado para el login. */
  username: string;
  /** Lista de roles asignados al usuario. */
  roles: RolDTO[];
}