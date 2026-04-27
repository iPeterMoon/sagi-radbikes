import { EstadoStock } from "../enums/EstadoStock";

/** Datos de una categoría de producto. */
export interface CategoriaDTO {
  /** Identificador único de la categoría. */
  idCategoria: string;
  /** Nombre de la categoría. */
  nombre: string;
  /** Descripción opcional de la categoría. */
  descripcion: string;
}

/** Datos de una marca de producto. */
export interface MarcaDTO {
  /** Identificador único de la marca. */
  idMarca: string;
  /** Nombre de la marca. */
  nombre: string;
}

/** Datos de una subcategoría de producto. */
export interface SubCategoriaDTO {
  /** Identificador único de la subcategoría. */
  idSubCategoria: string;
  /** Nombre de la subcategoría. */
  nombre: string;
  /** ID de la categoría padre. */
  idCategoria: string;
}

/** Datos de una imagen asociada a un producto. */
export interface ImagenProductoDTO {
  /** Identificador único de la imagen. */
  idImagen: string;
  /** URL pública de la imagen en el almacenamiento. */
  url: string;
  /** Indica si es la imagen principal del producto. */
  esPrincipal: boolean;
}

/** Atributo clave-valor de un producto (ej. color, talla). */
export interface EtiquetaDTO {
  /** Identificador único de la etiqueta. */
  idEtiqueta: string;
  /** Nombre/clave del atributo (ej. "color"). */
  nombre: string;
  /** Valor del atributo (ej. "rojo"). */
  valor: string;
}

/** Datos completos de un producto para presentar al cliente. */
export interface ProductoDTO {
  /** Identificador único del producto. */
  idProducto: string;
  /** Nombre descriptivo del producto. */
  nombre: string;
  /** Código SKU interno. */
  sku: string;
  /** Código de barras UPC. */
  codigoDeBarras: string;
  /** Precio de venta. */
  precio: number;
  /** Cantidad en inventario. */
  stock: number;
  /** Descripción detallada. */
  descripcion: string;
  /** Lista de imágenes asociadas. */
  imagenes: ImagenProductoDTO[];
  /** Categoría a la que pertenece. */
  categoria: CategoriaDTO;
  /** Marca del producto. */
  marca: MarcaDTO;
  /** Subcategoría a la que pertenece. */
  subcategoria: SubCategoriaDTO;
  /** Estado calculado del stock (NORMAL, BAJO, CRITICO). */
  estadoStock: EstadoStock;
  /** Atributos adicionales del producto. */
  etiquetas: EtiquetaDTO[];
}