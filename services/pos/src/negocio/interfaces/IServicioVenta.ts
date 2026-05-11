import { ProductoCarritoDTO } from "../DTOsEntrada/ProductoCarritoDTO";
import { CrearVentaDTO } from "../DTOsEntrada/CrearVentaDTO";
import { VentaResumenDTO } from "../DTOsSalida/VentaResumenDTO";
import { ProductoVentaDTO } from "../DTOsSalida/ProductoVentaDTO";


export interface IServicioVenta {
  buscarProductos(busqueda?: string): Promise<ProductoVentaDTO[]>;
  agregarProductoCarrito(producto: ProductoCarritoDTO): void;
  eliminarProductoCarrito(idProducto: string): void;
  limpiarCarrito(): void;
  cambiarCantidad(idProducto: string, cantidad: number): void;
  obtenerCarrito(): ProductoCarritoDTO[];
  registrarVenta(dto: CrearVentaDTO): Promise<VentaResumenDTO>;
}