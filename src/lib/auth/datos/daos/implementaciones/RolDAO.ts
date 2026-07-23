import { PrismaClient, roles } from "@prisma/client";
import { GenericDAO } from "./GenericDAO";
import { IRolDAO } from "../interfaces/IRolDAO";

/**
 * DAO específico para la entidad "Rol". Extiende la implementación 
 * genérica de GenericDAO y proporciona métodos adicionales específicos
 * para roles, como obtener un rol por su nombre.
 */
export class RolDAO extends GenericDAO<roles> implements IRolDAO {
  /**
   * Constructor de la clase RolDAO.
   * @param prisma - Instancia de PrismaClient.
   */
  constructor(prisma: PrismaClient) {
    super(prisma, "roles");
  }

  /**
   * Obtiene un rol por su nombre. La búsqueda es insensible a mayúsculas.
   * @param nombre - El nombre del rol a buscar.
   * @returns Una promesa que resuelve en el rol encontrado o null si no se encuentra.
   */
  async obtenerPorNombre(nombre: string): Promise<roles | null> {
    return await this.db.findFirst({
      where: { name: { equals: nombre, mode: "insensitive" } },
    });
  }
  
}
