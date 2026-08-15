import { ProductoVentaDTO } from "../DTOsSalida/ProductoVentaDTO";

/**
 * Mapper para transformar entidades de base de datos (Prisma) a DTOs de Productos.
 * Desacopla la estructura de la base de datos de lo que se expone a los clientes.
 */
export class ProductoMapper {

  /**
   * Mapea una variante cruda a un Data Transfer Object (DTO) optimizado para ventas.
   * * @param {any} p - Entidad de variante (product_variants) obtenida de Prisma.
   * @returns {ProductoVentaDTO} DTO de la variante formateado.
   */
  static toDTO(p: any): ProductoVentaDTO {
    const variantImgs = p.product_images ?? [];
    const productImgs = p.products?.product_images ?? [];
    const imagenPrincipal =
      variantImgs.find((img: any) => img.is_main_image)?.image_url ||
      variantImgs[0]?.image_url ||
      productImgs.find((img: any) => img.is_main_image)?.image_url ||
      productImgs[0]?.image_url ||
      "";

    return {
      idVariante: String(p.id),
      nombre: p.products?.name ?? "",
      precio: p.price ?? 0,
      stock: p.stock ?? 0,
      descripcion: p.products?.description ?? "",
      SKU: p.SKU,
      codigoBarras: p.barcode_upc ?? "",
      urlImagen: imagenPrincipal,
      categoria: {
        idCategoria: String(p.products?.subcategory?.id ?? ""),
        nombre: p.products?.subcategory?.name ?? "",
      },
      atributos: (p.product_variant_attributes ?? []).map((a: any) => ({
        nombre: a.name ?? "",
        valor: a.value ?? "",
      })),
      idProductoPadre: String(p.product_id),
    };
  }

  /**
   * Mapea una lista de variantes a una lista de DTOs.
    * @param {any[]} productos - Lista de entidades de variante.
    * @return {ProductoVentaDTO[]} Lista de DTOs de productos.
  */
  static toDTOList(productos: any[]): ProductoVentaDTO[] {
    return productos.map(p => this.toDTO(p));
  }
}
