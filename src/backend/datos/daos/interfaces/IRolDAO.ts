import { roles } from "@prisma/client";
import { IGenericDAO } from "./IGenericDAO";

export interface IRolDAO extends IGenericDAO<roles> {
  getByName(name: string): Promise<roles | null>;
}