import { ProductoCarritoDTO } from "../DTOsEntrada/ProductoCarritoDTO";
import { VentaResumenDTO } from "../DTOsSalida/VentaResumenDTO";
import { CrearVentaDTO } from "../DTOsEntrada/CrearVentaDTO";
import { IPOSAccesoDatos } from "../../datos/daos/interfaces/IPOSAccesoDatos";
import { VentaMapper } from "../mappers/VentaMapper";
import { IVentaBO } from "../interfaces/IVentaBO";
import { DetalleStockDTO } from "../DTOsSalida/DetalleStockDTO";
import { TicketMapper } from "../mappers/TicketMapper";
import { VentaTicketDTO } from "../DTOsSalida";
import { product_variants, products } from "@prisma/client";

/**
 * Objeto de Negocio (Business Object) encargado de las reglas de negocio de las Ventas.
 */
export class VentaBO implements IVentaBO {

  /**
   * Inyecta el acceso a datos consolidado.
   */
  constructor(private accesoDatos: IPOSAccesoDatos) { }

  /**
   * Valida la estructura y los datos requeridos para procesar una venta.
   * @param {CrearVentaDTO} dto - Datos de la venta a validar.
   * @returns {string[]} Lista de errores encontrados (vacía si es válido).
   */
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

  /**
   * Verifica contra la base de datos si existe stock suficiente para todos los productos del carrito.
   * * @param {ProductoCarritoDTO[]} productos - Lista de productos en el carrito.
   * @returns {Promise<DetalleStockDTO[]>} Lista de detalles con stock insuficiente (vacía si todo está OK).
   */
  async verificarStock(productos: ProductoCarritoDTO[]): Promise<DetalleStockDTO[]> {
    const errores: DetalleStockDTO[] = [];
    for (const item of productos) {
      const producto = await this.accesoDatos.productoDAO.getById(BigInt(item.idVariante), { products: true }) as (product_variants & { products: products }) | null;
      if (!producto || (producto.stock ?? 0) < item.cantidad) {
        errores.push(new DetalleStockDTO(
          producto?.products?.name || `ID: ${item.idVariante}`,
          item.cantidad,
          producto?.stock ?? 0
        ));
      }
    }
    return errores;
  }

  /**
   * Calcula el subtotal, importe de IVA y total a pagar de una venta.
   * @param {ProductoCarritoDTO[]} productos - Lista de productos con sus subtotales.
   * @param {number} porcentajeImpuesto - Porcentaje de impuesto a aplicar.
   * @returns {{ subtotal: number; importeIVA: number; total: number }} Totales calculados.
   */
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

  /**
   * Registra una venta en la base de datos, incluyendo detalles y pago.
   * @param {CrearVentaDTO} dto - Datos completos de la venta a registrar.
   * @returns {Promise<VentaResumenDTO>} Resumen de la venta registrada.
   */
  async registrarVenta(dto: CrearVentaDTO): Promise<VentaResumenDTO> {
    const { subtotal, importeIVA, total } = this.calcularTotal(
      dto.productos,
      dto.porcentajeImpuesto,
    );

    const folio = `VENTA-${Date.now()}`;

    // Creación de la cabecera de la venta
    const venta = await this.accesoDatos.ventaDAO.createWithDetails({
      user_seller: BigInt(dto.idUsuario),
      folio,
      total,
      subtotal,
      IVA_amount: importeIVA,
      tax_percentage: dto.porcentajeImpuesto,
    });

    // Creación de las partidas/detalles de la venta. El costo unitario se toma del
    // servidor (nunca del cliente) para snapshotearlo igual que ya se hace con el precio.
    const detalles = await Promise.all(
      dto.productos.map(async (p) => {
        const variante = await this.accesoDatos.productoDAO.getById(BigInt(p.idVariante));
        return {
          sale_id: venta.id,
          variant_id: BigInt(p.idVariante),
          quantity: p.cantidad,
          unitPrice: p.precioUnitario,
          unitCost: variante?.cost ?? 0,
        };
      }),
    );
    await this.accesoDatos.detalleVentaDAO.createMany(detalles);

    // Registro del pago
    const pago = await this.accesoDatos.pagoDAO.createPago({
      sale_id: venta.id,
      paymentMethod: dto.metodoPago,
      amount: total,
    });

    for (const item of dto.productos) {
      const descontado = await this.accesoDatos.productoDAO.restarStock(BigInt(item.idVariante), item.cantidad);
      if (!descontado) {
        throw new Error(`Stock insuficiente para completar la venta del producto ${item.idVariante}`);
      }
    }

    return VentaMapper.toResumenDTO(venta, pago, subtotal, importeIVA);
  }

  // VentaBO.ts — agregar al final de la clase, junto a los demás métodos

/**
 * Obtiene una venta ya registrada por su folio y la transforma en el DTO
 * necesario para reconstruir su ticket (usado tanto para impresión inmediata
 * post-venta como para reimpresión posterior).
 * @param {string} folio - Folio único de la venta.
 * @returns {Promise<VentaTicketDTO>} DTO listo para el constructor de tickets.
 * @throws {Error} "VENTA_NO_ENCONTRADA" si el folio no existe.
 */
async obtenerVentaParaTicket(folio: string): Promise<VentaTicketDTO> {
  const venta = await this.accesoDatos.ventaDAO.getByFolio(folio);
  if (!venta) {
    throw new Error("VENTA_NO_ENCONTRADA");
  }
  return TicketMapper.toTicketDTO(venta);
}
}
