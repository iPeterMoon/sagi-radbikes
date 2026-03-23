import { categories } from "@prisma/client";

export interface ICategoryDAO {
  getByName(name: string): Promise<categories | null>;
}
