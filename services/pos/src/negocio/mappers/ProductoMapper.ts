import { ProductoVentaDTO } from "../DTOsSalida/ProductoVentaDTO";

export class ProductoMapper {
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

  static toDTOList(productos: any[]): ProductoVentaDTO[] {
    return productos.map(p => this.toDTO(p));
  }
}