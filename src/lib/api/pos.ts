import type {
  CrearVentaDTO,
  ProductoCarritoDTO,
  ProductoVentaDTO,
  VentaResumenDTO,
} from "@/types/dtos";

const API_BASE = "/api/pos";

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, credentials: "include" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    const err = new Error(body.error || "Request failed") as Error & {
      detalles?: unknown;
    };
    err.detalles = body.detalles;
    throw err;
  }
  return res.json();
}

export const posApi = {
  async obtenerProductos(busqueda?: string): Promise<ProductoVentaDTO[]> {
    const params = busqueda ? `?busqueda=${encodeURIComponent(busqueda)}` : "";
    return fetchApi<ProductoVentaDTO[]>(`${API_BASE}/productos${params}`);
  },

  async registrarVenta(dto: CrearVentaDTO): Promise<VentaResumenDTO> {
    return fetchApi<VentaResumenDTO>(`${API_BASE}/venta`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
  },

  async obtenerCarrito(): Promise<ProductoCarritoDTO[]> {
    return fetchApi<ProductoCarritoDTO[]>(`${API_BASE}/carrito`);
  },

  async agregarProductoCarrito(
    producto: ProductoCarritoDTO,
  ): Promise<ProductoCarritoDTO[]> {
    return fetchApi<ProductoCarritoDTO[]>(`${API_BASE}/carrito`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(producto),
    });
  },

  async limpiarCarrito(): Promise<void> {
    await fetchApi<void>(`${API_BASE}/carrito`, { method: "DELETE" });
  },

  async cambiarCantidad(
    idProducto: string,
    cantidad: number,
  ): Promise<ProductoCarritoDTO[]> {
    return fetchApi<ProductoCarritoDTO[]>(`${API_BASE}/carrito/${idProducto}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cantidad }),
    });
  },

  async eliminarProductoCarrito(
    idProducto: string,
  ): Promise<ProductoCarritoDTO[]> {
    return fetchApi<ProductoCarritoDTO[]>(`${API_BASE}/carrito/${idProducto}`, {
      method: "DELETE",
    });
  },

  async imprimirTicket(folio: string): Promise<void> {
    await fetchApi<void>(`/api/print`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folio }),
    });
  },
};
