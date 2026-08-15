import { RolDTO } from "../DTOsSalida/RolDTO";

/** Datos para actualizar un usuario existente, incluyendo un cambio de contraseña opcional. */
export interface ActualizarUsuarioDTO {
  /** Identificador único del usuario a actualizar. */
  idUsuario: string;
  /** Nombre de usuario utilizado para el login. */
  username: string;
  /** Nueva contraseña en texto plano. Si se omite o está vacía, la contraseña actual no se modifica. */
  password?: string;
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
