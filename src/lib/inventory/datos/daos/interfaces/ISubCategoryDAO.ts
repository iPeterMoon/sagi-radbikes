import { subcategory } from "@prisma/client";
import { IGenericDAO } from "./IGenericDAO";

/**
 * Contrato para el Acceso a Datos (DAO) de la entidad subcategoría.
 * Hereda las operaciones CRUD base e incluye métodos de consulta específicos
 * para el manejo de subcategorías en la base de datos.
 */
export interface ISubCategoryDAO extends IGenericDAO<subcategory> {
  /**
   * Obtiene una lista de subcategorías que pertenecen a una categoría específica.
   *
   * @param categoryId El identificador único numérico (bigint) de la categoría padre.
   * @returns Una promesa que resuelve con un arreglo de entidades subcategory.
   */
  getByCategory(categoryId: bigint): Promise<subcategory[]>;

  /**
   * Busca y obtiene una subcategoría específica a partir de su nombre.
   *
   * @param name El nombre exacto de la subcategoría a buscar.
   * @returns Una promesa que resuelve con la entidad subcategory encontrada, o null si no existe.
   */
  getByName(name: string): Promise<subcategory | null>;
}
