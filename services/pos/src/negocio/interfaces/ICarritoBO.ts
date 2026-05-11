import { ProductoCarritoDTO } from "../DTOsEntrada/ProductoCarritoDTO";

export interface ICarritoBO {
  agregar(producto: ProductoCarritoDTO): void;
  eliminar(idProducto: string): void;
  limpiar(): void;
  cambiarCantidad(idProducto: string, cantidad: number): void;
  obtenerItems(): ProductoCarritoDTO[];
  calcularTotal(): number;
}