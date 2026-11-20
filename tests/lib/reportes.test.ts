import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ServicioReportes } from "@/lib/dashboard/negocio/ServicioReportes";
import { ServicioReporteVentas } from "@/lib/reportes/negocio/ServicioReporteVentas";
import { ServicioConfiguracion } from "@/lib/settings/negocio/ServicioConfiguracion";

 

/** Miércoles 13 de mayo de 2026, 15:30 hora local. */
const AHORA = new Date(2026, 4, 13, 15, 30, 0);
const INICIO_HOY = new Date(2026, 4, 13).getTime();
const INICIO_SEMANA = new Date(2026, 4, 11).getTime();
const INICIO_MES = new Date(2026, 4, 1).getTime();

function detalle(over: any = {}) {
  return {
    id: 1n,
    quantity: 1,
    unitPrice: 10,
    unitCost: 4,
    product_variants: { SKU: "A", products: { name: "Producto A" } },
    sales: { sold_at: new Date(2026, 4, 13, 10, 0, 0) },
    ...over,
  };
}

describe("ServicioReportes", () => {
  let dao: any;
  let servicio: ServicioReportes;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(AHORA);
    dao = {
      obtenerVentasEnRango: vi.fn(async (desde: Date) => {
        const t = desde.getTime();
        if (t === INICIO_HOY) return { total: 100, cantidadVentas: 1 };
        if (t === INICIO_SEMANA) return { total: 300, cantidadVentas: 2 };
        if (t === INICIO_MES) return { total: 1000, cantidadVentas: 5 };
        return { total: 0, cantidadVentas: 0 };
      }),
      obtenerDetallesEnRango: vi.fn(async () => [
        detalle({ quantity: 2, unitPrice: 100, unitCost: 60 }), // hoy
        detalle({
          quantity: 1,
          unitPrice: 50,
          unitCost: 50,
          product_variants: { SKU: "B", products: { name: "Producto B" } },
          sales: { sold_at: new Date(2026, 4, 12, 10, 0, 0) },
        }), // esta semana
        detalle({
          quantity: 3,
          unitPrice: 10,
          unitCost: 4,
          product_variants: { SKU: "C", products: { name: "Producto C" } },
          sales: { sold_at: new Date(2026, 4, 5, 10, 0, 0) },
        }), // este mes
        detalle({ sales: { sold_at: null } }), // sin fecha: se ignora
        detalle({ product_variants: null }), // sin variante: se ignora
      ]),
    };
    servicio = new ServicioReportes(dao);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("consulta los tres períodos con sus inicios correctos", async () => {
    await servicio.obtenerResumen();
    const llamadas = dao.obtenerVentasEnRango.mock.calls.map((c: any[]) => c[0].getTime());
    expect(llamadas).toEqual([INICIO_HOY, INICIO_SEMANA, INICIO_MES]);
    expect(dao.obtenerDetallesEnRango).toHaveBeenCalledWith(
      new Date(INICIO_MES),
      AHORA,
    );
  });

  it("arma el resumen de ventas por período", async () => {
    const resumen = await servicio.obtenerResumen();
    expect(resumen.ventas).toEqual({
      hoy: { total: 100, cantidadVentas: 1 },
      semana: { total: 300, cantidadVentas: 2 },
      mes: { total: 1000, cantidadVentas: 5 },
    });
  });

  it("calcula el margen de cada período", async () => {
    const { margen } = await servicio.obtenerResumen();
    expect(margen.hoy).toEqual({ montoMargen: 80, porcentajeMargen: 40 });
    expect(margen.semana).toEqual({ montoMargen: 80, porcentajeMargen: 32 });
    expect(margen.mes).toEqual({ montoMargen: 98, porcentajeMargen: 35 });
  });

  it("agrupa el top de productos por SKU ordenado por unidades", async () => {
    const { topProductos } = await servicio.obtenerResumen();
    expect(topProductos).toEqual([
      { nombre: "Producto C", sku: "C", unidadesVendidas: 3, ingresos: 30 },
      { nombre: "Producto A", sku: "A", unidadesVendidas: 2, ingresos: 200 },
      { nombre: "Producto B", sku: "B", unidadesVendidas: 1, ingresos: 50 },
    ]);
  });

  it("devuelve porcentaje 0 cuando no hay ingresos", async () => {
    dao.obtenerDetallesEnRango.mockResolvedValue([]);
    const { margen } = await servicio.obtenerResumen();
    expect(margen.mes).toEqual({ montoMargen: 0, porcentajeMargen: 0 });
  });

  it("usa el lunes anterior cuando el día actual es domingo", async () => {
    vi.setSystemTime(new Date(2026, 4, 17, 12, 0, 0)); // domingo
    await servicio.obtenerResumen();
    const llamadas = dao.obtenerVentasEnRango.mock.calls.map((c: any[]) => c[0].getTime());
    expect(llamadas[1]).toBe(new Date(2026, 4, 11).getTime());
  });
});

