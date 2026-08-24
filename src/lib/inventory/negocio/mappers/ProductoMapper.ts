import { products, product_images, subcategory, brands, product_physical, categories, product_variants, product_variant_attributes } from "@prisma/client";
import { EstadoStock } from "../enums/EstadoStock";
import { ProductoDTO } from "../DTOsSalida";
import { ImagenProductoMapper } from "./ImagenProductoMapper";
import { CategoriaMapper } from "./CategoriaMapper";
import { MarcaMapper } from "./MarcaMapper";
import { SubCategoriaMapper } from "./SubCategoriaMapper";
import { EtiquetaMapper } from "./EtiquetaMapper";
import { VarianteMapper } from "./VarianteMapper";

/** Tipo extendido de producto que incluye todas las relaciones necesarias para el DTO. */
type ProductEntity = products & {
  product_images?: product_images[];
  subcategory?: subcategory & {
    categories?: categories;
  };
  brands?: brands;
  product_physical?: product_physical[];
  product_variants?: (product_variants & {
    product_variant_attributes?: product_variant_attributes[];
    product_images?: product_images[];
  })[];
};

/**
 * Mapper de producto.
 * Transforma la entidad Prisma `products` (con relaciones) al DTO completo `ProductoDTO`.
 */
export class ProductoMapper {
  /**
   * Convierte una entidad de producto con relaciones a DTO.
   * El estado de stock se calcula agregando el stock y stock mínimo de las
   * variantes activas del producto (el producto ya no tiene stock propio).
   * @param entity - Entidad `products` con imágenes, subcategoría, marca, etiquetas y variantes incluidas
   * @returns ProductoDTO listo para el cliente
   */
  static toDTO(
    entity: ProductEntity
  ): ProductoDTO {
    const variantes = (entity.product_variants || []).map(VarianteMapper.toDTO);
    const variantesActivas = variantes.filter((v) => v.activo);
    const stockTotal = variantesActivas.reduce((acc, v) => acc + v.stock, 0);

    return {
      idProducto: entity.id.toString(),
      nombre: entity.name || "",
      precioReferencia: entity.price || 0,
      costoReferencia: entity.cost || 0,
      descripcion: entity.description || "",
      imagenes: (entity.product_images || []).map(ImagenProductoMapper.toDTO),
      categoria: entity.subcategory?.categories
        ? CategoriaMapper.toDTO(entity.subcategory.categories)
        : { idCategoria: "", nombre: "", descripcion: "" },
      marca: entity.brands
        ? MarcaMapper.toDTO(entity.brands)
        : { idMarca: "", nombre: "" },
      subcategoria: entity.subcategory
        ? SubCategoriaMapper.toDTO(entity.subcategory)
        : { idSubCategoria: "", nombre: "", idCategoria: "" },
      minStockReferencia: entity.min_stock || 0,
      estadoStock: this.calcularEstadoStock(variantesActivas),
      activo: entity.is_active ?? true,
      etiquetas: (entity.product_physical || []).map(EtiquetaMapper.toDTO),
      variantes,
    };
  }

  /**
   * Calcula el estado de stock del producto como el peor estado entre sus variantes
   * activas, evaluando cada variante contra su propio stock mínimo. Las variantes sin
   * umbral configurado (`minStock == null`, notificaciones desactivadas) se ignoran.
   * - CRITICO: stock ≤ 50% del mínimo de esa variante
   * - BAJO: stock ≤ mínimo de esa variante
   * - NORMAL: stock > mínimo, o ninguna variante activa tiene umbral configurado
   * @param variantesActivas - Variantes activas del producto, con su stock y mínimo
   * @returns EstadoStock calculado
   */
  static calcularEstadoStock(
    variantesActivas: { stock: number; minStock: number | null }[],
  ): EstadoStock {
    const rango: Record<EstadoStock, number> = {
      [EstadoStock.NORMAL]: 0,
      [EstadoStock.BAJO]: 1,
      [EstadoStock.CRITICO]: 2,
    };
    let peor = EstadoStock.NORMAL;
    for (const v of variantesActivas) {
      const estado = this.calcularEstadoVariante(v.stock, v.minStock);
      if (rango[estado] > rango[peor]) peor = estado;
    }
    return peor;
  }

  /**
   * Calcula el estado de stock de una única variante contra su propio mínimo.
   * @param stock - Stock actual de la variante
   * @param minStock - Stock mínimo configurado, o `null` si está desactivado
   * @returns EstadoStock calculado
   */
  static calcularEstadoVariante(stock: number, minStock: number | null): EstadoStock {
    if (minStock == null) return EstadoStock.NORMAL;
    if (stock <= minStock * 0.5) return EstadoStock.CRITICO;
    if (stock <= minStock) return EstadoStock.BAJO;
    return EstadoStock.NORMAL;
  }
}
