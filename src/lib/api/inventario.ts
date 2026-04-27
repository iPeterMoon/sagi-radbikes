import { ProductoDTO, CategoriaDTO, MarcaDTO, SubCategoriaDTO, EtiquetaDTO } from "@/backend/negocio/DTOsSalida/ProductoDTOs";
import { CrearProductoDTO, ActualizarProductoDTO, FiltroProductoDTO } from "@/backend/negocio/DTOsEntrada/ProductoDTOs";

const API_BASE = "/api/inventario";

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, credentials: "include" });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }
  return res.json();
}

export const inventarioApi = {
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

  async obtenerProductoPorId(id: string): Promise<ProductoDTO> {
    return fetchApi<ProductoDTO>(`${API_BASE}/productos/${id}`);
  },

  async crearProducto(producto: CrearProductoDTO): Promise<ProductoDTO> {
    return fetchApi<ProductoDTO>(`${API_BASE}/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(producto),
    });
  },

  async actualizarProducto(producto: ActualizarProductoDTO): Promise<ProductoDTO> {
    return fetchApi<ProductoDTO>(`${API_BASE}/productos`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(producto),
    });
  },

  async eliminarProducto(id: string): Promise<boolean> {
    return fetchApi<boolean>(`${API_BASE}/productos/${id}`, { method: "DELETE" });
  },

  async ajustarStock(id: string, cantidad: number): Promise<boolean> {
    return fetchApi<boolean>(`${API_BASE}/productos`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, cantidad }),
    });
  },

  async actualizarEstado(id: string): Promise<boolean> {
    return fetchApi<boolean>(`${API_BASE}/productos`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, toggleActive: true }),
    });
  },

  async obtenerCategorias(): Promise<CategoriaDTO[]> {
    return fetchApi<CategoriaDTO[]>(`${API_BASE}/categorias`);
  },

  async obtenerMarcas(): Promise<MarcaDTO[]> {
    return fetchApi<MarcaDTO[]>(`${API_BASE}/marcas`);
  },

  async obtenerSubCategorias(idCategoria?: string): Promise<SubCategoriaDTO[]> {
    const params = idCategoria ? `?idCategoria=${idCategoria}` : "";
    return fetchApi<SubCategoriaDTO[]>(`${API_BASE}/subcategorias${params}`);
  },

  async crearCategoria(categoria: Omit<CategoriaDTO, "idCategoria">): Promise<CategoriaDTO> {
    return fetchApi<CategoriaDTO>(`${API_BASE}/categorias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(categoria),
    });
  },

  async crearMarca(marca: Omit<MarcaDTO, "idMarca">): Promise<MarcaDTO> {
    return fetchApi<MarcaDTO>(`${API_BASE}/marcas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(marca),
    });
  },

  async crearSubCategoria(subCategoria: Omit<SubCategoriaDTO, "idSubCategoria">): Promise<SubCategoriaDTO> {
    return fetchApi<SubCategoriaDTO>(`${API_BASE}/subcategorias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subCategoria),
    });
  },

  async agregarImagenes(idProducto: string, archivos: File[]): Promise<void> {
    const formData = new FormData();
    formData.append("idProducto", idProducto);
    archivos.forEach((file) => formData.append("archivos", file));
    await fetchApi<void>(`${API_BASE}/productos/${idProducto}/imagenes`, {
      method: "POST",
      body: formData,
    });
  },

  async eliminarImagen(idImagen: string): Promise<boolean> {
    return fetchApi<boolean>(`${API_BASE}/imagenes/${idImagen}`, { method: "DELETE" });
  },

  async obtenerEtiquetas(idProducto: string): Promise<EtiquetaDTO[]> {
    return fetchApi<EtiquetaDTO[]>(`${API_BASE}/etiquetas/${idProducto}`);
  },

  async crearEtiqueta(etiqueta: EtiquetaDTO, idProducto: string): Promise<EtiquetaDTO> {
    return fetchApi<EtiquetaDTO>(`${API_BASE}/etiquetas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ etiqueta, idProducto }),
    });
  },

  async eliminarEtiqueta(idEtiqueta: string): Promise<boolean> {
    return fetchApi<boolean>(`${API_BASE}/etiquetas/${idEtiqueta}`, { method: "DELETE" });
  },
};
