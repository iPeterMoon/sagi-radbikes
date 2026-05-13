import { ProductoVentaDTO } from "../DTOsSalida/ProductoVentaDTO";

/**
 * Mapper para transformar entidades de base de datos (Prisma) a DTOs de Productos.
 * Desacopla la estructura de la base de datos de lo que se expone a los clientes.
 */
export class ProductoMapper {
  
  /**
   * Mapea un producto crudo a un Data Transfer Object (DTO) optimizado para ventas.
   * * @param {any} p - Entidad de producto obtenida de Prisma.
   * @returns {ProductoVentaDTO} DTO del producto formateado.
   */
  static toDTO(p: any): ProductoVentaDTO {
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
  }

  /**
   * Mapea una lista de productos a una lista de DTOs.
    * @param {any[]} productos - Lista de entidades de producto.
    * @return {ProductoVentaDTO[]} Lista de DTOs de productos. 
  */
  static toDTOList(productos: any[]): ProductoVentaDTO[] {
    return productos.map(p => this.toDTO(p));
  }
}