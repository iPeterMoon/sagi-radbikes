import { roles, role_module_access } from "@prisma/client";
import { IGenericDAO } from "./IGenericDAO";

/** Rol con sus accesos a módulos incluidos. */
export type RolConModulos = roles & { role_module_access: role_module_access[] };

/**
 * Interfaz para el DAO de la entidad "Rol". Extiende la interfaz genérica IGenericDAO
 * y agrega métodos específicos para obtener un rol por su nombre, y roles
 * junto con sus accesos a módulos.
 */
export interface IRolDAO extends IGenericDAO<roles> {
  /**
   * Obtiene un rol por su nombre. La búsqueda es insensible a mayúsculas.
   * @param nombre - El nombre del rol a buscar.
   * @returns Una promesa que resuelve en el rol encontrado o null si no se encuentra.
   */
  obtenerPorNombre(nombre: string): Promise<roles | null>;

  /**
   * Obtiene todos los roles con sus accesos a módulos incluidos.
   * @returns Una promesa que resuelve en un array de roles con sus módulos.
   */
  getAllConModulos(): Promise<RolConModulos[]>;

  /**
   * Obtiene un rol por su ID con sus accesos a módulos incluidos.
   * @param id - El ID del rol.
   * @returns Una promesa que resuelve en el rol encontrado (con módulos) o null si no existe.
   */
  getByIdConModulos(id: bigint): Promise<RolConModulos | null>;
}
