import { sale_details } from "@prisma/client";
import { IGenericDAO } from "./IGenericDAO";

/** Contrato específico del DAO para los Detalles o Partidas de una Venta. */
export interface IDetalleVentaDAO extends IGenericDAO<sale_details> {
  getByVenta(idVenta: bigint): Promise<sale_details[]>;
  createMany(
    detalles: Array<{
      sale_id: bigint;
      variant_id: bigint;
      quantity: number;
      unitPrice: number;
      unitCost: number;
    }>
  ): Promise<void>;
}