import { PrismaClient, role_module_access } from "@prisma/client";
import { GenericDAO } from "./GenericDAO";
import { IRolModuloDAO } from "../interfaces/IRolModuloDAO";

/**
 * DAO específico para la entidad "RolModulo". Extiende la implementación
 * genérica de GenericDAO y proporciona métodos adicionales específicos
 * para el acceso de un rol a los módulos de la app.
 */
export class RolModuloDAO extends GenericDAO<role_module_access> implements IRolModuloDAO {
  /**
   * Constructor de la clase RolModuloDAO.
   * @param prisma - Instancia de PrismaClient.
   */
  constructor(prisma: PrismaClient) {
    super(prisma, "role_module_access");
  }

  /**
   * Obtiene los módulos a los que tiene acceso un rol.
   * @param roleId - El ID del rol.
   * @returns Una promesa que resuelve en un array de accesos a módulos del rol.
   */
  async getByRoleId(roleId: bigint): Promise<role_module_access[]> {
    return await this.db.findMany({
      where: { role_id: roleId },
    });
  }
}
