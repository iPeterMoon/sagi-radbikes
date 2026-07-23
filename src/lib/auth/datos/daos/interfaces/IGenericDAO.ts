/**
 * Interfaz genérica para Data Access Objects (DAO) que define los métodos CRUD básicos.
 * Esta interfaz es parametrizada para permitir su uso con cualquier modelo de datos.
 * Las implementaciones específicas de DAO pueden extender esta interfaz y proporcionar
 * tipos concretos para los modelos que manejan.
 */
export interface IGenericDAO<T, TCreate = Partial<T>, TUpdate = Partial<T>> {
  /**
   * Obtiene todos los registros del modelo.
   * @param include - Opciones para incluir datos relacionados.
   * @returns Una promesa que resuelve en un array de registros.
   */
  getAll(include?: object): Promise<T[]>;
  /**
   * Obtiene un registro por su ID.
   * @param id - El ID del registro a obtener.
   * @param include - Opciones para incluir datos relacionados.
   * @returns Una promesa que resuelve en el registro encontrado o null si no se encuentra.
   */
  getById(id: number | bigint, include?: object): Promise<T | null>;

  /**
   * Crea un nuevo registro en el modelo.
   * @param data - Los datos para crear el nuevo registro.
   * @returns Una promesa que resuelve en el registro creado.
   */
  create(data: TCreate): Promise<T>;

  /**
   * Actualiza un registro existente por su ID.
   * @param id - El ID del registro a actualizar.
   * @param data - Los datos para actualizar el registro.
   * @returns Una promesa que resuelve en el registro actualizado.
   */
  update(id: number | bigint, data: TUpdate): Promise<T>;

  /**
   * Elimina un registro por su ID.
   * @param id - El ID del registro a eliminar.
   * @returns Una promesa que resuelve en el registro eliminado.
   */
  delete(id: number | bigint): Promise<T>;
}
