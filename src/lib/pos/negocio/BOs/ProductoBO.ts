import { ProductoVentaDTO } from "../DTOsSalida/ProductoVentaDTO";
import { IPOSAccesoDatos } from "../../datos/daos/interfaces/IPOSAccesoDatos";
import { IProductoBO } from "../interfaces/IProductoBO";
import { ProductoMapper } from "../mappers/ProductoMapper";

/**
 * Objeto de Negocio encargado de las reglas y lógica de los Productos en el POS.
 */
export class ProductoBO implements IProductoBO {
  /**
   * @param {IPOSAccesoDatos} accesoDatos - Interfaz consolidada de acceso a repositorios.
   */
  constructor(private accesoDatos: IPOSAccesoDatos) { }

  /**
   * Filtra y obtiene los productos del catálogo. Si se provee una búsqueda, 
   * busca coincidencias por nombre o SKU.
   * @param {string} [busqueda] - Término opcional para filtrar productos.
   * @returns {Promise<ProductoVentaDTO[]>} Lista de productos en formato DTO.
   */
  async filtrarCatalogo(busqueda?: string): Promise<ProductoVentaDTO[]> {
    const productos = busqueda
      ? await this.accesoDatos.productoDAO.buscarPorNombreOSKU(busqueda)
      : await this.accesoDatos.productoDAO.getActivos();

    return ProductoMapper.toDTOList(productos);
  }

  /**
   * Verifica si hay suficiente stock para un producto.
   * @param {string} idProducto - ID del producto.
   * @param {number} cantidad - Cantidad a verificar.
   * @returns {Promise<boolean>} true si hay suficiente stock, false en caso contrario.
   */
  async verificarStock(idProducto: string, cantidad: number): Promise<boolean> {
    const producto = await this.accesoDatos.productoDAO.getById(BigInt(idProducto));
    if (!producto) return false;
    return (producto.stock ?? 0) >= cantidad;
  }
}