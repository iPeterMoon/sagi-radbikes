export class DetalleStockDTO {
  constructor(
    public producto: string,
    public solicitado: number,
    public disponible: number
  ) {}
}
