import { products } from "@prisma/client";
import { IGenericDAO } from "./IGenericDAO";

export interface IProductoDAO extends IGenericDAO<products> {
  getActivos(): Promise<products[]>;
  getBySKU(sku: string): Promise<products | null>;
  getByCodigoBarras(codigo: string): Promise<products | null>;
  restarStock(id: bigint, cantidad: number): Promise<boolean>;
  buscarPorNombreOSKU(busqueda: string): Promise<products[]>;
}