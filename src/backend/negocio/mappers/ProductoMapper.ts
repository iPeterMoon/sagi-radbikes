import { products, product_images, subcategory, brands, product_physical, categories } from "@prisma/client";
import { EstadoStock } from "../enums/EstadoStock";
import { ProductoDTO } from "../DTOsSalida/ProductoDTOs";
import { ImagenProductoMapper } from "./ImagenProductoMapper";
import { CategoriaMapper } from "./CategoriaMapper";
import { MarcaMapper } from "./MarcaMapper";
import { SubCategoriaMapper } from "./SubCategoriaMapper";
import { EtiquetaMapper } from "./EtiquetaMapper";

/** Tipo extendido de producto que incluye todas las relaciones necesarias para el DTO. */
type ProductEntity = products & {
  product_images?: product_images[];
  subcategory?: subcategory & {
    categories?: categories;
  };
  brands?: brands;
  product_physical?: product_physical[];
};

/**
 * Mapper de producto.
 * Transforma la entidad Prisma `products` (con relaciones) al DTO completo `ProductoDTO`.
 */
export class ProductoMapper {
  /**
   * Convierte una entidad de producto con relaciones a DTO.
   * @param entity - Entidad `products` con imágenes, subcategoría, marca y etiquetas incluidas
   * @returns ProductoDTO listo para el cliente
   */
  static toDTO(
    entity: ProductEntity
  ): ProductoDTO {
    return {
      idProducto: entity.id.toString(),
      nombre: entity.name || "",
      sku: entity.SKU,
      codigoDeBarras: entity.barcode_upc || "",
      precio: entity.price || 0,
      stock: entity.stock || 0,
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
      estadoStock: this.calcularEstadoStock(entity.stock || 0, entity.min_stock || 0),
      etiquetas: (entity.product_physical || []).map(EtiquetaMapper.toDTO),
    };
  }

  /**
   * Calcula el estado de stock según la relación entre stock actual y stock mínimo.
   * - CRITICO: stock ≤ 50% del mínimo
   * - BAJO: stock ≤ mínimo
   * - NORMAL: stock > mínimo
   * @param stock - Stock actual
   * @param minStock - Stock mínimo configurado
   * @returns EstadoStock calculado
   */
  static calcularEstadoStock(stock: number, minStock: number): EstadoStock {
    if (minStock === 0) return EstadoStock.NORMAL;
    if (stock <= minStock * 0.5) return EstadoStock.CRITICO;
    if (stock <= minStock) return EstadoStock.BAJO;
    return EstadoStock.NORMAL;
  }
}