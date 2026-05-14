import { PrismaClient, brands } from "@prisma/client";
import { GenericDAO } from "./GenericDAO";
import { IBrandDAO } from "../interfaces/IBrandDAO";

/**
 * Clase que gestiona el acceso a datos (DAO) para la entidad de marcas.
 * Extiende las operaciones CRUD básicas de GenericDAO e implementa las operaciones
 * específicas definidas en IBrandDAO.
 */
export class BrandDAO extends GenericDAO<brands> implements IBrandDAO {
  /**
   * Constructor de la clase BrandDAO.
   * Inicializa el acceso al modelo de marcas en la base de datos.
   *
   * @param prisma Instancia del cliente de Prisma conectada a la base de datos.
   */
  constructor(prisma: PrismaClient) {
    super(prisma, "brands");
  }

  /**
   * Busca y recupera un registro de marca filtrando por su nombre de forma
   * insensible a mayúsculas y minúsculas.
   *
   * @param name El nombre de la marca que se desea buscar en la base de datos.
   * @returns El registro de la marca encontrada, o nulo si no existe coincidencia.
   */
  async getByName(name: string): Promise<brands | null> {
    return await this.db.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
  }
}
