import { user_role } from "@prisma/client";
import { IGenericDAO } from "./IGenericDAO";

/**
 * Interfaz para el DAO de la entidad "UsuarioRol". Extiende la interfaz genérica IGenericDAO
 * y agrega un método específico para obtener los roles de un usuario por su ID.
 */
export interface IUsuarioRolDAO extends IGenericDAO<user_role> {
  /**
   * Obtiene los roles de un usuario por su ID.
   * @param userId - El ID del usuario.
   * @returns Una promesa que resuelve en un array de roles asociados al usuario.
   */
  getByUserId(userId: bigint): Promise<user_role[]>;
}