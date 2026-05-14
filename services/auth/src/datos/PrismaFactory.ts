/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}
/**
 * Fábrica para crear y gestionar la instancia de PrismaClient. Utiliza un patrón singleton para asegurar que solo
 * exista una única instancia de PrismaClient en toda la aplicación, lo que mejora el rendimiento y evita problemas
 * de conexión a la base de datos. La conexión se establece utilizando un pool de conexiones.
 */
export class PrismaFactory {
  /* El constructor es privado para evitar la creación de instancias de esta clase. */
  private constructor() {}

  /**
   * Obtiene la instancia de PrismaClient. Si la instancia ya existe, la devuelve; de lo contrario, crea una nueva
   * instancia utilizando un pool de conexiones y la devuelve.
   * @returns La instancia de PrismaClient.
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
