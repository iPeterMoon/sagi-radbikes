import { products } from "@prisma/client";
import { EstadoStock } from "../enums/EstadoStock";
import { ProductoDTO } from "../DTOsSalida/ProductoDTOs";
import { ImagenProductoMapper } from "./ImagenProductoMapper";
import { CategoriaMapper } from "./CategoriaMapper";
import { MarcaMapper } from "./MarcaMapper";
import { SubCategoriaMapper } from "./SubCategoriaMapper";
import { EtiquetaMapper } from "./EtiquetaMapper";

export class ProductoMapper {
  static toDTO(
    entity: products & {
      product_images?: any[];
      subcategory?: {
        id: bigint;
        name: string | null;
        category_id: bigint | null;
        categories?: any;
      };
      brand?: {
        id: bigint;
        name: string | null;
      };
      product_physical?: any[];
    }
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
      marca: entity.brand
        ? MarcaMapper.toDTO(entity.brand as any)
        : { idMarca: "", nombre: "" },
      subcategoria: entity.subcategory
        ? SubCategoriaMapper.toDTO(entity.subcategory as any)
        : { idSubCategoria: "", nombre: "", idCategoria: "" },
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