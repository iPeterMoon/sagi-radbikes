import { categories } from "@prisma/client";
import { IGenericDAO } from "./IGenericDAO";

export interface ICategoryDAO extends IGenericDAO<categories> {
  getByName(name: string): Promise<categories | null>;
}
