/**
 * Interfaz base que define las operaciones CRUD estándar.
 * @template T Entidad de Prisma
 * @template TCreate Tipo de datos para creación
 * @template TUpdate Tipo de datos para actualización
 */
export interface IGenericDAO<T, TCreate = any, TUpdate = any> {
  getAll(include?: object): Promise<T[]>;
  getById(id: number | bigint, include?: object): Promise<T | null>;
  create(data: TCreate): Promise<T>;
  update(id: number | bigint, data: TUpdate): Promise<T>;
  delete(id: number | bigint): Promise<boolean>;
}