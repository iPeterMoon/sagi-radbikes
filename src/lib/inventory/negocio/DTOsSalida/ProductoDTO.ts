import { EstadoStock } from "../enums/EstadoStock";
import { CategoriaDTO } from "./CategoriaDTO";
import { MarcaDTO } from "./MarcaDTO";
import { SubCategoriaDTO } from "./SubCategoriaDTO";
import { ImagenProductoDTO } from "./ImagenProductoDTO";
import { EtiquetaDTO } from "./EtiquetaDTO";
import { VarianteDTO } from "./VarianteDTO";

/**
 * Objeto de Transferencia de Datos (DTO) que representa la información completa
 * y detallada de un producto, diseñada para ser presentada al cliente o consumidor.
 * El SKU, precio y stock autoritativos viven en sus variantes (`VarianteDTO`); los
 * campos `precioReferencia`/`minStockReferencia` aquí son solo valores de plantilla.
 */
export interface ProductoDTO {
  /**
   * El identificador único del producto en la base de datos.
   */
  idProducto: string;

  /**
   * El nombre descriptivo y comercial del producto.
   */
  nombre: string;

  /**
   * El precio de referencia/plantilla del producto, usado para pre-llenar el precio al crear una variante.
   */
  precioReferencia: number;

  /**
   * El costo de referencia/plantilla del producto, usado para pre-llenar el costo al crear una variante.
   */
  costoReferencia: number;

  /**
   * La descripción detallada que especifica las características y bondades del producto.
   */
  descripcion: string;

  /**
   * Una colección de objetos que contienen la información de las imágenes generales del producto.
   */
  imagenes: ImagenProductoDTO[];

  /**
   * El objeto con la información de la categoría principal a la que pertenece el producto.
   */
  categoria: CategoriaDTO;

  /**
   * El objeto con la información de la marca fabricante o proveedora del producto.
   */
  marca: MarcaDTO;

  /**
   * El objeto con la información de la subcategoría específica donde se clasifica el producto.
   */
  subcategoria: SubCategoriaDTO;

  /**
   * El límite inferior de existencias de referencia/plantilla, usado para pre-llenar el stock mínimo al crear una variante.
   */
  minStockReferencia: number;

  /**
   * El estado lógico del inventario (por ejemplo: NORMAL, BAJO o CRÍTICO), calculado agregando
   * el stock y stock mínimo de las variantes activas del producto.
   */
  estadoStock: EstadoStock;

  /**
   * Indica si el producto se encuentra activo y disponible para su visualización o venta.
   */
  activo: boolean;

  /**
   * Una lista de atributos dinámicos o etiquetas clave-valor que complementan la información del producto.
   */
  etiquetas: EtiquetaDTO[];

  /**
   * Las variantes vendibles del producto (SKU, precio y stock autoritativos).
   */
  variantes: VarianteDTO[];
}
