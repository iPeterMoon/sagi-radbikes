import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const m = vi.hoisted(() => ({
  catalogo: {
    obtenerAtributosVariante: vi.fn(),
    eliminarAtributoVariante: vi.fn(),
    obtenerEtiquetas: vi.fn(),
    eliminarEtiqueta: vi.fn(),
  },
}));

vi.mock("@/lib/inventory/factory", () => ({
  createServicioCatalogo: () => m.catalogo,
}));

import { GET as atributosGET } from "@/app/api/inventario/atributos-variante/[variantId]/route";
import { DELETE as atributoDELETE } from "@/app/api/inventario/atributos-variante/atributo/[idAtributo]/route";
import { GET as etiquetasGET } from "@/app/api/inventario/etiquetas/[productoId]/route";
import { DELETE as etiquetaDELETE } from "@/app/api/inventario/etiquetas/etiqueta/[idEtiqueta]/route";

 

const req = (url: string, method = "GET") =>
  new NextRequest(`http://localhost:3000${url}`, { method });
const params = <T extends Record<string, string>>(value: T) => ({
  params: Promise.resolve(value),
});

beforeEach(() => {
  vi.clearAllMocks();
  m.catalogo.obtenerAtributosVariante.mockResolvedValue([]);
  m.catalogo.obtenerEtiquetas.mockResolvedValue([]);
  m.catalogo.eliminarAtributoVariante.mockResolvedValue(undefined);
  m.catalogo.eliminarEtiqueta.mockResolvedValue(undefined);
});

describe("rutas de atributos de variante", () => {
  it("GET usa el ID de variante y no elimina nada", async () => {
    const res = await atributosGET(
      req("/api/inventario/atributos-variante/42"),
      params({ variantId: "42" }),
    );
    expect(res.status).toBe(200);
    expect(m.catalogo.obtenerAtributosVariante).toHaveBeenCalledWith("42");
    expect(m.catalogo.eliminarAtributoVariante).not.toHaveBeenCalled();
  });

  it("DELETE usa el ID de atributo en la ruta dedicada", async () => {
    const res = await atributoDELETE(
      req("/api/inventario/atributos-variante/atributo/7", "DELETE"),
      params({ idAtributo: "7" }),
    );
    expect(res.status).toBe(204);
    expect(m.catalogo.eliminarAtributoVariante).toHaveBeenCalledWith("7");
  });
});

describe("rutas de etiquetas de producto", () => {
  it("GET usa el ID de producto y no elimina nada", async () => {
    const res = await etiquetasGET(
      req("/api/inventario/etiquetas/15"),
      params({ productoId: "15" }),
    );
    expect(res.status).toBe(200);
    expect(m.catalogo.obtenerEtiquetas).toHaveBeenCalledWith("15");
    expect(m.catalogo.eliminarEtiqueta).not.toHaveBeenCalled();
  });

  it("DELETE usa el ID de etiqueta en la ruta dedicada", async () => {
    const res = await etiquetaDELETE(
      req("/api/inventario/etiquetas/etiqueta/9", "DELETE"),
      params({ idEtiqueta: "9" }),
    );
    expect(res.status).toBe(204);
    expect(m.catalogo.eliminarEtiqueta).toHaveBeenCalledWith("9");
  });
});
