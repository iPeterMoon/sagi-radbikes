/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL!});

export class PrismaFactory {
  private constructor() {}
  
  static getCliente(): PrismaClient {
    if (!globalThis.prismaGlobal) {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const adapter = new PrismaPg(pool as any);
      globalThis.prismaGlobal = new PrismaClient({ adapter });
    }

    return globalThis.prismaGlobal;
  }
}
