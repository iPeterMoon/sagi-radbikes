import { products } from "@prisma/client";
import { IGenericDAO } from "./IGenericDAO";

/**
 * Contrato para el Acceso a Datos (DAO) de los productos.
 * Hereda las operaciones CRUD base e incluye métodos de consulta y
 * manipulación específicos para la entidad de productos en la base de datos.
 */
export interface IProductDAO extends IGenericDAO<products> {
  /**
   * Obtiene una lista de productos cuyo stock actual sea menor al umbral especificado.
   *
   * @param threshold El límite de cantidad en stock para realizar la búsqueda.
   * @returns Una promesa que resuelve con un arreglo de entidades products.
   */
  getBelowStock(threshold: number): Promise<products[]>;

  /**
   * Obtiene una lista de productos que pertenecen a una categoría específica.
   *
   * @param categoryId El identificador único numérico de la categoría.
   * @returns Una promesa que resuelve con un arreglo de entidades products.
   */
  getByCategory(categoryId: bigint): Promise<products[]>;

  /**
   * Obtiene una lista de productos que pertenecen a una subcategoría específica.
   *
   * @param subCategoryId El identificador único numérico de la subcategoría.
   * @returns Una promesa que resuelve con un arreglo de entidades products.
   */
  getBySubCategory(subCategoryId: bigint): Promise<products[]>;

  /**
   * Obtiene una lista de productos que pertenecen a una marca específica.
   *
   * @param brandId El identificador único numérico de la marca.
   * @returns Una promesa que resuelve con un arreglo de entidades products.
   */
  getByBrand(brandId: bigint): Promise<products[]>;

  /**
   * Obtiene una lista de todos los productos que se encuentran activos en el sistema.
   *
   * @returns Una promesa que resuelve con un arreglo de entidades products.
   */
  getActive(): Promise<products[]>;

  /**
   * Busca y obtiene un producto específico a partir de su SKU (Stock Keeping Unit).
   *
   * @param sku El código SKU único del producto a buscar.
   * @returns Una promesa que resuelve con la entidad products encontrada, o null si no existe.
   */
  getBySKU(sku: string): Promise<products | null>;

  /**
   * Obtiene una lista de productos que coinciden con múltiples criterios de búsqueda opcionales.
   *
   * @param search Término de búsqueda general (por ejemplo, nombre o descripción del producto).
   * @param categoryId El identificador de la categoría para filtrar, o null para omitir.
   * @param brandId El identificador de la marca para filtrar, o null para omitir.
   * @param minPrice El precio mínimo para filtrar, o null para omitir.
   * @param maxPrice El precio máximo para filtrar, o null para omitir.
   * @returns Una promesa que resuelve con un arreglo de entidades products filtradas.
   */
  getByFilter(
    search: string,
    categoryId: bigint | null,
    brandId: bigint | null,
    minPrice: number | null,
    maxPrice: number | null,
  ): Promise<products[]>;

  /**
   * Busca y obtiene un producto específico a partir de su código de barras.
   *
   * @param barcode El código de barras único del producto.
   * @returns Una promesa que resuelve con la entidad products encontrada, o null si no existe.
   */
  getByBarcode(barcode: string): Promise<products | null>;

  /**
   * Disminuye la cantidad en stock de un producto específico.
   *
   * @param id El identificador único numérico del producto.
   * @param quantity La cantidad a restar del stock actual.
   * @returns Una promesa que resuelve con un booleano indicando el éxito de la operación.
   */
  decreaseStock(id: bigint, quantity: number): Promise<boolean>;
}
