import { PrismaClient } from "@prisma/client";
import { IGenericDAO } from "../interfaces/IGenericDAO";

/**
 * Clase abstracta genérica que implementa las operaciones CRUD estándar.
 * Reduce la duplicación de código en los DAOs específicos.
 * * @template T - Tipo de la entidad de Prisma.
 * @template TCreate - Tipo de datos requeridos para la creación.
 * @template TUpdate - Tipo de datos requeridos para la actualización.
 */
export abstract class GenericDAO<T, TCreate = any, TUpdate = any> implements IGenericDAO<T, TCreate, TUpdate> {
  /**
   * Inicializa el DAO genérico.
   * * @param {PrismaClient} prisma - Instancia de Prisma Client.
   * @param {keyof PrismaClient} modelName - Nombre del modelo en Prisma (ej. "products", "sales").
   */
  constructor(
    protected prisma: PrismaClient,
    protected modelName: keyof PrismaClient,
  ) { }

  /**
   * Devuelve el delegado del modelo específico de Prisma.
   * * @returns {any} Delegado del modelo.
   */
  protected get db() {
    return this.prisma[this.modelName] as any;
  }

  /** Obtiene todos los registros.
   * @param {object} [include] - Opciones de inclusión de relaciones.
   * @returns {Promise<T[]>} Lista de entidades.
   */
  async getAll(include?: object): Promise<T[]> {
    return await this.db.findMany({ include });
  }

  /** Obtiene un registro por su ID.
   * @param {number | bigint} id - ID del registro.
   * @param {object} [include] - Opciones de inclusión de relaciones.
   * @returns {Promise<T | null>} Entidad o null si no se encuentra.
   */
  async getById(id: number | bigint, include?: object): Promise<T | null> {
    return await this.db.findUnique({ where: { id }, include });
  }

  /** Crea un nuevo registro.
   * @param {TCreate} data - Datos para crear el registro.
   * @returns {Promise<T>} Entidad creada.
   */
  async create(data: TCreate): Promise<T> {
    return await this.db.create({ data });
  }

  /** Actualiza un registro existente.
   * @param {number | bigint} id - ID del registro.
   * @param {TUpdate} data - Datos para actualizar el registro.
   * @returns {Promise<T>} Entidad actualizada.
   */
  async update(id: number | bigint, data: TUpdate): Promise<T> {
    return await this.db.update({ where: { id }, data });
  }

  /** Elimina un registro.
   * @param {number | bigint} id - ID del registro.
   * @returns {Promise<boolean>} true si se eliminó, false en caso contrario.
   */
  async delete(id: number | bigint): Promise<boolean> {
    await this.db.delete({ where: { id } });
    return true;
  }
}
