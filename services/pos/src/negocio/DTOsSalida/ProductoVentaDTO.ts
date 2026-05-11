import { CategoriaDTO } from "./CategoriaDTO";

export interface ProductoVentaDTO {
  idProducto: string;
  nombre: string;
  precio: number;
  stock: number;
  descripcion: string;
  SKU: string;
  codigoBarras: string;
  urlImagen: string;
  categoria: CategoriaDTO;
}

