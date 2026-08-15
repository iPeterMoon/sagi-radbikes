import { RolDTO } from "@/types/dtos";

export interface Usuario {
  idUsuario: string;
  username: string;
  /** Nueva contraseña en texto plano. Solo se envía al editar si el usuario la cambió. */
  password?: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  is_active: boolean;
  roles: RolDTO[];
}

export type ModalUsuarioType =
  | { type: "add" }
  | { type: "edit"; usuario: Usuario }
  | { type: "success-add" }
  | { type: "success-edit" }
  | null;

export type FiltroEstado = "activos" | "inactivos" | "todos";