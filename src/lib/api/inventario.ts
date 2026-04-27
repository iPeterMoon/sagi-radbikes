import { ProductoDTO, CategoriaDTO, MarcaDTO, SubCategoriaDTO, EtiquetaDTO } from "@/backend/negocio/DTOsSalida/ProductoDTOs";
import { CrearProductoDTO, ActualizarProductoDTO, FiltroProductoDTO } from "@/backend/negocio/DTOsEntrada/ProductoDTOs";

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
    if (filtro?.idSubCategoria) params.set("idSubCategoria", filtro.idSubCategoria);
    if (filtro?.precioMin) params.set("precioMin", filtro.precioMin.toString());
    if (filtro?.precioMax) params.set("precioMax", filtro.precioMax.toString());
    
    const query = params.toString();
    return fetchApi<ProductoDTO[]>(`${API_BASE}/productos${query ? `?${query}` : ""}`);
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
  async actualizarProducto(producto: ActualizarProductoDTO): Promise<ProductoDTO> {
    return fetchApi<ProductoDTO>(`${API_BASE}/productos`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(producto),
    });
  },

  /** Elimina un producto por su ID. */
  async eliminarProducto(id: string): Promise<boolean> {
    return fetchApi<boolean>(`${API_BASE}/productos/${id}`, { method: "DELETE" });
  },

  /**
   * Resta stock a un producto (para registrar una venta).
   * @param id - ID del producto
   * @param cantidad - Cantidad a restar
   */
  async ajustarStock(id: string, cantidad: number): Promise<boolean> {
    return fetchApi<boolean>(`${API_BASE}/productos/${id}/stock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cantidad }),
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
  async crearCategoria(categoria: Omit<CategoriaDTO, "idCategoria">): Promise<CategoriaDTO> {
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
  async crearSubCategoria(subCategoria: Omit<SubCategoriaDTO, "idSubCategoria">): Promise<SubCategoriaDTO> {
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
   */
  async agregarImagenes(idProducto: string, archivos: File[]): Promise<void> {
    const formData = new FormData();
    formData.append("idProducto", idProducto);
    archivos.forEach((file) => formData.append("archivos", file));
    await fetchApi<void>(`${API_BASE}/productos/${idProducto}/imagenes`, {
      method: "POST",
      body: formData,
    });
  },

  /** Elimina una imagen de producto por su ID. */
  async eliminarImagen(idImagen: string): Promise<boolean> {
    return fetchApi<boolean>(`${API_BASE}/imagenes/${idImagen}`, { method: "DELETE" });
  },

  /** Obtiene las etiquetas (atributos) de un producto específico. */
  async obtenerEtiquetas(idProducto: string): Promise<EtiquetaDTO[]> {
    return fetchApi<EtiquetaDTO[]>(`${API_BASE}/etiquetas/${idProducto}`);
  },

  /** Crea una nueva etiqueta asociada a un producto. */
  async crearEtiqueta(etiqueta: EtiquetaDTO, idProducto: string): Promise<EtiquetaDTO> {
    return fetchApi<EtiquetaDTO>(`${API_BASE}/etiquetas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ etiqueta, idProducto }),
    });
  },

  /** Elimina una etiqueta por su ID. */
  async eliminarEtiqueta(idEtiqueta: string): Promise<boolean> {
    return fetchApi<boolean>(`${API_BASE}/etiquetas/${idEtiqueta}`, { method: "DELETE" });
  },
};
