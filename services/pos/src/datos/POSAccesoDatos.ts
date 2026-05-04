import { PrismaClient } from "@prisma/client";
import { PrismaFactory } from "./PrismaFactory";
import { VentaDAO } from "./daos/VentaDAO";
import { DetalleVentaDAO } from "./daos/DetalleVentaDAO";
import { PagoDAO } from "./daos/PagoDAO";
import { ProductoDAO } from "./daos/ProductoDAO";

export class POSAccesoDatos {
  public readonly prisma: PrismaClient;
  public readonly ventaDAO: VentaDAO;
  public readonly detalleVentaDAO: DetalleVentaDAO;
  public readonly pagoDAO: PagoDAO;
  public readonly productoDAO: ProductoDAO;

  constructor() {
    this.prisma = PrismaFactory.getCliente();
    this.ventaDAO = new VentaDAO(this.prisma);
    this.detalleVentaDAO = new DetalleVentaDAO(this.prisma);
    this.pagoDAO = new PagoDAO(this.prisma);
    this.productoDAO = new ProductoDAO(this.prisma);
  }
}
