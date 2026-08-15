import {
  ProductoDTO,
  CategoriaDTO,
  MarcaDTO,
  SubCategoriaDTO,
  EtiquetaDTO,
  CrearEtiquetaDTO,
  CrearProductoDTO,
  ActualizarProductoDTO,
  FiltroProductoDTO,
  VarianteDTO,
  CrearVarianteDTO,
  ActualizarVarianteDTO,
  AtributoVarianteDTO,
  CrearAtributoVarianteDTO,
} from "@/types/dtos";

/** URL base para los endpoints del inventario. */
const API_BASE = "/api/inventario";

/**
 * Utilidad genérica para peticiones HTTP que incluye credenciales de cookie.
 * Lanza un `Error` si la respuesta no es `ok`.
 * @param url - URL del recurso
 * @param options - Opciones adicionales de `fetch`
 * @returns Respuesta deserializada como `T`
 */
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, credentials: "include" });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }
  return res.json();
}

/** Conjunto de funciones para interactuar con la API del inventario. */
export const inventarioApi = {
  /**
   * Obtiene la lista de productos aplicando filtros opcionales.
   * @param filtro - Criterios de búsqueda y filtrado
   * @returns Array de productos que cumplen los criterios
   */
  async obtenerProductos(filtro?: FiltroProductoDTO): Promise<ProductoDTO[]> {
    const params = new URLSearchParams();
    if (filtro?.busqueda) params.set("busqueda", filtro.busqueda);
    if (filtro?.idCategoria) params.set("idCategoria", filtro.idCategoria);
    if (filtro?.idMarca) params.set("idMarca", filtro.idMarca);
    if (filtro?.estadoStock) params.set("estadoStock", filtro.estadoStock);
    if (filtro?.idSubCategoria)
      params.set("idSubCategoria", filtro.idSubCategoria);
    if (filtro?.precioMin) params.set("precioMin", filtro.precioMin.toString());
    if (filtro?.precioMax) params.set("precioMax", filtro.precioMax.toString());

    const query = params.toString();
    return fetchApi<ProductoDTO[]>(
      `${API_BASE}/productos${query ? `?${query}` : ""}`,
    );
  },

  /** Obtiene un producto por su ID. */
  async obtenerProductoPorId(id: string): Promise<ProductoDTO> {
    return fetchApi<ProductoDTO>(`${API_BASE}/productos/${id}`);
  },

  /** Crea un nuevo producto. */
  async crearProducto(producto: CrearProductoDTO): Promise<ProductoDTO> {
    return fetchApi<ProductoDTO>(`${API_BASE}/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(producto),
    });
  },

  /** Actualiza un producto existente. */
  async actualizarProducto(
    producto: ActualizarProductoDTO,
  ): Promise<ProductoDTO> {
    return fetchApi<ProductoDTO>(`${API_BASE}/productos/${producto.idProducto}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(producto),
    });
  },

  /** Elimina un producto por su ID. */
  async eliminarProducto(id: string): Promise<boolean> {
    return fetchApi<boolean>(`${API_BASE}/productos/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Actualiza el estado de visibilidad de un producto (activo/inactivo).
   * @param id - ID del producto
   */
  async actualizarEstado(id: string): Promise<boolean> {
    return fetchApi<boolean>(`${API_BASE}/productos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: 'toggleStatus' }),
    });
  },

  /** Obtiene todas las categorías disponibles. */
  async obtenerCategorias(): Promise<CategoriaDTO[]> {
    return fetchApi<CategoriaDTO[]>(`${API_BASE}/categorias`);
  },

  /** Obtiene todas las marcas disponibles. */
  async obtenerMarcas(): Promise<MarcaDTO[]> {
    return fetchApi<MarcaDTO[]>(`${API_BASE}/marcas`);
  },

  /**
   * Obtiene subcategorías, opcionalmente filtradas por categoría padre.
   * @param idCategoria - ID de la categoría padre (opcional)
   */
  async obtenerSubCategorias(idCategoria?: string): Promise<SubCategoriaDTO[]> {
    const params = idCategoria ? `?idCategoria=${idCategoria}` : "";
    return fetchApi<SubCategoriaDTO[]>(`${API_BASE}/subcategorias${params}`);
  },

  /** Crea una nueva categoría. */
  async crearCategoria(
    categoria: Omit<CategoriaDTO, "idCategoria">,
  ): Promise<CategoriaDTO> {
    return fetchApi<CategoriaDTO>(`${API_BASE}/categorias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(categoria),
    });
  },

  /** Crea una nueva marca. */
  async crearMarca(marca: Omit<MarcaDTO, "idMarca">): Promise<MarcaDTO> {
    return fetchApi<MarcaDTO>(`${API_BASE}/marcas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(marca),
    });
  },

  /** Crea una nueva subcategoría. */
  async crearSubCategoria(
    subCategoria: Omit<SubCategoriaDTO, "idSubCategoria">,
  ): Promise<SubCategoriaDTO> {
    return fetchApi<SubCategoriaDTO>(`${API_BASE}/subcategorias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subCategoria),
    });
  },

  /**
   * Sube nuevas imágenes para un producto.
   * @param idProducto - ID del producto destino
   * @param archivos - Archivos de imagen a subir
   * @param mainImageIndex - Índice del archivo que será la imagen principal
   * @param idVariante - ID de la variante a la que pertenecen las imágenes (opcional)
   */
  async agregarImagenes(
    idProducto: string,
    archivos: File[],
    mainImageIndex?: number,
    idVariante?: string,
  ): Promise<void> {
    const formData = new FormData();
    formData.append("idProducto", idProducto);
    archivos.forEach((file) => formData.append("archivos", file));
    if (mainImageIndex !== undefined) {
      formData.append("mainImageIndex", mainImageIndex.toString());
    }
    if (idVariante) {
      formData.append("idVariante", idVariante);
    }
    await fetchApi<void>(`${API_BASE}/productos/${idProducto}/imagenes`, {
      method: "POST",
      body: formData,
    });
  },

  /** Elimina una imagen de producto por su ID. */
  async eliminarImagen(idImagen: string): Promise<boolean> {
    return fetchApi<boolean>(`${API_BASE}/imagenes/${idImagen}`, {
      method: "DELETE",
    });
  },

  /**
   * Establece la imagen principal de un producto.
   * @param idImagen - ID de la imagen a establecer como principal
   */
  async establecerImagenPrincipal(idImagen: string): Promise<boolean> {
    return fetchApi<boolean>(`${API_BASE}/imagenes/${idImagen}/principal`, {
      method: "PATCH",
    });
  },

  /** Obtiene las etiquetas (atributos) de un producto específico. */
  async obtenerEtiquetas(idProducto: string): Promise<EtiquetaDTO[]> {
    return fetchApi<EtiquetaDTO[]>(`${API_BASE}/etiquetas/${idProducto}`);
  },

  /**
   * Crea una nueva etiqueta (atributo clave-valor) asociada a un producto.
   * @param etiqueta - Datos de la etiqueta a crear
   */
  async crearEtiqueta(
    etiqueta: CrearEtiquetaDTO,
  ): Promise<EtiquetaDTO> {
    return fetchApi<EtiquetaDTO>(`${API_BASE}/etiquetas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(etiqueta),
    });
  },

  /** Elimina una etiqueta por su ID. */
  async eliminarEtiqueta(idEtiqueta: string): Promise<boolean> {
    return fetchApi<boolean>(`${API_BASE}/etiquetas/${idEtiqueta}`, {
      method: "DELETE",
    });
  },

  /** Obtiene las variantes de un producto específico. */
  async obtenerVariantes(idProducto: string): Promise<VarianteDTO[]> {
    return fetchApi<VarianteDTO[]>(
      `${API_BASE}/productos/${idProducto}/variantes`,
    );
  },

  /** Crea una nueva variante para un producto. */
  async crearVariante(
    idProducto: string,
    variante: Omit<CrearVarianteDTO, "idProducto">,
  ): Promise<VarianteDTO> {
    return fetchApi<VarianteDTO>(
      `${API_BASE}/productos/${idProducto}/variantes`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(variante),
      },
    );
  },

  /** Actualiza una variante existente. */
  async actualizarVariante(
    variante: ActualizarVarianteDTO,
  ): Promise<VarianteDTO> {
    return fetchApi<VarianteDTO>(`${API_BASE}/variantes/${variante.idVariante}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(variante),
    });
  },

  /** Elimina una variante por su ID. */
  async eliminarVariante(idVariante: string): Promise<boolean> {
    return fetchApi<boolean>(`${API_BASE}/variantes/${idVariante}`, {
      method: "DELETE",
    });
  },

  /** Ajusta el stock de una variante sumando (positivo) o restando (negativo) una cantidad relativa. */
  async ajustarStockVariante(
    idVariante: string,
    cantidad: number,
  ): Promise<boolean> {
    return fetchApi<boolean>(`${API_BASE}/variantes/${idVariante}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "adjustStock", cantidad }),
    });
  },

  /** Actualiza el estado de activación (activo/inactivo) de una variante. */
  async actualizarEstadoVariante(idVariante: string): Promise<boolean> {
    return fetchApi<boolean>(`${API_BASE}/variantes/${idVariante}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggleStatus" }),
    });
  },

  /** Obtiene los atributos (clave-valor) de una variante específica. */
  async obtenerAtributosVariante(
    idVariante: string,
  ): Promise<AtributoVarianteDTO[]> {
    return fetchApi<AtributoVarianteDTO[]>(
      `${API_BASE}/atributos-variante/${idVariante}`,
    );
  },

  /** Crea un nuevo atributo asociado a una variante. */
  async crearAtributoVariante(
    atributo: CrearAtributoVarianteDTO,
  ): Promise<AtributoVarianteDTO> {
    return fetchApi<AtributoVarianteDTO>(`${API_BASE}/atributos-variante`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(atributo),
    });
  },

  /** Elimina un atributo de variante por su ID. */
  async eliminarAtributoVariante(idAtributo: string): Promise<boolean> {
    return fetchApi<boolean>(`${API_BASE}/atributos-variante/${idAtributo}`, {
      method: "DELETE",
    });
  },
};
