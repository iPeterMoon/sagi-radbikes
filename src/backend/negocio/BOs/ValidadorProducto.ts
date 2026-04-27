import { CrearProductoDTO, ActualizarProductoDTO } from "../DTOsEntrada/ProductoDTOs";
import { IValidadorProducto } from "../interfaces/IValidadorProducto";
import { IAccesoDatos } from "../../datos/IAccesoDatos";

/**
 * Validador de reglas de negocio para productos.
 * Centraliza las validaciones de campos obligatorios y restricciones de valores.
 */
export class ValidadorProducto implements IValidadorProducto {
  constructor(private accesoDatos: IAccesoDatos) {}

  /**
   * Valida los campos obligatorios para la creación de un producto.
   * @param dto - DTO de creación a validar
   * @returns `true` si todos los campos requeridos son válidos
   */
  validarCreacion(dto: CrearProductoDTO): boolean {
    if (!dto.nombre || dto.nombre.trim() === "") return false;
    if (!dto.precio || dto.precio < 0) return false;
    if (dto.stock === undefined || dto.stock < 0) return false;
    if (!dto.idCategoria) return false;
    if (!dto.idMarca) return false;
    return true;
  }

  validarActualizacion(dto: ActualizarProductoDTO): boolean {
    if (!dto.idProducto) return false;
    return this.validarCreacion({
      nombre: dto.nombre,
      precio: dto.precio,
      stock: dto.stock,
      descripcion: dto.descripcion,
      idCategoria: dto.idCategoria,
      idMarca: dto.idMarca,
      imagenesArchivo: [],
      idSubCategoria: dto.idSubCategoria,
    });
  }

  validarPrecio(precio: number): boolean {
    return precio >= 0;
  }

  validarStock(stock: number): boolean {
    return stock >= 0;
  }

  /**
   * Verifica que un SKU no esté ya en uso en la base de datos.
   * @param sku - Código SKU a verificar
   * @returns `true` si el SKU está disponible
   */
  async validarSKU(sku: string): Promise<boolean> {
    if (!sku || sku.trim() === "") return false;
    const producto = await this.accesoDatos.productDAO.getBySKU(sku);
    return producto === null;
  }
}