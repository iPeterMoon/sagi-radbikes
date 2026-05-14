import { roles } from "@prisma/client";
import { IGenericDAO } from "./IGenericDAO";

/**
 * Interfaz para el DAO de la entidad "Rol". Extiende la interfaz genérica IGenericDAO
 * y agrega un método específico para obtener un rol por su nombre.
 */
export interface IRolDAO extends IGenericDAO<roles> {
  /**
   * Obtiene un rol por su nombre. La búsqueda es insensible a mayúsculas.
   * @param nombre - El nombre del rol a buscar.
   * @returns Una promesa que resuelve en el rol encontrado o null si no se encuentra.
   */
  obtenerPorNombre(nombre: string): Promise<roles | null>;
}
