import { RolDTO } from "./RolDTO";

/** Datos públicos de un usuario (sin contraseña). */
export interface UsuarioDTO {
  /** Identificador único del usuario. */
  idUsuario: string;
  /** Nombre de usuario utilizado para el login. */
  username: string;
  /** Nombre del empleado */
  nombre: string;
  /** Apellido(s) del empleado */
  apellido: string;
  /** Email del empleado */
  email: string;
  /** Telefono de contacto del empleado */
  telefono: string;
  /** Estado de actividad (Si está trabajando actualmente en la tienda o no) */
  is_active: boolean;
  /** Lista de roles asignados al usuario. */
  roles: RolDTO[];
}