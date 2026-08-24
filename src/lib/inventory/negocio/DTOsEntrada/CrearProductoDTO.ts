/**
 * Objeto de Transferencia de Datos (DTO) que encapsula la información requerida
 * para crear y registrar un nuevo producto en el catálogo.
 */
export interface CrearProductoDTO {
  /**
   * El nombre descriptivo que se le asignará al nuevo producto.
   */
  nombre: string;

  /**
   * El precio base de venta del producto, sin incluir impuestos.
   */
  precio: number;

  /**
   * El costo de referencia/plantilla del producto, usado para pre-llenar el
   * costo al crear una variante y sugerir un precio de venta.
   */
  costo?: number;

  /**
   * La cantidad de unidades iniciales disponibles en el inventario al momento de su creación.
   */
  stock: number;

  /**
   * El código de barras universal (UPC) opcional del producto.
   */
  codigoDeBarras?: string;

  /**
   * El límite mínimo opcional de existencias permitido en inventario antes de requerir reabastecimiento.
   */
  minStock?: number;

  /**
   * La descripción detallada de las características y especificaciones del producto.
   */
  descripcion: string;

  /**
   * El identificador único de la categoría principal a la que pertenecerá el producto.
   */
  idCategoria: string;

  /**
   * El identificador único de la marca fabricante o distribuidora del producto.
   */
  idMarca: string;

  /**
   * La lista de archivos de imagen subidos (gestionados por Multer) que representarán visualmente al producto.
   */
  imagenesArchivo: File[];

  /**
   * El identificador único de la subcategoría específica a la que pertenecerá el producto.
   */
  idSubCategoria: string;

  /**
   * Una colección opcional de atributos adicionales clave-valor (etiquetas) que describen
   * propiedades específicas del producto (por ejemplo, color, talla, material).
   */
  etiquetas?: { name: string; value: string }[];
}
