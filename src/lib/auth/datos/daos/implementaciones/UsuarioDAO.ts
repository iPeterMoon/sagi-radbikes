import { PrismaClient, roles, user_role, users } from "@prisma/client";
import { GenericDAO } from "./GenericDAO";
import { IUsuarioDAO } from "../interfaces/IUsuarioDAO";

/**
 * DAO específico para la entidad "Usuario". Extiende la implementación
 * genérica de GenericDAO y proporciona métodos adicionales específicos
 * para usuarios, como obtener un usuario por su nombre de usuario o
 * con sus roles asociados.
 */
export class UsuarioDAO extends GenericDAO<users> implements IUsuarioDAO {
  /**
   * Constructor de la clase UsuarioDAO.
   * @param prisma - Instancia de PrismaClient.
   */
  constructor(prisma: PrismaClient) {
    super(prisma, "users");
  }

  /**
   * Obtiene todos los registros del modelo con sus roles.
   * @returns Una promesa que resuelve en un array de registros.
   */
  async getAllWithRoles(): Promise<Array<users & { user_role: Array<user_role & { roles: roles | null }> }>> {
    return await this.db.findMany({ include: {
      user_role: {
        include: {
          roles: true,
        }
      }
    } });
  }

  /**
   * Obtiene un usuario por su nombre de usuario. La búsqueda es insensible a mayúsculas.
   * @param username - El nombre de usuario a buscar.
   * @returns Una promesa que resuelve en el usuario encontrado o null si no se encuentra.
  */
  async getByUsername(username: string): Promise<users | null> {
    return await this.db.findFirst({
      where: { username: { equals: username, mode: "insensitive" } },
    });
  }

  /**
   * Obtiene un usuario por su nombre de usuario con sus roles asociados. La búsqueda es insensible a mayúsculas.
   * @param username - El nombre de usuario a buscar.
   * @returns Una promesa que resuelve en el usuario encontrado o null si no se encuentra.
  */
  async getByUsernameWithRoles(
    username: string
  ): Promise<(users & { user_role: Array<{ roles: any }> }) | null> {
    return await this.db.findFirst({
      where: { username: { equals: username, mode: "insensitive" } },
      include: {
        user_role: {
          include: {
            roles: true,
          },
        },
      },
    });
  }

  /**
   * Obtiene un usuario por su email.
   * @param email Email del usuario a buscar
   * @returns Una promesa que resuelve en el usuario encontrado o null si no se encuentra
   */
  async getByEmail(email: string): Promise<users | null> {
    return await this.db.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } }
    })
  }

  /**
   * Obtiene un usuario por su email con sus roles asociados. 
   * @param email Email del usuario a buscar
   * @returns Una promesa que resuelve en el usuario encontrado con sus roles o null si no se encuentra
   */
  async getByEmailWithRoles(email: string): Promise<(users & { user_role: Array<{ roles: any; }>; }) | null> {
    return await this.db.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      include: {
        user_role: {
          include: {
            roles: true
          }
        }
      }
    })
  }

  /**
   * Obtiene un usuario por su número de teléfono.
   * @param phone Número de teléfono del usuario a buscar
   * @returns Una promesa que resuelve en el usuario encontrado o null si no se encuentra
   */
  async getByPhone(phone: string): Promise<users | null> {
    return await this.db.findFirst({
      where: { phone: { equals: phone } }
    })
  }

  /**
   * Obtiene un usuario por su telefono con sus roles asociados.
   * @param phone Telefono del usuario a buscar
   * @returns Una promesa que resuelve en el usuario encontrado con sus roles o null si no se encuentra.
   */
  async getByPhoneWithRoles(phone: string): Promise<(users & { user_role: Array<{ roles: any; }>; }) | null> {
    return await this.db.findFirst({
      where: { telefono: { equals: phone } },
      include: {
        user_role: {
          include: {
            roles: true,
          }
        }
      }
    })
  }


  /**
   * Marca a un usuario como activo o inactivo (cuando deja de trabajar en la tienda)
   * @param id Id del usuario a cambiar su estado.
  */
  async toggleActive(id: number | bigint): Promise<boolean> {
    try {
      const user = await this.db.findUnique({
        where: { id: id }
      })
      if (!user) {
        return false;
      }

      const isActive = user.is_active;

      await this.db.update({
        where: { id: id },
        data: { is_active: !isActive }
      })
      return true;
    } catch (error: any) {
      console.log(error);
      return false;
    }
  }
}