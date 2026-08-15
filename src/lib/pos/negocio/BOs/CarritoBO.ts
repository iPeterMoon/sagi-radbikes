import { ProductoCarritoDTO } from "../DTOsEntrada/ProductoCarritoDTO";
import { ICarritoBO } from "../interfaces/ICarritoBO";

/**
 * Gestiona el estado del carrito en memoria.
 * El carrito es efímero — vive por request/instancia, no se persiste en base de datos.
 */
export class CarritoBO implements ICarritoBO {
  private items: ProductoCarritoDTO[] = [];

  /**
   * Agrega una variante al carrito o actualiza su cantidad si ya existe.
   * @param {ProductoCarritoDTO} producto - Variante a agregar.
   */
  agregar(producto: ProductoCarritoDTO): void {
    const existente = this.items.find((i) => i.idVariante === producto.idVariante);
    if (existente) {
      existente.cantidad += producto.cantidad;
      existente.subtotal = existente.cantidad * existente.precioUnitario;
    } else {
      this.items.push({ ...producto });
    }
  }

  /**
   * Elimina una variante del carrito.
   * @param {string} idVariante - ID de la variante a eliminar.
   */
  eliminar(idVariante: string): void {
    this.items = this.items.filter((i) => i.idVariante !== idVariante);
  }

  /**
   * Limpia el carrito, eliminando todos los productos.
   */
  limpiar(): void {
    this.items = [];
  }

  /**
   * Cambia la cantidad de una variante en el carrito.
   * @param {string} idVariante - ID de la variante.
   * @param {number} cantidad - Nueva cantidad.
   */
  async cambiarCantidad(idVariante: string, cantidad: number): Promise<void> {
    const item = this.items.find((i) => i.idVariante === idVariante);
    if (item) {
      item.cantidad = cantidad;
      item.subtotal = cantidad * item.precioUnitario;
    }
  }

  /**
   * Obtiene una copia inmutable de los elementos actuales del carrito.
   * @returns {ProductoCarritoDTO[]} Array con los elementos del carrito.
   */
  obtenerItems(): ProductoCarritoDTO[] {
    return [...this.items];
  }

  /**
   * Calcula el total del carrito.
   * @returns {number} Total del carrito.
   */
  calcularTotal(): number {
    return this.items.reduce((acc, i) => acc + i.subtotal, 0);
  }
}
