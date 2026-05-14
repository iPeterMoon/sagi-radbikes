import { users } from "@prisma/client";
import { IGenericDAO } from "./IGenericDAO";

/**
 * Interfaz para el DAO de la entidad "Usuario". Extiende la interfaz genérica IGenericDAO
 * y agrega métodos específicos para obtener un usuario por su nombre de usuario o
 * con sus roles asociados.
 */
export interface IUsuarioDAO extends IGenericDAO<users> {
  /**
   * Obtiene un usuario por su nombre de usuario. La búsqueda es insensible a mayúsculas.
   * @param username - El nombre de usuario del usuario a buscar.
   * @returns Una promesa que resuelve en el usuario encontrado o null si no se encuentra.
   */
  getByUsername(username: string): Promise<users | null>;
  /**
   * Obtiene un usuario por su nombre de usuario con sus roles asociados. La búsqueda es insensible a mayúsculas.
   * @param username - El nombre de usuario del usuario a buscar.
   * @returns Una promesa que resuelve en el usuario encontrado con sus roles o null si no se encuentra.
   */
  getByUsernameWithRoles(username: string): Promise<
    (users & { user_role: Array<{ roles: any }> }) | null
  >;
}