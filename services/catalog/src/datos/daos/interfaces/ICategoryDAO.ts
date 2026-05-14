import { categories } from "@prisma/client";
import { IGenericDAO } from "./IGenericDAO";

/**
 * Contrato para el Acceso a Datos (DAO) de las categorías.
 * Hereda las operaciones CRUD base de IGenericDAO e incluye métodos de consulta específicos
 * para el manejo de categorías en la base de datos.
 */
export interface ICategoryDAO extends IGenericDAO<categories> {
  /**
   * Busca y obtiene una categoría específica a partir de su nombre exacto.
   *
   * @param name El nombre de la categoría a buscar.
   * @returns Una promesa que resuelve con la entidad categories encontrada, o null si no existe.
   */
  getByName(name: string): Promise<categories | null>;
}
