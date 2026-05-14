import { CategoriaDTO } from "../DTOsSalida";

/**
 * Interfaz que define las operaciones de lógica de negocio para la gestión
 * de categorías de productos en el catálogo.
 */
export interface ICategoriaBO {
  /**
   * Recupera todas las categorías registradas en el sistema.
   *
   * @returns Una promesa que resuelve a un arreglo con los DTOs de todas las categorías.
   */
  obtenerTodas(): Promise<CategoriaDTO[]>;

  /**
   * Busca una categoría específica mediante su identificador único.
   *
   * @param id El identificador único de la categoría en formato string.
   * @returns Una promesa que resuelve al DTO de la categoría encontrada o nulo si no existe.
   */
  obtenerPorId(id: string): Promise<CategoriaDTO | null>;

  /**
   * Registra una nueva categoría en el catálogo de productos.
   *
   * @param categoria El objeto de transferencia de datos con la información de la nueva categoría.
   * @returns Una promesa que resuelve al DTO de la categoría recién creada.
   */
  crear(categoria: CategoriaDTO): Promise<CategoriaDTO>;

  /**
   * Actualiza la información de una categoría existente.
   *
   * @param categoria El objeto de transferencia de datos con la información actualizada.
   * @returns Una promesa que resuelve al DTO de la categoría con los cambios aplicados.
   */
  actualizar(categoria: CategoriaDTO): Promise<CategoriaDTO>;

  /**
   * Elimina de manera lógica o física una categoría del sistema.
   *
   * @param id El identificador único de la categoría que se desea eliminar.
   * @returns Una promesa que resuelve a un valor booleano indicando el éxito de la operación.
   */
  eliminar(id: string): Promise<boolean>;
}
