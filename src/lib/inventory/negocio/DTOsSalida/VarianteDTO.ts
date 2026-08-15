import { ImagenProductoDTO } from "./ImagenProductoDTO";
import { AtributoVarianteDTO } from "./AtributoVarianteDTO";

/**
 * Objeto de Transferencia de Datos (DTO) que representa una variante vendible
 * de un producto (por ejemplo, un color o talla específicos), con su SKU,
 * precio y stock autoritativos.
 */
export interface VarianteDTO {
  /**
   * El identificador único de la variante en la base de datos.
   */
  idVariante: string;

  /**
   * El identificador único del producto al que pertenece esta variante.
   */
  idProducto: string;

  /**
   * El código interno de unidad de mantenimiento de existencias (SKU), autogenerado.
   */
  sku: string;

  /**
   * El código de barras universal (UPC) asignado a la variante.
   */
  codigoDeBarras: string;

  /**
   * El precio de venta vigente para esta variante.
   */
  precio: number;

  /**
   * La cantidad de unidades disponibles actualmente en el inventario para esta variante.
   */
  stock: number;

  /**
   * El límite inferior de existencias definido para alertar sobre el reabastecimiento.
   * `null` cuando las notificaciones de stock bajo están desactivadas para esta variante.
   */
  minStock: number | null;

  /**
   * Indica si la variante se encuentra activa y disponible para su venta.
   */
  activo: boolean;

  /**
   * Una colección de objetos que contienen la información de las imágenes asociadas a la variante.
   */
  imagenes: ImagenProductoDTO[];

  /**
   * Una lista de atributos dinámicos o clave-valor que describen a la variante (ej. color, talla).
   */
  atributos: AtributoVarianteDTO[];
}
