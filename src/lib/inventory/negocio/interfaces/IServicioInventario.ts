import {
  CrearProductoDTO,
  ActualizarProductoDTO,
  FiltroProductoDTO,
  CrearEtiquetaDTO,
  CrearVarianteDTO,
  ActualizarVarianteDTO,
  CrearAtributoVarianteDTO,
} from "../DTOsEntrada";
import {
  ProductoDTO,
  CategoriaDTO,
  MarcaDTO,
  SubCategoriaDTO,
  EtiquetaDTO,
  VarianteDTO,
  AtributoVarianteDTO,
} from "../DTOsSalida";

/**
 * Contrato que define las operaciones disponibles para el servicio de inventario.
 * Proporciona los métodos necesarios para la gestión completa del catálogo,
 * incluyendo productos, categorías, marcas, subcategorías, imágenes, etiquetas,
 * variantes y sus atributos.
 */
export interface IServicioInventario {
  /**
   * Obtiene una lista de productos aplicando los filtros especificados.
   *
   * @param filtro Criterios de búsqueda para filtrar los productos.
   * @returns Una promesa que resuelve con un arreglo de objetos ProductoDTO.
   */
  obtenerProductos(filtro: FiltroProductoDTO): Promise<ProductoDTO[]>;

  /**
   * Obtiene un producto específico a partir de su identificador.
   *
   * @param id El identificador único del producto.
   * @returns Una promesa que resuelve con el ProductoDTO correspondiente, o null si no existe.
   */
  obtenerProductoPorId(id: string): Promise<ProductoDTO | null>;

  /**
   * Crea un nuevo producto en el catálogo.
   *
   * @param producto Objeto DTO con la información del producto a crear.
   * @returns Una promesa que resuelve con el ProductoDTO creado.
   */
  crearProducto(producto: CrearProductoDTO): Promise<ProductoDTO>;

  /**
   * Actualiza la información de un producto existente.
   *
   * @param producto Objeto DTO con los datos actualizados del producto.
   * @returns Una promesa que resuelve con el ProductoDTO actualizado.
   */
  actualizarProducto(producto: ActualizarProductoDTO): Promise<ProductoDTO>;

  /**
   * Elimina un producto del catálogo.
   *
   * @param id El identificador único del producto a eliminar.
   * @returns Una promesa que resuelve con un booleano indicando el éxito de la operación.
   */
  eliminarProducto(id: string): Promise<boolean>;

  /**
   * Actualiza el estado de visibilidad o disponibilidad de un producto.
   *
   * @param id El identificador único del producto.
   * @returns Una promesa que resuelve con un booleano indicando el éxito de la operación.
   */
  actualizarEstado(id: string): Promise<boolean>;

  /**
   * Obtiene todas las categorías registradas en el sistema.
   *
   * @returns Una promesa que resuelve con un arreglo de objetos CategoriaDTO.
   */
  obtenerCategorias(): Promise<CategoriaDTO[]>;

  /**
   * Obtiene todas las marcas registradas en el sistema.
   *
   * @returns Una promesa que resuelve con un arreglo de objetos MarcaDTO.
   */
  obtenerMarcas(): Promise<MarcaDTO[]>;

  /**
   * Obtiene todas las subcategorías registradas en el sistema.
   *
   * @returns Una promesa que resuelve con un arreglo de objetos SubCategoriaDTO.
   */
  obtenerSubCategorias(): Promise<SubCategoriaDTO[]>;

  /**
   * Obtiene una lista de subcategorías vinculadas a una categoría padre específica.
   *
   * @param idCategoria El identificador único de la categoría padre.
   * @returns Una promesa que resuelve con un arreglo de objetos SubCategoriaDTO.
   */
  obtenerSubCategoriasPorCategoria(
    idCategoria: string,
  ): Promise<SubCategoriaDTO[]>;

  /**
   * Crea una nueva categoría.
   *
   * @param categoria Objeto DTO con los datos de la categoría a crear.
   * @returns Una promesa que resuelve con la CategoriaDTO creada.
   */
  crearCategoria(categoria: CategoriaDTO): Promise<CategoriaDTO>;

  /**
   * Crea una nueva marca.
   *
   * @param marca Objeto DTO con los datos de la marca a crear.
   * @returns Una promesa que resuelve con la MarcaDTO creada.
   */
  crearMarca(marca: MarcaDTO): Promise<MarcaDTO>;

  /**
   * Crea una nueva subcategoría.
   *
   * @param subCategoria Objeto DTO con los datos de la subcategoría a crear.
   * @returns Una promesa que resuelve con la SubCategoriaDTO creada.
   */
  crearSubCategoria(subCategoria: SubCategoriaDTO): Promise<SubCategoriaDTO>;

