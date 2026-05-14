import { PrismaClient, user_role } from "@prisma/client";
import { GenericDAO } from "./GenericDAO";
import { IUsuarioRolDAO } from "../interfaces/IUsuarioRolDAO";

/**
 * DAO específico para la entidad "UsuarioRol". Extiende la implementación
 * genérica de GenericDAO y proporciona métodos adicionales específicos
 * para la relación entre usuarios y roles, como obtener los roles de un usuario por su ID.
 */
export class UsuarioRolDAO extends GenericDAO<user_role> implements IUsuarioRolDAO {
  /**
   * Constructor de la clase UsuarioRolDAO.
   * @param prisma - Instancia de PrismaClient.
   */
  constructor(prisma: PrismaClient) {
    super(prisma, "user_role");
  }

  /**
   * Obtiene los roles asociados a un usuario por su ID.
   * @param userId - El ID del usuario.
   * @returns Una promesa que resuelve en un array de objetos user_role con los roles asociados.
   */
  async getByUserId(userId: bigint): Promise<user_role[]> {
    return await this.db.findMany({
      where: { user_id: userId },
      include: {
        roles: true,
      },
    });
  }
}