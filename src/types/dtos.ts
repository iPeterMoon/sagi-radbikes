export type EstadoStock = "NORMAL" | "BAJO" | "CRITICO";

export interface CategoriaDTO {
  idCategoria: string;
  nombre: string;
  descripcion: string;
}

export interface MarcaDTO {
  idMarca: string;
  nombre: string;
}

export interface SubCategoriaDTO {
  idSubCategoria: string;
  nombre: string;
  idCategoria: string;
}

export interface ImagenProductoDTO {
  idImagen: string;
  url: string;
  esPrincipal: boolean;
}

export interface EtiquetaDTO {
  idEtiqueta: string;
  nombre: string;
  valor: string;
}

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

export interface FiltroProductoDTO {
  busqueda: string;
  idCategoria: string;
  idMarca: string;
  estadoStock: string;
  idSubCategoria: string;
  precioMin: number;
  precioMax: number;
}
