import { product_variants, product_variant_attributes, product_images } from "@prisma/client";
import { VarianteDTO } from "../DTOsSalida";
import { ImagenProductoMapper } from "./ImagenProductoMapper";
import { AtributoVarianteMapper } from "./AtributoVarianteMapper";

/** Tipo extendido de variante que incluye las relaciones necesarias para el DTO. */
type VariantEntity = product_variants & {
  product_variant_attributes?: product_variant_attributes[];
  product_images?: product_images[];
};

/**
 * Mapper de variante de producto.
 * Transforma la entidad Prisma `product_variants` (con relaciones) al DTO completo `VarianteDTO`.
 */
export class VarianteMapper {
  /**
   * Convierte una entidad de variante con relaciones a DTO.
   * @param entity - Entidad `product_variants` con atributos e imágenes incluidos
   * @returns VarianteDTO listo para el cliente
   */
  static toDTO(entity: VariantEntity): VarianteDTO {
    return {
      idVariante: entity.id.toString(),
      idProducto: entity.product_id.toString(),
      sku: entity.SKU,
      codigoDeBarras: entity.barcode_upc || "",
      precio: entity.price || 0,
      costo: entity.cost || 0,
      stock: entity.stock || 0,
      minStock: entity.min_stock ?? null,
      activo: entity.is_active ?? true,
      imagenes: (entity.product_images || []).map(ImagenProductoMapper.toDTO),
      atributos: (entity.product_variant_attributes || []).map(AtributoVarianteMapper.toDTO),
    };
  }
}
