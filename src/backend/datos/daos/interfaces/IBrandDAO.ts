import { brands } from "@prisma/client";
import { IGenericDAO } from "./IGenericDAO";

export interface IBrandDAO extends IGenericDAO<brands> {
  getByName(name: string): Promise<brands | null>;
}
