import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authApi } from "@/lib/api/auth";
import { configuracionApi } from "@/lib/api/configuracion";
import { dashboardApi } from "@/lib/api/dashboard";
import { inventarioApi } from "@/lib/api/inventario";
import { posApi } from "@/lib/api/pos";
import { reportesApi } from "@/lib/api/reportes";
import { usuariosApi } from "@/lib/api/usuarios";
import { fakeResponse } from "../helpers/mocks";

/* eslint-disable @typescript-eslint/no-explicit-any */

describe("clientes de API", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("envía credenciales include en cada petición", async () => {
    fetchMock.mockResolvedValue(fakeResponse({ json: () => Promise.resolve([]) }));
    await dashboardApi.obtenerResumen();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/dashboard/resumen",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("lanza el mensaje de error del cuerpo cuando la respuesta no es ok", async () => {
    fetchMock.mockResolvedValue(
      fakeResponse({ ok: false, status: 400, json: () => Promise.resolve({ error: "boom" }) }),
    );
    await expect(configuracionApi.obtener()).rejects.toThrow("boom");
  });

  it("usa 'Request failed' cuando el error no es JSON", async () => {
    fetchMock.mockResolvedValue(
      fakeResponse({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error("no json")),
      }),
    );
    await expect(dashboardApi.obtenerResumen()).rejects.toThrow("Request failed");
  });

  describe("authApi", () => {
    it("login hace POST con las credenciales", async () => {
      fetchMock.mockResolvedValue(
        fakeResponse({ json: () => Promise.resolve({ token: "t" }) }),
      );
      await authApi.login({ username: "pedro", password: "x" });
      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe("/api/auth/login");
      expect(options.method).toBe("POST");
      expect(JSON.parse(options.body)).toEqual({ username: "pedro", password: "x" });
    });

    it("validate consulta el endpoint de validación", async () => {
      fetchMock.mockResolvedValue(fakeResponse({ json: () => Promise.resolve({}) }));
      await authApi.validate();
      expect(fetchMock).toHaveBeenCalledWith("/api/auth/validate", expect.any(Object));
    });

    it("logout hace POST y no falla sin window", async () => {
      fetchMock.mockResolvedValue(fakeResponse({ json: () => Promise.resolve(undefined) }));
      await expect(authApi.logout()).resolves.toBeUndefined();
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/auth/logout",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  describe("inventarioApi", () => {
    it("obtenerProductos sin filtro no agrega query", async () => {
      fetchMock.mockResolvedValue(fakeResponse({ json: () => Promise.resolve([]) }));
      await inventarioApi.obtenerProductos();
      expect(fetchMock).toHaveBeenCalledWith("/api/inventario/productos", expect.any(Object));
    });

    it("obtenerProductos arma la query con todos los filtros", async () => {
      fetchMock.mockResolvedValue(fakeResponse({ json: () => Promise.resolve([]) }));
      await inventarioApi.obtenerProductos({
        busqueda: "bici",
        idCategoria: "1",
        idMarca: "2",
        estadoStock: "BAJO",
        idSubCategoria: "3",
        precioMin: 10,
        precioMax: 20,
      } as any);
      const url = fetchMock.mock.calls[0][0] as string;
      const params = new URLSearchParams(url.split("?")[1]);
      expect(params.get("busqueda")).toBe("bici");
      expect(params.get("idCategoria")).toBe("1");
      expect(params.get("idMarca")).toBe("2");
      expect(params.get("estadoStock")).toBe("BAJO");
      expect(params.get("idSubCategoria")).toBe("3");
      expect(params.get("precioMin")).toBe("10");
      expect(params.get("precioMax")).toBe("20");
    });

    it("eliminarProducto devuelve undefined ante un 204 sin body", async () => {
      fetchMock.mockResolvedValue(
        fakeResponse({
          status: 204,
          json: () => {
            throw new Error("no debería parsear el body de un 204");
          },
        }),
      );
      await expect(inventarioApi.eliminarProducto("5")).resolves.toBeUndefined();
    });

    it("actualizarProducto usa el id en la URL", async () => {
      fetchMock.mockResolvedValue(fakeResponse({ json: () => Promise.resolve({}) }));
      await inventarioApi.actualizarProducto({ idProducto: "5" } as any);
      expect(fetchMock.mock.calls[0][0]).toBe("/api/inventario/productos/5");
    });

    it("ajustarStockVariante envía la acción y la cantidad", async () => {
      fetchMock.mockResolvedValue(fakeResponse({ json: () => Promise.resolve(true) }));
      await inventarioApi.ajustarStockVariante("7", -3);
      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe("/api/inventario/variantes/7");
      expect(options.method).toBe("PATCH");
      expect(JSON.parse(options.body)).toEqual({ action: "adjustStock", cantidad: -3 });
    });

    it("agregarImagenes construye el FormData con los archivos y metadatos", async () => {
      fetchMock.mockResolvedValue(fakeResponse({ status: 204, json: () => Promise.resolve(undefined) }));
      const archivos = [
        { name: "a.png" } as File,
        { name: "b.png" } as File,
      ];
      await inventarioApi.agregarImagenes("5", archivos, 1, "7");
      const options = fetchMock.mock.calls[0][1];
      const form = options.body as FormData;
      expect(form.get("idProducto")).toBe("5");
      expect(form.get("mainImageIndex")).toBe("1");
      expect(form.get("idVariante")).toBe("7");
      expect(form.getAll("archivos")).toHaveLength(2);
    });

    it("obtenerSubCategorias agrega la categoría cuando viene", async () => {
      fetchMock.mockResolvedValue(fakeResponse({ json: () => Promise.resolve([]) }));
      await inventarioApi.obtenerSubCategorias("4");
      expect(fetchMock.mock.calls[0][0]).toBe("/api/inventario/subcategorias?idCategoria=4");
    });
  });

  describe("posApi", () => {
    it("obtenerProductos codifica el término de búsqueda", async () => {
      fetchMock.mockResolvedValue(fakeResponse({ json: () => Promise.resolve([]) }));
      await posApi.obtenerProductos("casco azul");
      expect(fetchMock.mock.calls[0][0]).toBe(
        "/api/pos/productos?busqueda=casco%20azul",
      );
    });

    it("expone 'mensaje' y los 'detalles' del error", async () => {
      fetchMock.mockResolvedValue(
        fakeResponse({
          ok: false,
          status: 409,
          json: () =>
            Promise.resolve({ mensaje: "STOCK_INSUFICIENTE", detalles: [{ producto: "X" }] }),
        }),
      );
      await expect(posApi.registrarVenta({} as any)).rejects.toMatchObject({
        message: "STOCK_INSUFICIENTE",
        detalles: [{ producto: "X" }],
      });
    });

    it("imprimirTicket usa /api/print con el folio", async () => {
      fetchMock.mockResolvedValue(fakeResponse({ status: 204, json: () => Promise.resolve(undefined) }));
      await posApi.imprimirTicket("F-1");
      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe("/api/print");
      expect(JSON.parse(options.body)).toEqual({ folio: "F-1" });
    });

    it("cambiarCantidad usa PATCH con la cantidad", async () => {
      fetchMock.mockResolvedValue(fakeResponse({ json: () => Promise.resolve([]) }));
      await posApi.cambiarCantidad("7", 4);
      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe("/api/pos/carrito/7");
      expect(options.method).toBe("PATCH");
      expect(JSON.parse(options.body)).toEqual({ cantidad: 4 });
    });
  });

  describe("reportesApi / usuariosApi", () => {
    it("obtenerReporteVentas arma desde y hasta", async () => {
      fetchMock.mockResolvedValue(fakeResponse({ json: () => Promise.resolve({}) }));
      await reportesApi.obtenerReporteVentas("2026-01-01", "2026-01-31");
      const url = fetchMock.mock.calls[0][0] as string;
      const params = new URLSearchParams(url.split("?")[1]);
      expect(params.get("desde")).toBe("2026-01-01");
      expect(params.get("hasta")).toBe("2026-01-31");
    });

    it("actualizarUsuario usa el id en la URL", async () => {
      fetchMock.mockResolvedValue(fakeResponse({ json: () => Promise.resolve({}) }));
      await usuariosApi.actualizarUsuario({ idUsuario: "9" } as any);
      expect(fetchMock.mock.calls[0][0]).toBe("/api/users/9");
    });

    it("alternarActivo hace PATCH al usuario", async () => {
      fetchMock.mockResolvedValue(fakeResponse({ json: () => Promise.resolve(true) }));
      await usuariosApi.alternarActivo("9");
      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe("/api/users/9");
      expect(options.method).toBe("PATCH");
    });

    it("crearRol hace POST a /api/roles", async () => {
      fetchMock.mockResolvedValue(fakeResponse({ json: () => Promise.resolve({}) }));
      await usuariosApi.crearRol({ nombre: "x", descripcion: "d" } as any);
      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe("/api/roles");
      expect(options.method).toBe("POST");
    });
  });
});
