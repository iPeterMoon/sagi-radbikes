import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL!});

export class PrismaFactory {
  private constructor() {}
  
  static getCliente(): PrismaClient {
    if (process.env.NODE_ENV === "production") {
      return new PrismaClient({ adapter });
    }

    if (!globalThis.prismaGlobal) {
      globalThis.prismaGlobal = new PrismaClient({ adapter });
    }
    return globalThis.prismaGlobal;
  }
}
