import { PrismaClient } from "@prisma/client";

export interface IAccesoDatos {
  readonly prisma: PrismaClient;
}
