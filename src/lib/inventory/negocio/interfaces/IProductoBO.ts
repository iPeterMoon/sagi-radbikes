import {
  CrearProductoDTO,
  ActualizarProductoDTO,
  FiltroProductoDTO,
} from "../DTOsEntrada";
import { ProductoDTO } from "../DTOsSalida";

/**
 * Interfaz que define las operaciones de lógica de negocio para la gestión integral
 * de productos, incluyendo inventario, imágenes y filtrado avanzado.
 */
export interface IProductoBO {
  /**
   * Obtiene una lista de productos que coincidan con los criterios de filtrado.
   *
   * @param filtro Objeto con los parámetros de búsqueda como categoría, marca y precios.
   * @returns Una promesa que resuelve a un arreglo de DTOs de productos.
   */
  obtenerTodos(filtro: FiltroProductoDTO): Promise<ProductoDTO[]>;

  /**
   * Busca un producto específico por su identificador único.
   *
   * @param id El identificador único del producto.
   * @returns Una promesa que resuelve al DTO del producto o nulo si no se encuentra.
   */
  obtenerPorId(id: string): Promise<ProductoDTO | null>;

  /**
   * Recupera todos los productos pertenecientes a una categoría específica.
   *
   * @param idCategoria Identificador de la categoría.
   * @returns Una promesa que resuelve a un arreglo de productos de dicha categoría.
   */
  obtenerPorCategoria(idCategoria: string): Promise<ProductoDTO[]>;

  /**
   * Consulta productos cuyo inventario actual sea inferior al umbral especificado.
   *
   * @param umbral Cantidad numérica de stock para la alerta.
   * @returns Una promesa con la lista de productos en bajo stock.
   */
  obtenerPorStockDebajoDe(umbral: number): Promise<ProductoDTO[]>;

  /**
   * Crea un nuevo producto en el catálogo.
   *
   * @param producto DTO con la información inicial del producto.
   * @returns Una promesa con el DTO del producto creado.
   */
  crear(producto: CrearProductoDTO): Promise<ProductoDTO>;

  /**
   * Actualiza la información de un producto existente.
   *
   * @param producto DTO con los datos actualizados e identificador del producto.
   * @returns Una promesa con el DTO del producto actualizado.
   */
  actualizar(producto: ActualizarProductoDTO): Promise<ProductoDTO>;

  /**
   * Elimina un producto del sistema.
   *
   * @param id Identificador del producto a eliminar.
   * @returns Una promesa que indica si la eliminación fue exitosa.
   */
  eliminar(id: string): Promise<boolean>;

  /**
   * Sube y vincula archivos de imagen a un producto específico, o a una de sus variantes
   * si se indica `idVariante`.
   *
   * @param idProducto Identificador del producto destino.
   * @param archivos Arreglo de archivos binarios de imagen.
   * @param mainImageIndex Índice opcional para marcar una imagen como principal.
   * @param idVariante Identificador opcional de la variante a la que pertenecen las imágenes.
   * @returns Una promesa que se resuelve al finalizar la operación.
   */
  agregarImagenes(
    idProducto: string,
    archivos: File[],
    mainImageIndex?: number,
    idVariante?: string,
  ): Promise<void>;

  /**
   * Elimina una imagen asociada a un producto.
   *
   * @param idImagen Identificador único de la imagen.
   * @returns Una promesa que indica si la eliminación fue exitosa.
   */
  eliminarImagen(idImagen: string): Promise<boolean>;

  /**
   * Define una imagen existente como la principal del producto.
   *
   * @param idImagen Identificador único de la imagen.
   * @returns Una promesa que indica si la actualización fue exitosa.
   */
  establecerImagenPrincipal(idImagen: string): Promise<boolean>;

  /**
   * Cambia el estado de activación (activo/inactivo) de un producto.
   *
   * @param id Identificador del producto.
   * @returns Una promesa que indica si el cambio de estado fue exitoso.
   */
  actualizarEstado(id: string): Promise<boolean>;
}
