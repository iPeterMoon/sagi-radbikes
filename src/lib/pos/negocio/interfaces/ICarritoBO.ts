import { ProductoCarritoDTO } from "../DTOsEntrada/ProductoCarritoDTO";

/** Contrato para el manejo de estado en la memoria para un carrito de compras. */
export interface ICarritoBO {
  agregar(producto: ProductoCarritoDTO): void;
  eliminar(idVariante: string): void;
  limpiar(): void;
  cambiarCantidad(idVariante: string, cantidad: number): Promise<void>;
  obtenerItems(): ProductoCarritoDTO[];
  calcularTotal(): number;
}
