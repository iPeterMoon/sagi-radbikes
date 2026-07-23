import { ProductoVentaDTO } from "../DTOsSalida/ProductoVentaDTO";

/** Contrato para las operaciones de negocio del catálogo de productos. */
export interface IProductoBO {
  filtrarCatalogo(busqueda?: string): Promise<ProductoVentaDTO[]>;
  verificarStock(idProducto: string, cantidad: number): Promise<boolean>;
}