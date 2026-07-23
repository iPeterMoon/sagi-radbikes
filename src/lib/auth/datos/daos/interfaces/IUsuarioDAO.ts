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

  /**
   * Obtiene un usuario por su email.
   * @param email Email del usuario a buscar
   * @returns Una promesa que resuelve en el usuario encontrado o null si no se encuentra
   */
  getByEmail(email: string): Promise<users | null>;

  /**
   * Obtiene un usuario por su email con sus roles asociados. 
   * @param email Email del usuario a buscar
   * @returns Una promesa que resuelve en el usuario encontrado con sus roles o null si no se encuentra
   */
  getByEmailWithRoles(email: string): Promise<
    (users & { user_role: Array<{ roles: any }> }) | null
  >;

  /**
   * Obtiene un usuario por su número de teléfono.
   * @param phone Número de teléfono del usuario a buscar
   * @returns Una promesa que resuelve en el usuario encontrado o null si no se encuentra
   */
  getByPhone(phone: string): Promise<users | null>;

  /**
   * Obtiene un usuario por su telefono con sus roles asociados.
   * @param phone Telefono del usuario a buscar
   * @returns Una promesa que resuelve en el usuario encontrado con sus roles o null si no se encuentra.
   */
  getByPhoneWithRoles(phone: string): Promise<
    (users & { user_role: Array<{ roles: any }> }) | null
  >;


  /**
   * Marca a un usuario como activo o inactivo (cuando deja de trabajar en la tienda)
   * @param id Id del usuario a cambiar su estado.
   */
  toggleActive(id: number | bigint): Promise<boolean>;

}