import { ICatalogoAccesoDatos } from "../datos/daos/interfaces/ICatalogoAccesoDatos";
import { CatalogoAccesoDatos } from "../datos/CatalogoAccesoDatos";
import { IServicioInventario } from "./interfaces/IServicioInventario";
import { IProductoBO } from "./interfaces/IProductoBO";
import { ICategoriaBO } from "./interfaces/ICategoriaBO";
import { IMarcaBO } from "./interfaces/IMarcaBO";
import { ISubCategoriaBO } from "./interfaces/ISubCategoriaBO";
import { IEtiquetaBO } from "./interfaces/IEtiquetaBO";
import {
  CrearProductoDTO,
  ActualizarProductoDTO,
  FiltroProductoDTO,
  CrearEtiquetaDTO,
} from "./DTOsEntrada";
import {
  ProductoDTO,
  CategoriaDTO,
  MarcaDTO,
  SubCategoriaDTO,
  EtiquetaDTO,
} from "./DTOsSalida";
import { ProductoBO } from "./BOs/ProductoBO";
import { CategoriaBO } from "./BOs/CategoriaBO";
import { MarcaBO } from "./BOs/MarcaBO";
import { SubCategoriaBO } from "./BOs/SubCategoriaBO";
import { EtiquetaBO } from "./BOs/EtiquetaBO";

/**
 * Orquesta las operaciones del catálogo de inventario delegando la lógica de negocio
 * a sus respectivos Business Objects (BO).
 */
export class ServicioInventario implements IServicioInventario {
  private productoBO: IProductoBO;
  private categoriaBO: ICategoriaBO;
  private marcaBO: IMarcaBO;
  private subCategoriaBO: ISubCategoriaBO;
  private etiquetaBO: IEtiquetaBO;

  /**
   * Inicializa una nueva instancia de ServicioInventario.
   *
   * @param accesoDatos Objeto encargado del acceso a la capa de datos.
   */
  constructor(private accesoDatos: ICatalogoAccesoDatos) {
    this.productoBO = new ProductoBO(accesoDatos);
    this.categoriaBO = new CategoriaBO(accesoDatos);
    this.marcaBO = new MarcaBO(accesoDatos);
    this.subCategoriaBO = new SubCategoriaBO(accesoDatos);
    this.etiquetaBO = new EtiquetaBO(accesoDatos);
  }

  /**
   * Obtiene una lista de productos aplicando los filtros especificados.
   *
   * @param filtro Criterios de búsqueda para filtrar los productos.
   * @returns Una promesa que resuelve con un arreglo de objetos ProductoDTO.
   */
  async obtenerProductos(filtro: FiltroProductoDTO): Promise<ProductoDTO[]> {
    return this.productoBO.obtenerTodos(filtro);
  }

  /**
   * Obtiene un producto específico a partir de su identificador.
   *
   * @param id El identificador único del producto.
   * @returns Una promesa que resuelve con el ProductoDTO correspondiente, o null si no se encuentra.
   */
  async obtenerProductoPorId(id: string): Promise<ProductoDTO | null> {
    return this.productoBO.obtenerPorId(id);
  }

  /**
   * Crea un nuevo producto en el catálogo.
   *
   * @param producto Objeto DTO con la información necesaria para crear el producto.
   * @returns Una promesa que resuelve con el ProductoDTO creado.
   */
  async crearProducto(producto: CrearProductoDTO): Promise<ProductoDTO> {
    return this.productoBO.crear(producto);
  }

  /**
   * Actualiza la información de un producto existente.
   *
   * @param producto Objeto DTO con los datos actualizados del producto.
   * @returns Una promesa que resuelve con el ProductoDTO actualizado.
   */
  async actualizarProducto(
    producto: ActualizarProductoDTO,
  ): Promise<ProductoDTO> {
    return this.productoBO.actualizar(producto);
  }

  /**
   * Elimina un producto del catálogo de manera lógica o física.
   *
   * @param id El identificador único del producto a eliminar.
   * @returns Una promesa que resuelve con un valor booleano indicando el éxito de la operación.
   */
  async eliminarProducto(id: string): Promise<boolean> {
    return this.productoBO.eliminar(id);
  }

  /**
   * Ajusta la cantidad de existencias de un producto específico.
   *
   * @param id El identificador único del producto.
   * @param cantidad La cantidad a restar (o ajustar) en el inventario.
   * @returns Una promesa que resuelve con un booleano indicando el éxito de la operación.
   */
  async ajustarStock(id: string, cantidad: number): Promise<boolean> {
    return this.productoBO.restarStock(id, cantidad);
  }

  /**
   * Actualiza el estado (activo/inactivo) de un producto.
   *
   * @param id El identificador único del producto.
   * @returns Una promesa que resuelve con un booleano indicando el éxito de la operación.
   */
  async actualizarEstado(id: string): Promise<boolean> {
    return this.productoBO.actualizarEstado(id);
  }

