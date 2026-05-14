import { MarcaDTO } from "../DTOsSalida";

/**
 * Interfaz que define las operaciones de lógica de negocio para la gestión
 * de marcas comerciales de productos en el catálogo.
 */
export interface IMarcaBO {
  /**
   * Recupera la lista completa de marcas registradas en el sistema.
   *
   * @returns Una promesa que resuelve a un arreglo con los DTOs de todas las marcas.
   */
  obtenerTodas(): Promise<MarcaDTO[]>;

  /**
   * Busca una marca específica utilizando su identificador único.
   *
   * @param id El identificador único de la marca en formato string.
   * @returns Una promesa que resuelve al DTO de la marca encontrada o nulo si no existe.
   */
  obtenerPorId(id: string): Promise<MarcaDTO | null>;

  /**
   * Registra una nueva marca en el sistema.
   *
   * @param marca El objeto de transferencia de datos con la información de la nueva marca.
   * @returns Una promesa que resuelve al DTO de la marca recién creada.
   */
  crear(marca: MarcaDTO): Promise<MarcaDTO>;

  /**
   * Modifica la información de una marca ya existente.
   *
   * @param marca El objeto de transferencia de datos con la información actualizada.
   * @returns Una promesa que resuelve al DTO de la marca con los cambios persistidos.
   */
  actualizar(marca: MarcaDTO): Promise<MarcaDTO>;

  /**
   * Elimina una marca del sistema basándose en su identificador.
   *
   * @param id El identificador único de la marca que se desea eliminar.
   * @returns Una promesa que resuelve a un valor booleano indicando si la operación fue exitosa.
   */
  eliminar(id: string): Promise<boolean>;
}
