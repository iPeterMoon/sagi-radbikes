/** Enum de estados de stock de un producto. */
export type EstadoStock = "NORMAL" | "BAJO" | "CRITICO";

/** Información de una categoría de producto. */
export interface CategoriaDTO {
  idCategoria: string;
  nombre: string;
  descripcion: string;
}

/** Información de una marca comercial. */
export interface MarcaDTO {
  idMarca: string;
  nombre: string;
}

/** Información de una subcategoría de producto. */
export interface SubCategoriaDTO {
  idSubCategoria: string;
  nombre: string;
  idCategoria: string;
}

/** Información de una imagen de producto. */
export interface ImagenProductoDTO {
  idImagen: string;
  url: string;
  esPrincipal: boolean;
}

/** Etiqueta (atributo clave-valor) de un producto. */
export interface EtiquetaDTO {
  idEtiqueta: string;
  nombre: string;
  valor: string;
}

/** DTO para crear una nueva etiqueta. */
export interface CrearEtiquetaDTO {
  nombre: string;
  valor: string;
  idProducto: string;
}

/** Información completa de un producto. */
export interface ProductoDTO {
  idProducto: string;
  nombre: string;
  sku: string;
  codigoDeBarras: string;
  precio: number;
  stock: number;
  descripcion: string;
  imagenes: ImagenProductoDTO[];
  categoria: CategoriaDTO;
  marca: MarcaDTO;
  subcategoria: SubCategoriaDTO;
  minStock: number;
  estadoStock: EstadoStock;
  activo: boolean;
  etiquetas: EtiquetaDTO[];
}

/** DTO para crear un nuevo producto. */
export interface CrearProductoDTO {
  nombre: string;
  precio: number;
  stock: number;
  codigoDeBarras?: string;
  minStock?: number;
  descripcion: string;
  idCategoria: string;
  idMarca: string;
  imagenesArchivo: File[];
  idSubCategoria: string;
  etiquetas?: { name: string; value: string }[];
}

/** DTO para actualizar un producto existente. */
export interface ActualizarProductoDTO {
  idProducto: string;
  nombre: string;
  precio: number;
  stock: number;
  codigoDeBarras?: string;
  minStock?: number;
  descripcion: string;
  idCategoria: string;
  imagenesNuevas: File[];
  imagenesEliminar: string[];
  idImagenPrincipal: string;
  idMarca: string;
  idSubCategoria: string;
  etiquetas?: { name: string; value: string }[];
}

/** Criterios de búsqueda y filtrado de productos. */
export interface FiltroProductoDTO {
  busqueda: string;
  idCategoria: string;
  idMarca: string;
  estadoStock: string;
  idSubCategoria: string;
  precioMin: number;
  precioMax: number;
}
