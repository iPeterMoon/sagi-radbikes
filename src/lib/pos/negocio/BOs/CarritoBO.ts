import { ProductoCarritoDTO } from "../DTOsEntrada/ProductoCarritoDTO";
import { ICarritoBO } from "../interfaces/ICarritoBO";

/**
 * Gestiona el estado del carrito en memoria.
 * El carrito es efímero — vive por request/instancia, no se persiste en base de datos.
 */
export class CarritoBO implements ICarritoBO {
  private items: ProductoCarritoDTO[] = [];

  /**
   * Agrega un producto al carrito o actualiza su cantidad si ya existe.
   * @param {ProductoCarritoDTO} producto - Producto a agregar.
   */
  agregar(producto: ProductoCarritoDTO): void {
    const existente = this.items.find((i) => i.idProducto === producto.idProducto);
    if (existente) {
      existente.cantidad += producto.cantidad;
      existente.subtotal = existente.cantidad * existente.precioUnitario;
    } else {
      this.items.push({ ...producto });
    }
  }

  /**
   * Elimina un producto del carrito.
   * @param {string} idProducto - ID del producto a eliminar.
   */
  eliminar(idProducto: string): void {
    this.items = this.items.filter((i) => i.idProducto !== idProducto);
  }

  /**
   * Limpia el carrito, eliminando todos los productos.
   */
  limpiar(): void {
    this.items = [];
  }

  /**
   * Cambia la cantidad de un producto en el carrito.
   * @param {string} idProducto - ID del producto.
   * @param {number} cantidad - Nueva cantidad.
   */
  async cambiarCantidad(idProducto: string, cantidad: number): Promise<void> {
    const item = this.items.find((i) => i.idProducto === idProducto);
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
