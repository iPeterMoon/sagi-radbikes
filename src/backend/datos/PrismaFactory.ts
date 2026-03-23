import { PrismaClient } from "@prisma/client";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

export class PrismaFactory {
  private constructor() {}

  static getCliente(): PrismaClient {
    if (process.env.NODE_ENV === "production") {
      return new PrismaClient();
    }

    if (!globalThis.prismaGlobal) {
      globalThis.prismaGlobal = new PrismaClient();
    }
    return globalThis.prismaGlobal;
  }
}
