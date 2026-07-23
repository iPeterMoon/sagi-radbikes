import { PrismaClient, subcategory } from "@prisma/client";
import { GenericDAO } from "./GenericDAO";
import { ISubCategoryDAO } from "../interfaces/ISubCategoryDAO";

/**
 * Implementación del Acceso a Datos (DAO) para la entidad subcategoría.
 * Extiende la funcionalidad genérica e interactúa con la base de datos a través de Prisma.
 */
export class SubCategoryDAO
  extends GenericDAO<subcategory>
  implements ISubCategoryDAO
{
  /**
   * Inicializa una nueva instancia de SubCategoryDAO.
   *
   * @param prisma Instancia del cliente de Prisma para interactuar con la base de datos.
   */
  constructor(prisma: PrismaClient) {
    super(prisma, "subcategory");
  }

  /**
   * Obtiene una lista de subcategorías que pertenecen a una categoría específica.
   *
   * @param categoryId El identificador único numérico de la categoría padre.
   * @returns Una promesa que resuelve con un arreglo de entidades subcategory.
   */
  async getByCategory(categoryId: bigint): Promise<subcategory[]> {
    return await this.db.findMany({
      where: { category_id: categoryId },
    });
  }

  /**
   * Busca y obtiene una subcategoría a partir de su nombre, realizando la búsqueda sin distinguir mayúsculas de minúsculas.
   *
   * @param name El nombre de la subcategoría a buscar.
   * @returns Una promesa que resuelve con la entidad subcategory encontrada, o null si no existe.
   */
  async getByName(name: string): Promise<subcategory | null> {
    return await this.db.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
  }
}
