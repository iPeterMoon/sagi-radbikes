import { ProductoCarritoDTO } from "../DTOsEntrada/ProductoCarritoDTO";
import { VentaResumenDTO } from "../DTOsSalida/VentaResumenDTO";
import { CrearVentaDTO } from "../DTOsEntrada/CrearVentaDTO";
import { IPOSAccesoDatos } from "../../datos/daos/interfaces/IPOSAccesoDatos";
import { VentaMapper } from "../mappers/VentaMapper";

export interface IVentaBO {
  validarVenta(dto: CrearVentaDTO): string[];
  verificarStock(productos: ProductoCarritoDTO[]): Promise<string[]>;
  calcularTotal(
    productos: ProductoCarritoDTO[],
    porcentajeImpuesto: number,
  ): { subtotal: number; importeIVA: number; total: number };
  registrarVenta(dto: CrearVentaDTO): Promise<VentaResumenDTO>;
}

export class VentaBO implements IVentaBO {

  constructor(private accesoDatos: IPOSAccesoDatos) { }

  validarVenta(dto: CrearVentaDTO): string[] {
    const errores: string[] = [];
    if (!dto.idUsuario) errores.push("idUsuario es requerido");
    if (!dto.metodoPago) errores.push("metodoPago es requerido");
    if (!dto.productos || dto.productos.length === 0)
      errores.push("El carrito no puede estar vacío");
    if (dto.porcentajeImpuesto < 0 || dto.porcentajeImpuesto > 100)
      errores.push("porcentajeImpuesto debe estar entre 0 y 100");
    return errores;
  }

  async verificarStock(productos: ProductoCarritoDTO[]): Promise<string[]> {
    const errores: string[] = [];
    for (const item of productos) {
      const producto = await this.accesoDatos.productoDAO.getById(BigInt(item.idProducto));
      if (!producto) {
        errores.push(`Producto ${item.idProducto} no encontrado`);
      } else if ((producto.stock ?? 0) < item.cantidad) {
        errores.push(
          `Stock insuficiente para "${(producto as any).name}": disponible ${producto.stock}, solicitado ${item.cantidad}`,
        );
      }
    }
    return errores;
  }

  calcularTotal(
    productos: ProductoCarritoDTO[],
    porcentajeImpuesto: number,
  ): { subtotal: number; importeIVA: number; total: number } {
    const subtotal = productos.reduce((acc, p) => acc + p.subtotal, 0);
    const importeIVA = subtotal * (porcentajeImpuesto / 100);
    const total = subtotal + importeIVA;
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      importeIVA: Math.round(importeIVA * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }

  async registrarVenta(dto: CrearVentaDTO): Promise<VentaResumenDTO> {
    const { subtotal, importeIVA, total } = this.calcularTotal(
      dto.productos,
      dto.porcentajeImpuesto,
    );

    const folio = `VENTA-${Date.now()}`;

    const venta = await this.accesoDatos.ventaDAO.createWithDetails({
      user_seller: BigInt(dto.idUsuario),
      folio,
      total,
      subtotal,
      IVA_amount: importeIVA,
      tax_percentage: dto.porcentajeImpuesto,
    });

    const detalles = dto.productos.map((p) => ({
      sale_id: venta.id,
      product_id: BigInt(p.idProducto),
      quantity: p.cantidad,
      unitPrice: p.precioUnitario,
    }));
    await this.accesoDatos.detalleVentaDAO.createMany(detalles);

    const pago = await this.accesoDatos.pagoDAO.createPago({
      sale_id: venta.id,
      paymentMethod: dto.metodoPago,
      amount: total,
    });

    return VentaMapper.toResumenDTO(venta, pago, subtotal, importeIVA);
  }
}
