import { PrismaClient, categories } from "@prisma/client";
import { GenericDAO } from "./GenericDAO";
import { ICategoryDAO } from "../interfaces/ICategoryDAO";

/**
 * Clase que gestiona el acceso a datos (DAO) para la entidad de categorías.
 * Extiende las operaciones CRUD básicas de GenericDAO e implementa las operaciones
 * específicas definidas en ICategoryDAO.
 */
export class CategoryDAO
  extends GenericDAO<categories>
  implements ICategoryDAO
{
  /**
   * Constructor de la clase CategoryDAO.
   * Inicializa el acceso al modelo de categorías en la base de datos.
   *
   * @param prisma Instancia del cliente de Prisma conectada a la base de datos.
   */
  constructor(prisma: PrismaClient) {
    super(prisma, "categories");
  }

  /**
   * Busca y recupera un registro de categoría filtrando por su nombre de forma
   * insensible a mayúsculas y minúsculas.
   *
   * @param name El nombre de la categoría que se desea buscar en la base de datos.
   * @returns El registro de la categoría encontrada, o nulo si no existe coincidencia.
   */
  async getByName(name: string): Promise<categories | null> {
    return await this.db.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
  }
}
