import { product_variant_attributes } from "@prisma/client";
import { IGenericDAO } from "./IGenericDAO";

/**
 * Contrato para el Acceso a Datos (DAO) de los atributos de las variantes de producto.
 * Define las operaciones específicas de consulta y eliminación masiva de atributos
 * (patrón EAV) asociados a una variante en la base de datos.
 */
export interface IVariantAttributeDAO extends IGenericDAO<product_variant_attributes> {
  /**
   * Obtiene todos los atributos asociados a una variante específica.
   *
   * @param variantId El identificador único numérico de la variante.
   * @returns Una promesa que resuelve con un arreglo de entidades product_variant_attributes.
   */
  getByVariant(variantId: bigint): Promise<product_variant_attributes[]>;

  /**
   * Elimina todos los atributos asociados a una variante específica.
   *
   * @param variantId El identificador único numérico de la variante cuyos atributos serán eliminados.
   * @returns Una promesa que resuelve con un booleano indicando el éxito de la eliminación masiva.
   */
  deleteByVariant(variantId: bigint): Promise<boolean>;
}
