import { product_variants } from "@prisma/client";
import { IGenericDAO } from "./IGenericDAO";

/**
 * Contrato para el Acceso a Datos (DAO) de las variantes de producto.
 * Hereda las operaciones CRUD base e incluye métodos de consulta y
 * manipulación específicos para el SKU, código de barras y stock de cada variante.
 */
export interface IProductVariantDAO extends IGenericDAO<product_variants> {
  /**
   * Obtiene todas las variantes que pertenecen a un producto específico,
   * incluyendo sus atributos e imágenes.
   *
   * @param productId El identificador único numérico del producto.
   * @returns Una promesa que resuelve con un arreglo de entidades product_variants.
   */
  getByProduct(productId: bigint): Promise<product_variants[]>;

  /**
   * Obtiene una lista de todas las variantes que se encuentran activas en el sistema.
   *
   * @returns Una promesa que resuelve con un arreglo de entidades product_variants.
   */
  getActive(): Promise<product_variants[]>;

  /**
   * Busca y obtiene una variante específica a partir de su SKU (Stock Keeping Unit).
   *
   * @param sku El código SKU único de la variante a buscar.
   * @returns Una promesa que resuelve con la entidad product_variants encontrada, o null si no existe.
   */
  getBySKU(sku: string): Promise<product_variants | null>;

  /**
   * Busca y obtiene una variante específica a partir de su código de barras.
   *
   * @param barcode El código de barras único de la variante.
   * @returns Una promesa que resuelve con la entidad product_variants encontrada, o null si no existe.
   */
  getByBarcode(barcode: string): Promise<product_variants | null>;

  /**
   * Obtiene una lista de variantes cuyo stock actual sea menor al umbral especificado.
   *
   * @param threshold El límite de cantidad en stock para realizar la búsqueda.
   * @returns Una promesa que resuelve con un arreglo de entidades product_variants.
   */
  getBelowStock(threshold: number): Promise<product_variants[]>;

  /**
   * Disminuye de forma atómica la cantidad en stock de una variante específica.
   *
   * @param id El identificador único numérico de la variante.
   * @param quantity La cantidad a restar del stock actual.
   * @returns Una promesa que resuelve con un booleano indicando el éxito de la operación.
   */
  decreaseStock(id: bigint, quantity: number): Promise<boolean>;

  /**
   * Aumenta de forma atómica la cantidad en stock de una variante específica.
   *
   * @param id El identificador único numérico de la variante.
   * @param quantity La cantidad a sumar al stock actual.
   * @returns Una promesa que resuelve con un booleano indicando el éxito de la operación.
   */
  increaseStock(id: bigint, quantity: number): Promise<boolean>;
}
