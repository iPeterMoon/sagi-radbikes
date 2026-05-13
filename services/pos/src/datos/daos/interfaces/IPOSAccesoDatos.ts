import { IDetalleVentaDAO } from "./IDetalleVentaDAO";
import { IVentaDAO } from "./IVentaDAO";
import { IPagoDAO } from "./IPagoDAO";
import { IProductoDAO } from "./IProductoDAO";

/**
 * Contrato de agregación que engloba el acceso a todos los repositorios 
 * necesarios para que el módulo POS funcione sin acoplamiento a una BD específica.
 */
export interface IPOSAccesoDatos {
  ventaDAO: IVentaDAO;
  detalleVentaDAO: IDetalleVentaDAO;
  pagoDAO: IPagoDAO;
  productoDAO: IProductoDAO;
}