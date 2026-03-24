export interface CrearProductoDTO {
  nombre: string;
  precio: number;
  stock: number;
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