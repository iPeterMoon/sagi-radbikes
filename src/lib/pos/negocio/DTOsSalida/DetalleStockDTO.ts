/**
 * DTO utilitario empleado para reportar un conflicto de inventario (Stock Out)
 * en el que el cliente intenta comprar más unidades de las que físicamente hay.
 */
export class DetalleStockDTO {
  /**
   * @param {string} producto - Nombre o ID del producto sin stock.
   * @param {number} solicitado - Cantidad que el usuario intentó adquirir.
   * @param {number} disponible - Cantidad real que existe actualmente en base de datos.
   */
  constructor(
    public producto: string,
    public solicitado: number,
    public disponible: number
  ) {}
}