  /**
   * Agrega una o más imágenes a un producto específico, o a una de sus variantes si se indica `idVariante`.
   *
   * @param idProducto El identificador único del producto.
   * @param archivos Arreglo de archivos de imagen provenientes de la petición.
   * @param mainImageIndex Índice opcional que indica qué imagen debe ser la principal.
   * @param idVariante Identificador opcional de la variante a la que pertenecen las imágenes.
   * @returns Una promesa que resuelve cuando se agregan las imágenes correctamente.
   */
  agregarImagenes(
    idProducto: string,
    archivos: File[],
    mainImageIndex?: number,
    idVariante?: string,
  ): Promise<void>;

  /**
   * Elimina una imagen específica del sistema y del producto asociado.
   *
   * @param idImagen El identificador único de la imagen a eliminar.
   * @returns Una promesa que resuelve con un booleano indicando el éxito de la operación.
   */
  eliminarImagen(idImagen: string): Promise<boolean>;

  /**
   * Establece una imagen existente como la portada o imagen principal de su producto.
   *
   * @param idImagen El identificador único de la imagen.
   * @returns Una promesa que resuelve con un booleano indicando el éxito de la operación.
   */
  establecerImagenPrincipal(idImagen: string): Promise<boolean>;

  /**
   * Obtiene la lista de etiquetas asociadas a un producto.
   *
   * @param idProducto El identificador único del producto.
   * @returns Una promesa que resuelve con un arreglo de objetos EtiquetaDTO.
   */
  obtenerEtiquetas(idProducto: string): Promise<EtiquetaDTO[]>;

  /**
   * Crea una nueva etiqueta.
   *
   * @param etiqueta Objeto DTO con los datos de la etiqueta a crear.
   * @returns Una promesa que resuelve con la EtiquetaDTO creada.
   */
  crearEtiqueta(etiqueta: CrearEtiquetaDTO): Promise<EtiquetaDTO>;

  /**
   * Elimina una etiqueta del catálogo.
   *
   * @param idEtiqueta El identificador único de la etiqueta a eliminar.
   * @returns Una promesa que resuelve con un booleano indicando el éxito de la operación.
   */
  eliminarEtiqueta(idEtiqueta: string): Promise<boolean>;

  /**
   * Obtiene las variantes asociadas a un producto.
   *
   * @param idProducto El identificador único del producto.
   * @returns Una promesa que resuelve con un arreglo de objetos VarianteDTO.
   */
  obtenerVariantes(idProducto: string): Promise<VarianteDTO[]>;

  /**
   * Crea una nueva variante de producto.
   *
   * @param variante Objeto DTO con los datos de la variante a crear.
   * @returns Una promesa que resuelve con la VarianteDTO creada.
   */
  crearVariante(variante: CrearVarianteDTO): Promise<VarianteDTO>;

  /**
   * Actualiza la información de una variante existente.
   *
   * @param variante Objeto DTO con los datos actualizados de la variante.
   * @returns Una promesa que resuelve con la VarianteDTO actualizada.
   */
  actualizarVariante(variante: ActualizarVarianteDTO): Promise<VarianteDTO>;

  /**
   * Elimina una variante del catálogo.
   *
   * @param idVariante El identificador único de la variante a eliminar.
   * @returns Una promesa que resuelve con un booleano indicando el éxito de la operación.
   */
  eliminarVariante(idVariante: string): Promise<boolean>;

  /**
   * Ajusta la cantidad de existencias de una variante específica, sumando o restando
   * una cantidad relativa al stock actual.
   *
   * @param idVariante El identificador único de la variante.
   * @param cantidad Cantidad a sumar (positiva) o restar (negativa) del inventario.
   * @returns Una promesa que resuelve con un booleano indicando el éxito de la operación.
   */
  ajustarStockVariante(idVariante: string, cantidad: number): Promise<boolean>;

  /**
   * Actualiza el estado (activo/inactivo) de una variante.
   *
   * @param idVariante El identificador único de la variante.
   * @returns Una promesa que resuelve con un booleano indicando el éxito de la operación.
   */
  actualizarEstadoVariante(idVariante: string): Promise<boolean>;

  /**
   * Obtiene los atributos asociados a una variante.
   *
   * @param idVariante El identificador único de la variante.
   * @returns Una promesa que resuelve con un arreglo de objetos AtributoVarianteDTO.
   */
  obtenerAtributosVariante(idVariante: string): Promise<AtributoVarianteDTO[]>;

  /**
   * Crea un nuevo atributo para ser utilizado en una variante.
   *
   * @param atributo Objeto DTO con los datos del atributo.
   * @returns Una promesa que resuelve con la AtributoVarianteDTO creada.
   */
  crearAtributoVariante(
    atributo: CrearAtributoVarianteDTO,
  ): Promise<AtributoVarianteDTO>;

  /**
   * Elimina un atributo de variante del catálogo.
   *
   * @param idAtributo El identificador único del atributo.
   * @returns Una promesa que resuelve con un booleano indicando el éxito de la operación.
   */
  eliminarAtributoVariante(idAtributo: string): Promise<boolean>;
}
