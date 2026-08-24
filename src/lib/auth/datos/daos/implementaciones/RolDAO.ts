import { PrismaClient, roles } from "@prisma/client";
import { GenericDAO } from "./GenericDAO";
import { IRolDAO, RolConModulos } from "../interfaces/IRolDAO";

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

  /**
   * Obtiene todos los roles con sus accesos a módulos incluidos.
   * @returns Una promesa que resuelve en un array de roles con sus módulos.
   */
  async getAllConModulos(): Promise<RolConModulos[]> {
    return await this.db.findMany({ include: { role_module_access: true } });
  }

  /**
   * Obtiene un rol por su ID con sus accesos a módulos incluidos.
   * @param id - El ID del rol.
   * @returns Una promesa que resuelve en el rol encontrado (con módulos) o null si no existe.
   */
  async getByIdConModulos(id: bigint): Promise<RolConModulos | null> {
    return await this.db.findUnique({
      where: { id },
      include: { role_module_access: true },
    });
  }
}
