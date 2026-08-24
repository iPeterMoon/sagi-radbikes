/**
 * Objeto de Transferencia de Datos (DTO) utilizado para encapsular la información
 * necesaria al actualizar los datos y relaciones de un producto existente.
 */
export interface ActualizarProductoDTO {
  /**
   * El identificador único del producto que se va a actualizar.
   */
  idProducto: string;

  /**
   * El nuevo nombre que se le asignará al producto.
   */
  nombre: string;

  /**
   * El nuevo precio de venta aplicable al producto.
   */
  precio: number;

  /**
   * El nuevo costo de referencia/plantilla del producto.
   */
  costo?: number;

  /**
   * La nueva cantidad de unidades disponibles en el inventario.
   */
  stock: number;

  /**
   * El código de barras universal (UPC) del producto.
   */
  codigoDeBarras?: string;

  /**
   * El límite mínimo de existencias permitido antes de requerir reabastecimiento.
   */
  minStock?: number;

  /**
   * La nueva descripción detallada de las características del producto.
   */
  descripcion: string;

  /**
   * El nuevo identificador único de la categoría a la que pertenece el producto.
   */
  idCategoria: string;

  /**
   * La lista de nuevos archivos de imagen subidos que se asociarán al producto.
   */
  imagenesNuevas: File[];

  /**
   * La lista de identificadores únicos de las imágenes que se desean eliminar.
   */
  imagenesEliminar: string[];

  /**
   * El identificador único de la imagen que quedará como representativa o principal.
   */
  idImagenPrincipal: string;

  /**
   * El nuevo identificador único de la marca fabricante o distribuidora del producto.
   */
  idMarca: string;

  /**
   * El nuevo identificador único de la subcategoría específica del producto.
   */
  idSubCategoria: string;

  /**
   * La nueva lista de atributos clave-valor (etiquetas) que reemplazará al conjunto
   * de etiquetas actualmente asociadas al producto.
   */
  etiquetas?: { name: string; value: string }[];
}
