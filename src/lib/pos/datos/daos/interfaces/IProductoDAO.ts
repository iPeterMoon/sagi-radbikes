import { product_variants } from "@prisma/client";
import { IGenericDAO } from "./IGenericDAO";

/** Contrato específico del DAO de Variantes de Producto. */
export interface IProductoDAO extends IGenericDAO<product_variants> {
  getActivos(): Promise<product_variants[]>;
  getBySKU(sku: string): Promise<product_variants | null>;
  getByCodigoBarras(codigo: string): Promise<product_variants | null>;
  restarStock(id: bigint, cantidad: number): Promise<boolean>;
  buscarPorNombreOSKU(busqueda: string): Promise<product_variants[]>;
}
