import { product_images } from "@prisma/client";

/**
 * Contrato para el Acceso a Datos (DAO) de las imágenes de los productos.
 * Define las operaciones específicas para el almacenamiento, consulta,
 * actualización y eliminación de imágenes asociadas a un producto en la base de datos.
 */
export interface IProductImageDAO {
  /**
   * Crea y almacena un nuevo registro de imagen para un producto o, si se indica `variantId`,
   * para una variante específica de ese producto.
   *
   * @param img El archivo de imagen proporcionado por Multer.
   * @param productId El identificador único numérico del producto al que pertenece la imagen.
   * @param isMain Indicador opcional para establecer si esta será la imagen principal (del producto o de la variante, según corresponda).
   * @param variantId Identificador opcional de la variante a la que pertenece la imagen. Si no viene, la imagen es general del producto.
   * @returns Una promesa que resuelve con la entidad product_images creada.
   */
  create(
    img: File,
    productId: bigint,
    isMain?: boolean,
    variantId?: bigint,
  ): Promise<product_images>;

  /**
   * Busca y obtiene una imagen específica a partir de su identificador.
   *
   * @param id El identificador único numérico de la imagen.
   * @returns Una promesa que resuelve con la entidad product_images, o null si no se encuentra.
   */
  getById(id: bigint): Promise<product_images | null>;

  /**
   * Elimina el registro de una imagen específica de la base de datos.
   *
   * @param id El identificador único numérico de la imagen a eliminar.
   * @returns Una promesa que resuelve con la entidad product_images eliminada.
   */
  delete(id: bigint): Promise<product_images>;

  /**
   * Obtiene todas las imágenes asociadas a un producto específico.
   *
   * @param productId El identificador único numérico del producto.
   * @returns Una promesa que resuelve con un arreglo de entidades product_images.
   */
  getByProduct(productId: bigint): Promise<product_images[]>;

  /**
   * Obtiene la imagen designada como principal para un producto específico.
   *
   * @param productId El identificador único numérico del producto.
   * @returns Una promesa que resuelve con la entidad product_images principal, o null si no existe.
   */
  getMainByProduct(productId: bigint): Promise<product_images | null>;

  /**
   * Establece una imagen existente como la imagen principal de su producto.
   *
   * @param id El identificador único numérico de la imagen.
   * @returns Una promesa que resuelve con un booleano indicando el éxito de la operación.
   */
  setMain(id: bigint): Promise<boolean>;

  /**
   * Elimina todos los registros de imágenes asociados a un producto específico.
   *
   * @param productId El identificador único numérico del producto.
   * @returns Una promesa que resuelve con un booleano indicando el éxito de la eliminación masiva.
   */
  deleteByProduct(productId: bigint): Promise<boolean>;

  /**
   * Obtiene todas las imágenes asociadas a una variante específica.
   *
   * @param variantId El identificador único numérico de la variante.
   * @returns Una promesa que resuelve con un arreglo de entidades product_images.
   */
  getByVariant(variantId: bigint): Promise<product_images[]>;
}
