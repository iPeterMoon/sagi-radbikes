import { POSAccesoDatos } from "../../datos/POSAccesoDatos";
import { ProductoVentaDTO } from "../DTOsSalida/VentaDTOs";

export interface IProductoBO {
  filtrarCatalogo(busqueda?: string): Promise<ProductoVentaDTO[]>;
  verificarStock(idProducto: string, cantidad: number): Promise<boolean>;
}

export class ProductoBO implements IProductoBO {
  constructor(private accesoDatos: POSAccesoDatos) {}

  async filtrarCatalogo(busqueda?: string): Promise<ProductoVentaDTO[]> {
    const productos = busqueda
      ? await this.accesoDatos.productoDAO.buscarPorNombreOSKU(busqueda)
      : await this.accesoDatos.productoDAO.getActivos();

    return productos.map((p: any) => {
      const imagenPrincipal =
        p.product_images?.find((img: any) => img.is_main_image)?.image_url ||
        p.product_images?.[0]?.image_url ||
        "";

      return {
        idProducto: String(p.id),
        nombre: p.name ?? "",
        precio: p.price ?? 0,
        stock: p.stock ?? 0,
        descripcion: p.description ?? "",
        SKU: p.SKU,
        codigoBarras: p.barcode_upc ?? "",
        urlImagen: imagenPrincipal,
        categoria: {
          idCategoria: String(p.subcategory?.id ?? ""),
          nombre: p.subcategory?.name ?? "",
        },
      };
    });
  }

  async verificarStock(idProducto: string, cantidad: number): Promise<boolean> {
    const producto = await this.accesoDatos.productoDAO.getById(BigInt(idProducto));
    if (!producto) return false;
    return (producto.stock ?? 0) >= cantidad;
  }
}