describe("ServicioReporteVentas", () => {
  function venta(over: any = {}) {
    return {
      id: 1n,
      folio: "F-1",
      total: 116,
      sold_at: new Date(2026, 0, 2, 10, 0, 0),
      created_at: new Date(2026, 0, 2, 10, 0, 0),
      users: { nombre: "Ana", apellido: "López", username: "ana" },
      payments: [{ paymentMethod: "efectivo" }],
      sale_details: [
        {
          quantity: 2,
          unitPrice: 50,
          unitCost: 30,
          product_variants: { SKU: "A", products: { name: "Casco" } },
        },
        {
          quantity: 1,
          unitPrice: 16,
          unitCost: 6,
          product_variants: null,
        },
      ],
      ...over,
    };
  }

  it("rechaza filtros sin fechas", async () => {
    const servicio = new ServicioReporteVentas({ obtenerVentasEnRango: vi.fn() } as any);
    await expect(servicio.generarReporte({ desde: "", hasta: "" })).rejects.toThrow(
      "Debés indicar una fecha de inicio y una fecha de fin",
    );
  });

  it("rechaza fechas con formato inválido", async () => {
    const servicio = new ServicioReporteVentas({ obtenerVentasEnRango: vi.fn() } as any);
    await expect(
      servicio.generarReporte({ desde: "no-es-fecha", hasta: "2026-01-02" }),
    ).rejects.toThrow("Las fechas ingresadas no son válidas");
  });

  it("rechaza fechas de calendario inexistentes", async () => {
    const servicio = new ServicioReporteVentas({ obtenerVentasEnRango: vi.fn() } as any);
    await expect(
      servicio.generarReporte({ desde: "2026-02-30", hasta: "2026-03-05" }),
    ).rejects.toThrow("Las fechas ingresadas no son válidas");
  });

  it("rechaza un rango invertido", async () => {
    const servicio = new ServicioReporteVentas({ obtenerVentasEnRango: vi.fn() } as any);
    await expect(
      servicio.generarReporte({ desde: "2026-03-05", hasta: "2026-03-01" }),
    ).rejects.toThrow("La fecha de inicio no puede ser posterior a la fecha de fin");
  });

  it("rechaza un rango mayor a un año", async () => {
    const servicio = new ServicioReporteVentas({ obtenerVentasEnRango: vi.fn() } as any);
    await expect(
      servicio.generarReporte({ desde: "2024-01-01", hasta: "2025-06-01" }),
    ).rejects.toThrow("El rango de fechas no puede ser mayor a 1 año");
  });

  it("consulta el rango incluyendo el día final completo", async () => {
    const dao = { obtenerVentasEnRango: vi.fn().mockResolvedValue([]) };
    const servicio = new ServicioReporteVentas(dao as any);
    await servicio.generarReporte({ desde: "2026-01-01", hasta: "2026-01-02" });

    const [desde, hasta] = dao.obtenerVentasEnRango.mock.calls[0];
    expect(desde).toEqual(new Date(2026, 0, 1));
    expect(hasta).toEqual(new Date(2026, 0, 3));
  });

  it("calcula resumen, top, ventas por día y detalle", async () => {
    const dao = {
      obtenerVentasEnRango: vi.fn().mockResolvedValue([
        venta(),
        venta({
          id: 2n,
          folio: null,
          total: 50,
          sold_at: new Date(2026, 0, 2, 15, 0, 0),
          users: null,
          payments: [],
          sale_details: [],
        }),
        venta({
          id: 3n,
          folio: "F-3",
          total: 30,
          sold_at: new Date(2026, 0, 3, 9, 0, 0),
          users: { nombre: "", apellido: "", username: "vend" },
          payments: [{ paymentMethod: "tarjeta" }],
          sale_details: [
            {
              quantity: 3,
              unitPrice: 10,
              unitCost: 4,
              product_variants: { SKU: "A", products: { name: "Casco" } },
            },
          ],
        }),
      ]),
    };
    const servicio = new ServicioReporteVentas(dao as any);
    const reporte = await servicio.generarReporte({
      desde: "2026-01-02",
      hasta: "2026-01-03",
    });

    expect(reporte.desde).toBe("2026-01-02");
    expect(reporte.hasta).toBe("2026-01-03");
    // total ventas 116+50+30=196; ingresos 116+30=146; margen 50+18=68
    expect(reporte.resumen).toEqual({
      total: 196,
      cantidadVentas: 3,
      montoMargen: 68,
      porcentajeMargen: Math.round((68 / 146) * 10000) / 100,
    });
    expect(reporte.topProductos).toEqual([
      { nombre: "Casco", sku: "A", unidadesVendidas: 5, ingresos: 130 },
    ]);
    expect(reporte.ventasPorDia).toEqual([
      { fecha: "2026-01-02", total: 166, cantidadVentas: 2 },
      { fecha: "2026-01-03", total: 30, cantidadVentas: 1 },
    ]);
    expect(reporte.ventas).toEqual([
      {
        folio: "F-1",
        fecha: new Date(2026, 0, 2, 10, 0, 0).toISOString(),
        vendedor: "Ana López",
        metodoPago: "efectivo",
        total: 116,
      },
      {
        folio: "—",
        fecha: new Date(2026, 0, 2, 15, 0, 0).toISOString(),
        vendedor: "—",
        metodoPago: "—",
        total: 50,
      },
      {
        folio: "F-3",
        fecha: new Date(2026, 0, 3, 9, 0, 0).toISOString(),
        vendedor: "vend",
        metodoPago: "tarjeta",
        total: 30,
      },
    ]);
  });
});

