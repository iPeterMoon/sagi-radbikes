import { CrearVentaDTO } from "../DTOsEntrada/CrearVentaDTO";
import { ProductoCarritoDTO } from "../DTOsEntrada/ProductoCarritoDTO";
import { VentaTicketDTO } from "../DTOsSalida";
import { DetalleStockDTO } from "../DTOsSalida/DetalleStockDTO";
import { VentaResumenDTO } from "../DTOsSalida/VentaResumenDTO";

/**
 * Contrato para las operaciones lógicas y reglas de negocio al procesar una Venta.
 */
export interface IVentaBO {
  validarVenta(dto: CrearVentaDTO): string[];
  verificarStock(productos: ProductoCarritoDTO[]): Promise<DetalleStockDTO[]>;
  calcularTotal(
    productos: ProductoCarritoDTO[],
    porcentajeImpuesto: number,
  ): { subtotal: number; importeIVA: number; total: number };
  registrarVenta(dto: CrearVentaDTO): Promise<VentaResumenDTO>;

  obtenerVentaParaTicket(folio: string): Promise<VentaTicketDTO>
}