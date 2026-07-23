import { brands } from "@prisma/client";
import { IGenericDAO } from "./IGenericDAO";

/**
 * Contrato para el Acceso a Datos (DAO) de las marcas.
 * Hereda las operaciones CRUD base de IGenericDAO e incluye métodos de consulta específicos
 * para el manejo de marcas en la base de datos.
 */
export interface IBrandDAO extends IGenericDAO<brands> {
  /**
   * Busca y obtiene una marca específica a partir de su nombre exacto.
   *
   * @param name El nombre de la marca a buscar.
   * @returns Una promesa que resuelve con la entidad brands encontrada, o null si no existe.
   */
  getByName(name: string): Promise<brands | null>;
}
