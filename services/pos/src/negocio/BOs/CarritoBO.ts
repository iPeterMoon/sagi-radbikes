import { ProductoCarritoDTO } from "../DTOsEntrada/ProductoCarritoDTO";

export interface ICarritoBO {
  agregar(producto: ProductoCarritoDTO): void;
  eliminar(idProducto: string): void;
  limpiar(): void;
  cambiarCantidad(idProducto: string, cantidad: number): void;
  obtenerItems(): ProductoCarritoDTO[];
  calcularTotal(): number;
}

/**
 * Gestiona el estado del carrito en memoria.
 * El carrito es efímero — vive por request, no se persiste.
 */
export class CarritoBO implements ICarritoBO {
  private items: ProductoCarritoDTO[] = [];

  agregar(producto: ProductoCarritoDTO): void {
    const existente = this.items.find((i) => i.idProducto === producto.idProducto);
    if (existente) {
      existente.cantidad += producto.cantidad;
      existente.subtotal = existente.cantidad * existente.precioUnitario;
    } else {
      this.items.push({ ...producto });
    }
  }

  eliminar(idProducto: string): void {
    this.items = this.items.filter((i) => i.idProducto !== idProducto);
  }

  limpiar(): void {
    this.items = [];
  }

  cambiarCantidad(idProducto: string, cantidad: number): void {
    const item = this.items.find((i) => i.idProducto === idProducto);
    if (item) {
      item.cantidad = cantidad;
      item.subtotal = cantidad * item.precioUnitario;
    }
  }

  obtenerItems(): ProductoCarritoDTO[] {
    return [...this.items];
  }

  calcularTotal(): number {
    return this.items.reduce((acc, i) => acc + i.subtotal, 0);
  }
}
