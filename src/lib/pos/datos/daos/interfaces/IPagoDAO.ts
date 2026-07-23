import { payments } from "@prisma/client";
import { IGenericDAO } from "./IGenericDAO";

/** Contrato específico del DAO de Pagos. */
export interface IPagoDAO extends IGenericDAO<payments> {
  getByVenta(idVenta: bigint): Promise<payments[]>;
  createPago(data: {
    sale_id: bigint;
    paymentMethod: string;
    amount: number;
  }): Promise<payments>;
}