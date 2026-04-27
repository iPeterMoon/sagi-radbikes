/** Datos requeridos para crear un nuevo producto en el catálogo. */
export interface CrearProductoDTO {
  /** Nombre descriptivo del producto. */
  nombre: string;
  /** Precio de venta sin impuestos. */
  precio: number;
  /** Cantidad inicial en inventario. */
  stock: number;
  /** Descripción detallada del producto. */
  descripcion: string;
  /** ID de la categoría a la que pertenece. */
  idCategoria: string;
  /** ID de la marca del producto. */
  idMarca: string;
  /** Archivos de imagen a subir para el producto. */
  imagenesArchivo: File[];
  /** ID de la subcategoría a la que pertenece. */
  idSubCategoria: string;
  /** Atributos adicionales clave-valor del producto (ej. color, talla). */
  etiquetas?: { name: string; value: string }[];
}

/** Datos para actualizar un producto existente. */
export interface ActualizarProductoDTO {
  /** ID del producto a actualizar. */
  idProducto: string;
  /** Nuevo nombre del producto. */
  nombre: string;
  /** Nuevo precio de venta. */
  precio: number;
  /** Nueva cantidad en inventario. */
  stock: number;
  /** Nueva descripción del producto. */
  descripcion: string;
  /** Nuevo ID de categoría. */
  idCategoria: string;
  /** Nuevas imágenes a agregar. */
  imagenesNuevas: File[];
  /** IDs de imágenes a eliminar. */
  imagenesEliminar: string[];
  /** ID de la imagen que será principal. */
  idImagenPrincipal: string;
  /** Nuevo ID de marca. */
  idMarca: string;
  /** Nuevo ID de subcategoría. */
  idSubCategoria: string;
  /** Nuevas etiquetas; reemplaza el conjunto existente. */
  etiquetas?: { name: string; value: string }[];
}

/** Criterios de búsqueda y filtrado para la consulta de productos. */
export interface FiltroProductoDTO {
  /** Término de búsqueda libre (por nombre o SKU). */
  busqueda: string;
  /** Filtrar por ID de categoría. */
  idCategoria: string;
  /** Filtrar por ID de marca. */
  idMarca: string;
  /** Filtrar por estado de stock (NORMAL, BAJO, CRITICO). */
  estadoStock: string;
  /** Filtrar por ID de subcategoría. */
  idSubCategoria: string;
  /** Precio mínimo del rango de búsqueda. */
  precioMin: number;
  /** Precio máximo del rango de búsqueda. */
  precioMax: number;
}