import { PrismaClient, product_physical } from "@prisma/client";
import { GenericDAO } from "./GenericDAO";
import { ILabelDAO } from "../interfaces/ILabelDAO";

/**
 * Implementación del Acceso a Datos (DAO) para las etiquetas o características físicas.
 * Extiende la funcionalidad genérica e interactúa con la base de datos a través de Prisma
 * para gestionar las etiquetas asociadas a los productos.
 */
export class LabelDAO
  extends GenericDAO<product_physical>
  implements ILabelDAO
{
  /**
   * Inicializa una nueva instancia de LabelDAO.
   *
   * @param prisma Instancia del cliente de Prisma para interactuar con la base de datos.
   */
  constructor(prisma: PrismaClient) {
    super(prisma, "product_physical");
  }

  /**
   * Obtiene una lista de etiquetas asociados a un producto específico.
   *
   * @param productId El identificador único numérico del producto.
   * @returns Una promesa que resuelve con un arreglo de entidades product_physical.
   */
  async getByProduct(productId: bigint): Promise<product_physical[]> {
    return await this.db.findMany({
      where: { product_id: productId },
    });
  }

  /**
   * Elimina todas las etiquetas vinculadas a un producto específico.
   *
   * @param productId El identificador único numérico del producto.
   * @returns Una promesa que resuelve con un booleano indicando el éxito de la eliminación masiva.
   */
  async deleteByProduct(productId: bigint): Promise<boolean> {
    try {
      await this.db.deleteMany({
        where: { product_id: productId },
      });
      return true;
    } catch {
      return false;
    }
  }
}
