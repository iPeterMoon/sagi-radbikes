import { PrismaClient } from "@prisma/client";
import { IGenericDAO } from "../interfaces/IGenericDAO";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Clase abstracta que proporciona una implementación genérica para el Acceso a Datos (DAO)
 * mediante el ORM Prisma.
 */
export abstract class GenericDAO<
  T,
  TCreate = any,
  TUpdate = any,
> implements IGenericDAO<T, TCreate, TUpdate> {
  /**
   * Constructor de la clase GenericDAO.
   *
   * @param prisma Instancia del cliente de Prisma conectada a la base de datos.
   * @param modelName Nombre exacto del modelo dentro del cliente Prisma sobre el que operará el DAO.
   */
  constructor(
    protected prisma: PrismaClient,
    protected modelName: keyof PrismaClient,
  ) {}

  /**
   * Obtiene la referencia directa al modelo específico de la base de datos en Prisma.
   *
   * @returns El delegado del modelo de Prisma para ejecutar consultas.
   */
  protected get db() {
    return this.prisma[this.modelName] as any;
  }

  /**
   * Recupera todos los registros del modelo en la base de datos.
   *
   * @param include Objeto de configuración de Prisma para cargar relaciones vinculadas al registro.
   * @returns Un arreglo con todos los registros encontrados.
   */
  async getAll(include?: object): Promise<T[]> {
    return await this.db.findMany({ include });
  }

  /**
   * Busca y recupera un registro específico basándose en su identificador único.
   *
   * @param id El identificador único numérico del registro.
   * @param include Objeto de configuración de Prisma para cargar relaciones vinculadas al registro.
   * @returns El registro encontrado, o nulo si no existe en la base de datos.
   */
  async getById(id: number | bigint, include?: object): Promise<T | null> {
    return await this.db.findUnique({
      where: { id },
      include,
    });
  }

  /**
   * Inserta un nuevo registro en la base de datos.
   *
   * @param data Los datos y atributos necesarios para la creación del nuevo registro.
   * @returns El nuevo registro creado y persistido en la base de datos.
   */
  async create(data: TCreate): Promise<T> {
    return await this.db.create({ data });
  }

  /**
   * Modifica los atributos de un registro existente.
   *
   * @param id El identificador único numérico del registro que se desea actualizar.
   * @param data La estructura con los datos parciales o totales que reemplazarán a los actuales.
   * @returns El registro con su información actualizada.
   */
  async update(id: number | bigint, data: TUpdate): Promise<T> {
    return await this.db.update({
      where: { id },
      data,
    });
  }

  /**
   * Elimina de manera permanente un registro de la base de datos.
   *
   * @param id El identificador único numérico del registro a borrar.
   * @returns El registro que acaba de ser eliminado de la base de datos.
   */
  async delete(id: number | bigint): Promise<T> {
    return await this.db.delete({
      where: { id },
    });
  }
}
