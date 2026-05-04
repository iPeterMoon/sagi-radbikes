import { PrismaClient } from "@prisma/client";
import { IGenericDAO } from "../interfaces/IGenericDAO";

/* eslint-disable @typescript-eslint/no-explicit-any */
export abstract class GenericDAO<
  T,
  TCreate = any,
  TUpdate = any,
> implements IGenericDAO<T, TCreate, TUpdate> {
  constructor(
    protected prisma: PrismaClient,
    protected modelName: keyof PrismaClient,
  ) {}

  protected get db() {
    return this.prisma[this.modelName] as any;
  }

  async getAll(include?: object): Promise<T[]> {
    return await this.db.findMany({ include });
  }

  async getById(id: number | bigint, include?: object): Promise<T | null> {
    return await this.db.findUnique({
      where: { id },
      include,
    });
  }

  async create(data: TCreate): Promise<T> {
    return await this.db.create({ data });
  }

  async update(id: number | bigint, data: TUpdate): Promise<T> {
    return await this.db.update({
      where: { id },
      data,
    });
  }

  async delete(id: number | bigint): Promise<T> {
    return await this.db.delete({
      where: { id },
    });
  }
}
