import { roles } from "@prisma/client";
import { IGenericDAO } from "./IGenericDAO";

export interface IRolDAO extends IGenericDAO<roles> {
  obtenerPorNombre(nombre: string): Promise<roles | null>;
}
