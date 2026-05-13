import { sales } from "@prisma/client";
import { IGenericDAO } from "./IGenericDAO";

/** Contrato específico del DAO de Ventas expandiendo al CRUD genérico. */
export interface IVentaDAO extends IGenericDAO<sales> {
  getByUsuario(idUsuario: bigint): Promise<sales[]>;
  getByFolio(folio: string): Promise<sales | null>;
  createWithDetails(data: {
    user_seller: bigint;
    folio: string;
    total: number;
    subtotal: number;
    IVA_amount: number;
    tax_percentage: number;
  }): Promise<sales>;
}