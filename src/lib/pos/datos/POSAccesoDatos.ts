import { PrismaClient } from "@prisma/client";
import { PrismaFactory } from "@/lib/PrismaFactory";
import { VentaDAO } from "./daos/implementaciones/VentaDAO";
import { DetalleVentaDAO } from "./daos/implementaciones/DetalleVentaDAO";
import { PagoDAO } from "./daos/implementaciones/PagoDAO";
import { ProductoDAO } from "./daos/implementaciones/ProductoDAO";
import { IPOSAccesoDatos } from "./daos/interfaces/IPOSAccesoDatos";
import { IVentaDAO } from "./daos/interfaces/IVentaDAO";
import { IDetalleVentaDAO } from "./daos/interfaces/IDetalleVentaDAO";
import { IPagoDAO } from "./daos/interfaces/IPagoDAO";
import { IProductoDAO } from "./daos/interfaces/IProductoDAO";

/**
 * Contenedor principal de los Data Access Objects (DAOs).
 * Agrupa todos los repositorios para inyectarlos de forma centralizada en la capa de negocio.
 */
export class POSAccesoDatos implements IPOSAccesoDatos {
  public readonly prisma: PrismaClient;
  public readonly ventaDAO: IVentaDAO;
  public readonly detalleVentaDAO: IDetalleVentaDAO;
  public readonly pagoDAO: IPagoDAO;
  public readonly productoDAO: IProductoDAO;

  constructor() {
    this.prisma = PrismaFactory.getCliente();
    this.ventaDAO = new VentaDAO(this.prisma);
    this.detalleVentaDAO = new DetalleVentaDAO(this.prisma);
    this.pagoDAO = new PagoDAO(this.prisma);
    this.productoDAO = new ProductoDAO(this.prisma);
  }
}