describe("ServicioConfiguracion", () => {
  it("obtiene y mapea la configuración", async () => {
    const dao = { obtener: vi.fn().mockResolvedValue({ suggested_margin: 1.4 }) };
    const servicio = new ServicioConfiguracion(dao as any);
    await expect(servicio.obtener()).resolves.toEqual({ margenGananciaSugerido: 1.4 });
  });

  it("rechaza un margen inválido", async () => {
    const dao = { actualizarMargen: vi.fn() };
    const servicio = new ServicioConfiguracion(dao as any);
    await expect(servicio.actualizar({ margenGananciaSugerido: 0 })).rejects.toThrow(
      "El margen de ganancia sugerido debe ser mayor a 0",
    );
    await expect(servicio.actualizar({ margenGananciaSugerido: -1 })).rejects.toThrow();
    expect(dao.actualizarMargen).not.toHaveBeenCalled();
  });

  it("actualiza un margen válido", async () => {
    const dao = { actualizarMargen: vi.fn().mockResolvedValue({ suggested_margin: 2 }) };
    const servicio = new ServicioConfiguracion(dao as any);
    await expect(servicio.actualizar({ margenGananciaSugerido: 2 })).resolves.toEqual({
      margenGananciaSugerido: 2,
    });
    expect(dao.actualizarMargen).toHaveBeenCalledWith(2);
  });
});
