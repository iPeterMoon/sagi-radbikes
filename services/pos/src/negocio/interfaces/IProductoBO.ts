import { ProductoVentaDTO } from "../DTOsSalida/ProductoVentaDTO";

export interface IProductoBO {
  filtrarCatalogo(busqueda?: string): Promise<ProductoVentaDTO[]>;
  verificarStock(idProducto: string, cantidad: number): Promise<boolean>;
}