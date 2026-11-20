import { describe, expect, it } from "vitest";
import {
  MODULOS,
  MODULOS_CONFIGURABLES,
  PREFIJOS_POR_MODULO,
  obtenerModuloDeRuta,
} from "@/lib/modulos";

describe("MODULOS", () => {
  it("incluye todos los módulos esperados", () => {
    expect(MODULOS.map((m) => m.id)).toEqual([
      "dashboard",
      "catalogo",
      "pos",
      "reportes",
      "usuarios",
      "configuracion",
    ]);
  });

  it("MODULOS_CONFIGURABLES excluye el piso implícito pos", () => {
    expect(MODULOS_CONFIGURABLES.map((m) => m.id)).not.toContain("pos");
    expect(MODULOS_CONFIGURABLES).toHaveLength(MODULOS.length - 1);
  });

  it("cada módulo tiene al menos un prefijo de ruta", () => {
    for (const modulo of MODULOS) {
      expect(PREFIJOS_POR_MODULO[modulo.id].length).toBeGreaterThan(0);
    }
  });
});

describe("obtenerModuloDeRuta", () => {
  it.each([
    ["/dashboard", "dashboard"],
    ["/dashboard/algo", "dashboard"],
    ["/api/dashboard/resumen", "dashboard"],
    ["/catalogo", "catalogo"],
    ["/api/inventario/productos", "catalogo"],
    ["/pos", "pos"],
    ["/api/pos/carrito", "pos"],
    ["/api/print", "pos"],
    ["/reportes", "reportes"],
    ["/api/reportes/ventas", "reportes"],
    ["/usuarios", "usuarios"],
    ["/api/users", "usuarios"],
    ["/api/roles", "usuarios"],
    ["/configuracion", "configuracion"],
    ["/api/configuracion", "configuracion"],
  ])("mapea %s al módulo %s", (ruta, esperado) => {
    expect(obtenerModuloDeRuta(ruta)).toBe(esperado);
  });

  it.each([["/login"], ["/api/auth/login"], ["/api/auth/validate"], ["/otra-cosa"]])(
    "devuelve null para rutas sin módulo: %s",
    (ruta) => {
      expect(obtenerModuloDeRuta(ruta)).toBeNull();
    },
  );
});
