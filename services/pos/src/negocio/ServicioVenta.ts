import { POSAccesoDatos } from "../datos/POSAccesoDatos";
import { CrearVentaDTO, ProductoCarritoDTO } from "./DTOsEntrada/VentaDTOs";
import { ProductoVentaDTO, VentaResumenDTO } from "./DTOsSalida/VentaDTOs";
import { CarritoBO } from "./BOs/CarritoBO";
import { ProductoBO } from "./BOs/ProductoBO";
import { VentaBO } from "./BOs/VentaBO";
import { stockPublisher } from "../queue/stockPublisher";

export class ServicioVenta {
  private ventaBO: VentaBO;
  private carritoBO: CarritoBO;
  private productoBO: ProductoBO;

  constructor(accesoDatos: POSAccesoDatos) {
    this.ventaBO = new VentaBO(accesoDatos);
    this.carritoBO = new CarritoBO();
    this.productoBO = new ProductoBO(accesoDatos);
  }

  // ---------- Catálogo ----------

  async buscarProductos(busqueda?: string): Promise<ProductoVentaDTO[]> {
    return this.productoBO.filtrarCatalogo(busqueda);
  }

  // ---------- Carrito ----------

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

  // ---------- Venta ----------

  async registrarVenta(dto: CrearVentaDTO): Promise<VentaResumenDTO> {
    const erroresValidacion = this.ventaBO.validarVenta(dto);
    if (erroresValidacion.length > 0) {
      throw new Error(`Validación fallida: ${erroresValidacion.join(", ")}`);
    }

    const erroresStock = await this.ventaBO.verificarStock(dto.productos);
    if (erroresStock.length > 0) {
      throw new Error(`Stock insuficiente: ${erroresStock.join(", ")}`);
    }

    const resumen = await this.ventaBO.registrarVenta(dto);

    // Publicar evento asíncrono para que Catalog decremente stock
    await stockPublisher.publicar(
      dto.productos.map((p) => ({ productId: p.idProducto, qty: p.cantidad })),
    );

    return resumen;
  }
}
