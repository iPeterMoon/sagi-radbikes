import { describe, expect, it } from "vitest";
import { desglosarIVA, precioFinal } from "@/lib/pos/impuestos";

describe("desglosarIVA", () => {
  it("suma el IVA cuando el precio es base", () => {
    expect(desglosarIVA(100, 16, false)).toEqual({
      base: 100,
      iva: 16,
      total: 116,
    });
  });

  it("extrae el IVA cuando el precio ya lo incluye", () => {
    expect(desglosarIVA(116, 16, true)).toEqual({
      base: 100,
      iva: 16,
      total: 116,
    });
    expect(desglosarIVA(100, 16, true)).toEqual({
      base: 86.21,
      iva: 13.79,
      total: 100,
    });
  });

  it("redondea a centavos sin perder el total", () => {
    const resultado = desglosarIVA(33.333, 16, true);
    expect(resultado.total).toBe(33.33);
    expect(resultado.base + resultado.iva).toBe(resultado.total);
  });

  it("soporta una tasa 0", () => {
    expect(desglosarIVA(100, 0, true)).toEqual({
      base: 100,
      iva: 0,
      total: 100,
    });
  });
});

describe("precioFinal", () => {
  it("muestra base + IVA cuando se calcula el impuesto", () => {
    expect(precioFinal(100, true)).toBe(116);
  });

  it("muestra el precio capturado cuando ya incluye IVA", () => {
    expect(precioFinal(116, false)).toBe(116);
  });
});
