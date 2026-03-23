import { products } from "@prisma/client";
import { EstadoStock } from "../enums/EstadoStock";
import { ProductoDTO } from "../DTOsSalida/ProductoDTOs";
import { ImagenProductoMapper } from "./ImagenProductoMapper";
import { CategoriaMapper } from "./CategoriaMapper";
import { EtiquetaMapper } from "./EtiquetaMapper";

export class ProductoMapper {
  static toDTO(
    entity: products & {
      product_images?: any[];
      subcategory?: { categories?: any };
      brand?: any;
      product_physical?: any[];
    }
  ): ProductoDTO {
    return {
      idProducto: entity.id.toString(),
      nombre: entity.name || "",
      precio: entity.price || 0,
      stock: entity.stock || 0,
      descripcion: entity.description || "",
      imagenes: (entity.product_images || []).map(ImagenProductoMapper.toDTO),
      categoria: entity.subcategory?.categories
        ? CategoriaMapper.toDTO(entity.subcategory.categories)
        : { idCategoria: "", nombre: "", descripcion: "" },
      estadoStock: this.calcularEstadoStock(entity.stock || 0, entity.min_stock || 0),
      etiquetas: (entity.product_physical || []).map(EtiquetaMapper.toDTO),
    };
  }

  static calcularEstadoStock(stock: number, minStock: number): EstadoStock {
    if (minStock === 0) return EstadoStock.NORMAL;
    if (stock <= minStock * 0.5) return EstadoStock.CRITICO;
    if (stock <= minStock) return EstadoStock.BAJO;
    return EstadoStock.NORMAL;
  }
}