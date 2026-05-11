import { IDetalleVentaDAO } from "./IDetalleVentaDAO";
import { IVentaDAO } from "./IVentaDAO";
import { IPagoDAO } from "./IPagoDAO";
import { IProductoDAO } from "./IProductoDAO";

export interface IPOSAccesoDatos {
  ventaDAO: IVentaDAO;
  detalleVentaDAO: IDetalleVentaDAO;
  pagoDAO: IPagoDAO;
  productoDAO: IProductoDAO;
}