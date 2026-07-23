import { EstadoStock } from "../enums/EstadoStock";
import { CategoriaDTO } from "./CategoriaDTO";
import { MarcaDTO } from "./MarcaDTO";
import { SubCategoriaDTO } from "./SubCategoriaDTO";
import { ImagenProductoDTO } from "./ImagenProductoDTO";
import { EtiquetaDTO } from "./EtiquetaDTO";

/**
 * Objeto de Transferencia de Datos (DTO) que representa la información completa
 * y detallada de un producto, diseñada para ser presentada al cliente o consumidor.
 */
export interface ProductoDTO {
  /**
   * El identificador único del producto en la base de datos.
   */
  idProducto: string;

  /**
   * El nombre descriptivo y comercial del producto.
   */
  nombre: string;

  /**
   * El código interno de unidad de mantenimiento de existencias (SKU).
   */
  sku: string;

  /**
   * El código de barras universal (UPC) asignado al producto.
   */
  codigoDeBarras: string;

  /**
   * El precio de venta vigente para el producto.
   */
  precio: number;

  /**
   * La cantidad total de unidades disponibles actualmente en el inventario.
   */
  stock: number;

  /**
   * La descripción detallada que especifica las características y bondades del producto.
   */
  descripcion: string;

  /**
   * Una colección de objetos que contienen la información de las imágenes asociadas al producto.
   */
  imagenes: ImagenProductoDTO[];

  /**
   * El objeto con la información de la categoría principal a la que pertenece el producto.
   */
  categoria: CategoriaDTO;

  /**
   * El objeto con la información de la marca fabricante o proveedora del producto.
   */
  marca: MarcaDTO;

  /**
   * El objeto con la información de la subcategoría específica donde se clasifica el producto.
   */
  subcategoria: SubCategoriaDTO;

  /**
   * El límite inferior de existencias definido para alertar sobre el reabastecimiento.
   */
  minStock: number;

  /**
   * El estado lógico del inventario (por ejemplo: NORMAL, BAJO o CRÍTICO) según la disponibilidad actual.
   */
  estadoStock: EstadoStock;

  /**
   * Indica si el producto se encuentra activo y disponible para su visualización o venta.
   */
  activo: boolean;

  /**
   * Una lista de atributos dinámicos o etiquetas clave-valor que complementan la información del producto.
   */
  etiquetas: EtiquetaDTO[];
}
