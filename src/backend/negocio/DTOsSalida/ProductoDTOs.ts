import { EstadoStock } from "../enums/EstadoStock";

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
  estadoStock: EstadoStock;
  activo: boolean;
  etiquetas: EtiquetaDTO[];
}