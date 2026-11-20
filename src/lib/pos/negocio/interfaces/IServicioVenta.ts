import { ProductoCarritoDTO } from "../DTOsEntrada/ProductoCarritoDTO";
import { CrearVentaDTO } from "../DTOsEntrada/CrearVentaDTO";
import { VentaResumenDTO } from "../DTOsSalida/VentaResumenDTO";
import { ProductoVentaDTO } from "../DTOsSalida/ProductoVentaDTO";

/**
 * Contrato de la fachada principal del módulo de ventas (Servicio Orquestador).
 * Los controladores solo deberían interactuar con esta interfaz.
 */
export interface IServicioVenta {
  buscarProductos(busqueda?: string): Promise<ProductoVentaDTO[]>;
  agregarProductoCarrito(producto: ProductoCarritoDTO): void;
  eliminarProductoCarrito(idProducto: string): void;
  limpiarCarrito(): void;
  cambiarCantidad(idProducto: string, cantidad: number): void;
  obtenerCarrito(): ProductoCarritoDTO[];
  registrarVenta(dto: CrearVentaDTO): Promise<VentaResumenDTO>;
  imprimirVenta(folio: string): Promise<void>;
}