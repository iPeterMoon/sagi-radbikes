import { sale_details } from "@prisma/client";
import { IGenericDAO } from "./IGenericDAO";

export interface IDetalleVentaDAO extends IGenericDAO<sale_details> {
  getByVenta(idVenta: bigint): Promise<sale_details[]>;
  createMany(
    detalles: Array<{
      sale_id: bigint;
      product_id: bigint;
      quantity: number;
      unitPrice: number;
    }>
  ): Promise<void>;
}