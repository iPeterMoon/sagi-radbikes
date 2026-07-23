/**
 * Contrato genérico para el Acceso a Datos (DAO).
 * Define las operaciones CRUD (Crear, Leer, Actualizar, Eliminar) base para cualquier entidad.
 *
 * @template T El tipo de la entidad principal gestionada por el DAO.
 * @template TCreate El tipo de los datos requeridos para crear una nueva entidad (por defecto, Partial<T>).
 * @template TUpdate El tipo de los datos permitidos para actualizar una entidad (por defecto, Partial<T>).
 */
export interface IGenericDAO<T, TCreate = Partial<T>, TUpdate = Partial<T>> {
  /**
   * Obtiene todos los registros de la entidad.
   *
   * @param include Objeto opcional para especificar relaciones o campos anidados a incluir en la consulta.
   * @returns Una promesa que resuelve con un arreglo de entidades del tipo T.
   */
  getAll(include?: object): Promise<T[]>;

  /**
   * Busca y obtiene un registro específico a partir de su identificador.
   *
   * @param id El identificador único numérico del registro (puede ser number o bigint).
   * @param include Objeto opcional para especificar relaciones o campos anidados a incluir en la consulta.
   * @returns Una promesa que resuelve con la entidad encontrada, o null si no existe.
   */
  getById(id: number | bigint, include?: object): Promise<T | null>;

  /**
   * Crea y almacena un nuevo registro en la base de datos.
   *
   * @param data Los datos necesarios para crear la entidad.
   * @returns Una promesa que resuelve con la entidad T recién creada.
   */
  create(data: TCreate): Promise<T>;

  /**
   * Actualiza la información de un registro existente en la base de datos.
   *
   * @param id El identificador único del registro a actualizar.
   * @param data Los datos parciales o completos con las actualizaciones a aplicar.
   * @returns Una promesa que resuelve con la entidad T actualizada.
   */
  update(id: number | bigint, data: TUpdate): Promise<T>;

  /**
   * Elimina un registro específico de la base de datos.
   *
   * @param id El identificador único del registro a eliminar.
   * @returns Una promesa que resuelve con la entidad T eliminada.
   */
  delete(id: number | bigint): Promise<T>;
}
