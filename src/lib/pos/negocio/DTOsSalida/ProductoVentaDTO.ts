import { CategoriaDTO } from "./CategoriaDTO";

/**
 * Presentación depurada de una variante de producto que se envía a la interfaz (Punto de Venta)
 * escondiendo metadatos irrelevantes de Prisma.
 */
export interface ProductoVentaDTO {
  /** ID de la variante */
  idVariante: string;
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
  /** Enlace a la imagen principal de la variante (si existe) */
  urlImagen: string;
  /** Información anidada de la subcategoría/categoría a la que pertenece */
  categoria: CategoriaDTO;
  /** Atributos que distinguen a esta variante (ej. Color: Rojo) */
  atributos: { nombre: string; valor: string }[];
  /** ID del producto padre del que se desprende esta variante */
  idProductoPadre: string;
}
