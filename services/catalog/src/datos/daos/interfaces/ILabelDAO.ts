import { product_physical } from "@prisma/client";
import { IGenericDAO } from "./IGenericDAO";

/**
 * Contrato para el Acceso a Datos (DAO) de las etiquetas o características físicas de los productos.
 * Hereda las operaciones CRUD base e incluye métodos específicos para gestionar
 * la relación entre estos registros físicos y los productos en la base de datos.
 */
export interface ILabelDAO extends IGenericDAO<product_physical> {
  /**
   * Obtiene una lista de etiquetas o registros físicos asociados a un producto específico.
   *
   * @param productId El identificador único numérico del producto.
   * @returns Una promesa que resuelve con un arreglo de entidades product_physical.
   */
  getByProduct(productId: bigint): Promise<product_physical[]>;

  /**
   * Elimina todos los registros físicos o etiquetas vinculados a un producto específico.
   *
   * @param productId El identificador único numérico del producto.
   * @returns Una promesa que resuelve con un booleano indicando el éxito de la eliminación masiva.
   */
  deleteByProduct(productId: bigint): Promise<boolean>;
}
