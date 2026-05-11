import { IVentaBO } from "./interfaces/IVentaBO";
import { ICarritoBO } from "./interfaces/ICarritoBO";
import { IProductoBO } from "./interfaces/IProductoBO";
import { IPOSAccesoDatos } from "../datos/daos/interfaces/IPOSAccesoDatos";
import { ProductoCarritoDTO } from "./DTOsEntrada/ProductoCarritoDTO";
import { CrearVentaDTO } from "./DTOsEntrada/CrearVentaDTO";
import { VentaResumenDTO } from "./DTOsSalida/VentaResumenDTO";
import { ProductoVentaDTO } from "./DTOsSalida/ProductoVentaDTO";
import { CarritoBO } from "./BOs/CarritoBO";
import { ProductoBO } from "./BOs/ProductoBO";
import { VentaBO } from "./BOs/VentaBO";
import { stockPublisher } from "../queue/stockPublisher";
import { IServicioVenta } from "./interfaces/IServicioVenta";

export class ServicioVenta implements IServicioVenta {
  private ventaBO: IVentaBO;
  private carritoBO: ICarritoBO;
  private productoBO: IProductoBO;

  constructor(accesoDatos: IPOSAccesoDatos) {
    this.ventaBO = new VentaBO(accesoDatos);
    this.carritoBO = new CarritoBO();
    this.productoBO = new ProductoBO(accesoDatos);
  }

  async buscarProductos(busqueda?: string): Promise<ProductoVentaDTO[]> {
    return this.productoBO.filtrarCatalogo(busqueda);
  }

  agregarProductoCarrito(producto: ProductoCarritoDTO): void {
    this.carritoBO.agregar(producto);
  }

  eliminarProductoCarrito(idProducto: string): void {
    this.carritoBO.eliminar(idProducto);
  }

  limpiarCarrito(): void {
    this.carritoBO.limpiar();
  }

  cambiarCantidad(idProducto: string, cantidad: number): void {
    this.carritoBO.cambiarCantidad(idProducto, cantidad);
  }

  obtenerCarrito(): ProductoCarritoDTO[] {
    return this.carritoBO.obtenerItems();
  }

  async registrarVenta(dto: CrearVentaDTO): Promise<VentaResumenDTO> {
    const erroresValidacion = this.ventaBO.validarVenta(dto);
    if (erroresValidacion.length > 0) {
      throw new Error(`Validación fallida: ${erroresValidacion.join(", ")}`);
    }

    const erroresStock = await this.ventaBO.verificarStock(dto.productos);
    if (erroresStock.length > 0) {
      const error: any = new Error("STOCK_INSUFICIENTE");
      error.detalles = erroresStock;
      throw error;
    }

    const resumen = await this.ventaBO.registrarVenta(dto);

    await stockPublisher.publicar(
      dto.productos.map((p) => ({ productId: p.idProducto, qty: p.cantidad })),
    );

    return resumen;
  }
}