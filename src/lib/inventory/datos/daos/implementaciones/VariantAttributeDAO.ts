import { PrismaClient, product_variant_attributes } from "@prisma/client";
import { GenericDAO } from "./GenericDAO";
import { IVariantAttributeDAO } from "../interfaces/IVariantAttributeDAO";

/**
 * Implementación del Acceso a Datos (DAO) para los atributos de las variantes de producto.
 * Extiende la funcionalidad genérica e interactúa con la base de datos a través de Prisma.
 */
export class VariantAttributeDAO extends GenericDAO<product_variant_attributes> implements IVariantAttributeDAO {
  /**
   * Inicializa una nueva instancia de VariantAttributeDAO.
   *
   * @param prisma Instancia del cliente de Prisma para interactuar con la base de datos.
   */
  constructor(prisma: PrismaClient) {
    super(prisma, "product_variant_attributes");
  }

  /**
   * Obtiene todos los atributos asociados a una variante específica.
   *
   * @param variantId El identificador único numérico de la variante.
   * @returns Una promesa que resuelve con un arreglo de entidades product_variant_attributes.
   */
  async getByVariant(variantId: bigint): Promise<product_variant_attributes[]> {
    return await this.db.findMany({ where: { variant_id: variantId } });
  }

  /**
   * Elimina todos los atributos asociados a una variante específica.
   *
   * @param variantId El identificador único numérico de la variante cuyos atributos serán eliminados.
   * @returns Una promesa que resuelve con un booleano indicando el éxito de la eliminación masiva.
   */
  async deleteByVariant(variantId: bigint): Promise<boolean> {
    try {
      await this.db.deleteMany({ where: { variant_id: variantId } });
      return true;
    } catch {
      return false;
    }
  }
}
