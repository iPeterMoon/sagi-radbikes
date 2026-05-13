import { CategoriaDTO } from "./CategoriaDTO";

/**
 * Presentación depurada de un producto que se envía a la interfaz (Punto de Venta) 
 * escondiendo metadatos irrelevantes de Prisma.
 */
export interface ProductoVentaDTO {
  /** ID del producto */
  idProducto: string;
  /** Nombre público */
  nombre: string;
  /** Precio de venta vigente */
  precio: number;
  /** Inventario actual disponible */
  stock: number;
  /** Detalles adicionales del artículo */
  descripcion: string;
  /** Código interno (Stock Keeping Unit) */
  SKU: string;
  /** Identificador global escaneable */
  codigoBarras: string;
  /** Enlace a la imagen principal del producto (si existe) */
  urlImagen: string;
  /** Información anidada de la subcategoría/categoría a la que pertenece */
  categoria: CategoriaDTO;
}