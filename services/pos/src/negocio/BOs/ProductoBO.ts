import { ProductoVentaDTO } from "../DTOsSalida/ProductoVentaDTO";
import { IPOSAccesoDatos } from "../../datos/daos/interfaces/IPOSAccesoDatos";
import { IProductoBO } from "../interfaces/IProductoBO";
import { ProductoMapper } from "../mappers/ProductoMapper";

export class ProductoBO implements IProductoBO {
  constructor(private accesoDatos: IPOSAccesoDatos) {}

  async filtrarCatalogo(busqueda?: string): Promise<ProductoVentaDTO[]> {
    const productos = busqueda
      ? await this.accesoDatos.productoDAO.buscarPorNombreOSKU(busqueda)
      : await this.accesoDatos.productoDAO.getActivos();

    return ProductoMapper.toDTOList(productos);
  }

  async verificarStock(idProducto: string, cantidad: number): Promise<boolean> {
    const producto = await this.accesoDatos.productoDAO.getById(BigInt(idProducto));
    if (!producto) return false;
    return (producto.stock ?? 0) >= cantidad;
  }
}