  /**
   * Obtiene todas las categorías disponibles.
   *
   * @returns Una promesa que resuelve con un arreglo de objetos CategoriaDTO.
   */
  async obtenerCategorias(): Promise<CategoriaDTO[]> {
    return this.categoriaBO.obtenerTodas();
  }

  /**
   * Crea una nueva categoría.
   *
   * @param categoria Objeto DTO con los datos de la categoría a crear.
   * @returns Una promesa que resuelve con la CategoriaDTO creada.
   */
  async crearCategoria(categoria: CategoriaDTO): Promise<CategoriaDTO> {
    return this.categoriaBO.crear(categoria);
  }

  /**
   * Obtiene todas las marcas disponibles.
   *
   * @returns Una promesa que resuelve con un arreglo de objetos MarcaDTO.
   */
  async obtenerMarcas(): Promise<MarcaDTO[]> {
    return this.marcaBO.obtenerTodas();
  }

  /**
   * Crea una nueva marca en el catálogo.
   *
   * @param marca Objeto DTO con los datos de la marca a crear.
   * @returns Una promesa que resuelve con la MarcaDTO creada.
   */
  async crearMarca(marca: MarcaDTO): Promise<MarcaDTO> {
    return this.marcaBO.crear(marca);
  }

  /**
   * Obtiene todas las subcategorías disponibles.
   *
   * @returns Una promesa que resuelve con un arreglo de objetos SubCategoriaDTO.
   */
  async obtenerSubCategorias(): Promise<SubCategoriaDTO[]> {
    return this.subCategoriaBO.obtenerTodas();
  }

  /**
   * Crea una nueva subcategoría.
   *
   * @param subCategoria Objeto DTO con los datos de la subcategoría a crear.
   * @returns Una promesa que resuelve con la SubCategoriaDTO creada.
   */
  async crearSubCategoria(
    subCategoria: SubCategoriaDTO,
  ): Promise<SubCategoriaDTO> {
    return this.subCategoriaBO.crear(subCategoria);
  }

  /**
   * Obtiene una lista de subcategorías vinculadas a una categoría específica.
   *
   * @param idCategoria El identificador único de la categoría padre.
   * @returns Una promesa que resuelve con un arreglo de objetos SubCategoriaDTO.
   */
  async obtenerSubCategoriasPorCategoria(
    idCategoria: string,
  ): Promise<SubCategoriaDTO[]> {
    return this.subCategoriaBO.obtenerPorCategoria(idCategoria);
  }

  /**
   * Agrega imágenes a un producto específico.
   *
   * @param idProducto El identificador único del producto.
   * @param archivos Arreglo de archivos de imagen provenientes de la petición.
   * @param mainImageIndex Índice opcional que indica cuál será la imagen principal.
   * @returns Una promesa que resuelve cuando la operación se completa.
   */
  async agregarImagenes(
    idProducto: string,
    archivos: File[],
    mainImageIndex?: number,
  ): Promise<void> {
    return this.productoBO.agregarImagenes(
      idProducto,
      archivos,
      mainImageIndex,
    );
  }

  /**
   * Elimina una imagen específica del sistema.
   *
   * @param idImagen El identificador único de la imagen a eliminar.
   * @returns Una promesa que resuelve con un booleano indicando el éxito de la operación.
   */
  async eliminarImagen(idImagen: string): Promise<boolean> {
    return this.productoBO.eliminarImagen(idImagen);
  }

  /**
   * Establece una imagen existente como la imagen principal de su producto.
   *
   * @param idImagen El identificador único de la imagen.
   * @returns Una promesa que resuelve con un booleano indicando el éxito de la operación.
   */
  async establecerImagenPrincipal(idImagen: string): Promise<boolean> {
    return this.productoBO.establecerImagenPrincipal(idImagen);
  }

  /**
   * Obtiene las etiquetas asociadas a un producto.
   *
   * @param idProducto El identificador único del producto.
   * @returns Una promesa que resuelve con un arreglo de objetos EtiquetaDTO.
   */
  async obtenerEtiquetas(idProducto: string): Promise<EtiquetaDTO[]> {
    return this.etiquetaBO.obtenerPorProducto(idProducto);
  }

  /**
   * Crea una nueva etiqueta para ser utilizada en el sistema.
   *
   * @param etiqueta Objeto DTO con los datos de la etiqueta.
   * @returns Una promesa que resuelve con la EtiquetaDTO creada.
   */
  async crearEtiqueta(etiqueta: CrearEtiquetaDTO): Promise<EtiquetaDTO> {
    return this.etiquetaBO.crear(etiqueta);
  }

  /**
   * Elimina una etiqueta del catálogo.
   *
   * @param idEtiqueta El identificador único de la etiqueta.
   * @returns Una promesa que resuelve con un booleano indicando el éxito de la operación.
   */
  async eliminarEtiqueta(idEtiqueta: string): Promise<boolean> {
    return this.etiquetaBO.eliminar(idEtiqueta);
  }
}
