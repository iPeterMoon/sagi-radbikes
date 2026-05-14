import { SubCategoriaDTO } from "../DTOsSalida";

/**
 * Interfaz que define las operaciones de lógica de negocio para la gestión
 * de subcategorías de productos, permitiendo su clasificación jerárquica.
 */
export interface ISubCategoriaBO {
  /**
   * Recupera todas las subcategorías registradas en el sistema.
   *
   * @returns Una promesa que resuelve a un arreglo con los DTOs de todas las subcategorías.
   */
  obtenerTodas(): Promise<SubCategoriaDTO[]>;

  /**
   * Obtiene las subcategorías que pertenecen a una categoría padre específica.
   *
   * @param idCategoria El identificador único de la categoría padre.
   * @returns Una promesa que resuelve a un arreglo de subcategorías filtradas.
   */
  obtenerPorCategoria(idCategoria: string): Promise<SubCategoriaDTO[]>;

  /**
   * Busca una subcategoría específica por su identificador único.
   *
   * @param id El identificador único de la subcategoría.
   * @returns Una promesa que resuelve al DTO de la subcategoría encontrada o nulo si no existe.
   */
  obtenerPorId(id: string): Promise<SubCategoriaDTO | null>;

  /**
   * Registra una nueva subcategoría en el sistema.
   *
   * @param subCategoria El objeto de transferencia de datos con la información de la nueva subcategoría.
   * @returns Una promesa que resuelve al DTO de la subcategoría recién creada.
   */
  crear(subCategoria: SubCategoriaDTO): Promise<SubCategoriaDTO>;

  /**
   * Modifica la información de una subcategoría existente.
   *
   * @param subCategoria El objeto de transferencia de datos con la información actualizada.
   * @returns Una promesa que resuelve al DTO de la subcategoría con los cambios aplicados.
   */
  actualizar(subCategoria: SubCategoriaDTO): Promise<SubCategoriaDTO>;

  /**
   * Elimina una subcategoría del sistema basándose en su identificador.
   *
   * @param id El identificador único de la subcategoría que se desea eliminar.
   * @returns Una promesa que resuelve a un valor booleano indicando el éxito de la operación.
   */
  eliminar(id: string): Promise<boolean>;
}
