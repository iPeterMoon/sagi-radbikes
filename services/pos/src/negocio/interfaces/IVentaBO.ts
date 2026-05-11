import { CrearVentaDTO } from "../DTOsEntrada/CrearVentaDTO";
import { ProductoCarritoDTO } from "../DTOsEntrada/ProductoCarritoDTO";
import { VentaResumenDTO } from "../DTOsSalida/VentaResumenDTO";

export interface IVentaBO {
  validarVenta(dto: CrearVentaDTO): string[];
  verificarStock(productos: ProductoCarritoDTO[]): Promise<string[]>;
  calcularTotal(
    productos: ProductoCarritoDTO[],
    porcentajeImpuesto: number,
  ): { subtotal: number; importeIVA: number; total: number };
  registrarVenta(dto: CrearVentaDTO): Promise<VentaResumenDTO>;
}