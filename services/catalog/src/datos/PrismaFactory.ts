/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

/**
 * Clase de fábrica que implementa el patrón Singleton para gestionar y
 * proveer una única instancia del cliente de Prisma en toda la aplicación,
 * optimizando las conexiones a la base de datos.
 */
export class PrismaFactory {
  /**
   * Constructor privado para evitar la instanciación directa de la clase,
   * asegurando así el cumplimiento del patrón Singleton.
   */
  private constructor() {}

  /**
   * Obtiene la instancia global del cliente de Prisma. Si aún no ha sido creada,
   * la inicializa configurando un pool de conexiones con PostgreSQL utilizando
   * el adaptador PrismaPg para un mejor rendimiento.
   *
   * @returns La instancia única y global de PrismaClient conectada a la base de datos.
   */
  static getCliente(): PrismaClient {
    if (!globalThis.prismaGlobal) {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const adapter = new PrismaPg(pool as any);
      globalThis.prismaGlobal = new PrismaClient({ adapter });
    }

    return globalThis.prismaGlobal;
  }
}
