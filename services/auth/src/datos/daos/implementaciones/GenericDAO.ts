import { PrismaClient } from "@prisma/client";
import { IGenericDAO } from "../interfaces/IGenericDAO";

/**
 * Implementación genérica de un Data Access Object (DAO) utilizando Prisma.
 * Esta clase proporciona métodos CRUD básicos para cualquier modelo de Prisma.
 * Las clases DAO específicas pueden extender esta clase y proporcionar tipos concretos.
 */
export abstract class GenericDAO<
  T,
  TCreate = any,
  TUpdate = any,
> implements IGenericDAO<T, TCreate, TUpdate> {

  /**
   * Constructor de la clase GenericDAO.
   * @param prisma - Instancia de PrismaClient.
   * @param modelName - Nombre del modelo en Prisma.
   */
  constructor(
    protected prisma: PrismaClient,
    protected modelName: keyof PrismaClient,
  ) {}

  /**
   * Obtiene la instancia del modelo de Prisma.
   * @returns La instancia del modelo de Prisma.
   */
  protected get db() {
    return this.prisma[this.modelName] as any;
  }

  /**
   * Obtiene todos los registros del modelo.
   * @param include - Opciones de inclusión para los datos relacionados.
   * @returns Una promesa que resuelve en un array de registros.
   */
  async getAll(include?: object): Promise<T[]> {
    return await this.db.findMany({ include });
  }

  /**
   * Obtiene un registro por su ID.
   * @param id - El ID del registro a obtener.
   * @param include - Opciones de inclusión para los datos relacionados.
   * @returns Una promesa que resuelve en el registro encontrado o null si no se encuentra.
   */
  async getById(id: number | bigint, include?: object): Promise<T | null> {
    return await this.db.findUnique({
      where: { id },
      include,
    });
  }

  /**
   * Crea un nuevo registro en el modelo.
   * @param data - Los datos para crear el nuevo registro.
   * @returns Una promesa que resuelve en el registro creado.
   */
  async create(data: TCreate): Promise<T> {
    return await this.db.create({ data });
  }

  /**
   * Actualiza un registro existente en el modelo.
   * @param id - El ID del registro a actualizar.
   * @param data - Los datos para actualizar el registro.
   * @returns Una promesa que resuelve en el registro actualizado.
   */
  async update(id: number | bigint, data: TUpdate): Promise<T> {
    return await this.db.update({
      where: { id },
      data,
    });
  }

  /**
   * Elimina un registro del modelo.
   * @param id - El ID del registro a eliminar.
   * @returns Una promesa que resuelve en el registro eliminado.
   */
  async delete(id: number | bigint): Promise<T> {
    return await this.db.delete({
      where: { id },
    });
  }
}
