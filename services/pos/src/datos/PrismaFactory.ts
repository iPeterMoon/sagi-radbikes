import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

/**
 * Fábrica Singleton para inicializar y obtener el cliente de Prisma.
 * Previene el agotamiento de conexiones a la base de datos, especialmente en entornos de desarrollo.
 */
export class PrismaFactory {
  private constructor() { }

  /**
   * Obtiene la instancia única global del cliente de Prisma.
   * Utiliza el adaptador de PostgreSQL nativo.
   * * @returns {PrismaClient} Cliente de base de datos.
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
