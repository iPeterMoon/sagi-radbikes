export interface IGenericDAO<T, TCreate = Partial<T>, TUpdate = Partial<T>> {
  getAll(include?: object): Promise<T[]>;

  getById(id: number | bigint, include?: object): Promise<T | null>;

  create(data: TCreate): Promise<T>;

  update(id: number | bigint, data: TUpdate): Promise<T>;

  delete(id: number | bigint): Promise<T>;
}
