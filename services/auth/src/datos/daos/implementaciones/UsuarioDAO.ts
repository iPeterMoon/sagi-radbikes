import { PrismaClient, users } from "@prisma/client";
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
}