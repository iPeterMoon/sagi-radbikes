import { CrearProductoDTO, ActualizarProductoDTO } from "../DTOsEntrada/ProductoDTOs";

export interface IValidadorProducto {
  validarCreacion(dto: CrearProductoDTO): boolean;
  validarActualizacion(dto: ActualizarProductoDTO): boolean;
  validarPrecio(precio: number): boolean;
  validarStock(stock: number): boolean;
  validarSKU(sku: string): Promise<boolean>;
}