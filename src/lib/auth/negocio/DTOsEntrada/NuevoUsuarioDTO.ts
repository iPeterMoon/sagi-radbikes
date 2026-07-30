import { RolDTO } from "../DTOsSalida/RolDTO";

/** Datos públicos de un usuario (sin contraseña). */
export interface NuevoUsuarioDTO {
  /** Nombre de usuario utilizado para el login. */
  username: string;
  /** Contraseña en texto plano (se valida contra el hash almacenado). */
  password: string;
  /** Nombre del empleado */
  nombre: string;
  /** Apellido(s) del empleado */
  apellido: string;
  /** Email del empleado */
  email?: string;
  /** Telefono de contacto del empleado */
  telefono: string;
  /** Estado de actividad (Si está trabajando actualmente en la tienda o no) */
  is_active: boolean;
  /** Lista de roles asignados al usuario. */
  roles: RolDTO[];
}