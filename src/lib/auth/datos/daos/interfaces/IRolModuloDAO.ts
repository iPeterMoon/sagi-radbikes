import { role_module_access } from "@prisma/client";
import { IGenericDAO } from "./IGenericDAO";

/**
 * Interfaz para el DAO de la entidad "RolModulo" (acceso de un rol a un
 * módulo de la app). Extiende la interfaz genérica IGenericDAO y agrega un
 * método específico para obtener los módulos de un rol por su ID.
 */
export interface IRolModuloDAO extends IGenericDAO<role_module_access> {
  /**
   * Obtiene los módulos a los que tiene acceso un rol.
   * @param roleId - El ID del rol.
   * @returns Una promesa que resuelve en un array de accesos a módulos del rol.
   */
  getByRoleId(roleId: bigint): Promise<role_module_access[]>;
}
