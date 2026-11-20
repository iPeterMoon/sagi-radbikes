import { beforeEach, describe, expect, it } from "vitest";
import { ConfiguracionDAO } from "@/lib/settings/datos/ConfiguracionDAO";
import { ReporteDAO } from "@/lib/dashboard/datos/ReporteDAO";
import { ReporteVentasDAO } from "@/lib/reportes/datos/ReporteVentasDAO";
import { prismaDelegateMock } from "../helpers/mocks";

 

describe("ConfiguracionDAO", () => {
  let delegate: any;
  let dao: ConfiguracionDAO;

  beforeEach(() => {
    delegate = prismaDelegateMock();
    dao = new ConfiguracionDAO({ store_settings: delegate } as any);
  });

  it("obtener devuelve la fila existente", async () => {
    delegate.findFirst.mockResolvedValue({ id: 1n, suggested_margin: 1.5 });
    await expect(dao.obtener()).resolves.toEqual({ id: 1n, suggested_margin: 1.5 });
    expect(delegate.create).not.toHaveBeenCalled();
  });

  it("obtener crea la fila singleton si no existe", async () => {
    delegate.findFirst.mockResolvedValue(null);
    delegate.create.mockResolvedValue({ id: 1n, suggested_margin: 1.5 });
    await expect(dao.obtener()).resolves.toEqual({ id: 1n, suggested_margin: 1.5 });
    expect(delegate.create).toHaveBeenCalledWith({ data: {} });
  });

  it("actualizarMargen actualiza la fila existente", async () => {
    delegate.findFirst.mockResolvedValue({ id: 1n, suggested_margin: 1.5 });
    delegate.update.mockResolvedValue({ id: 1n, suggested_margin: 2 });
    await expect(dao.actualizarMargen(2)).resolves.toEqual({
      id: 1n,
      suggested_margin: 2,
    });
    expect(delegate.update).toHaveBeenCalledWith({
      where: { id: 1n },
      data: { suggested_margin: 2 },
    });
  });

  it("actualizarMargen crea la fila si no existe", async () => {
    delegate.findFirst.mockResolvedValue(null);
    delegate.create.mockResolvedValue({ id: 1n, suggested_margin: 2 });
    await dao.actualizarMargen(2);
    expect(delegate.create).toHaveBeenCalledWith({ data: { suggested_margin: 2 } });
  });
});

describe("ReporteDAO", () => {
  let delegate: any;
  let dao: ReporteDAO;

  beforeEach(() => {
    delegate = prismaDelegateMock();
    dao = new ReporteDAO({ sales: delegate } as any);
  });

  it("obtenerVentasEnRango suma totales y cuenta ventas", async () => {
    delegate.aggregate.mockResolvedValue({ _sum: { total: 500 }, _count: 3 });
    const desde = new Date(2026, 0, 1);
    const hasta = new Date(2026, 0, 2);
    await expect(dao.obtenerVentasEnRango(desde, hasta)).resolves.toEqual({
      total: 500,
      cantidadVentas: 3,
    });
    expect(delegate.aggregate).toHaveBeenCalledWith({
      where: { sold_at: { gte: desde, lt: hasta } },
      _sum: { total: true },
      _count: true,
    });
  });

  it("obtenerVentasEnRango usa 0 cuando no hay suma", async () => {
    delegate.aggregate.mockResolvedValue({ _sum: { total: null }, _count: 0 });
    await expect(
      dao.obtenerVentasEnRango(new Date(), new Date()),
    ).resolves.toEqual({ total: 0, cantidadVentas: 0 });
  });

  it("obtenerDetallesEnRango filtra por la fecha de la venta", async () => {
    const detalleDelegate = prismaDelegateMock();
    const prisma = { sales: delegate, sale_details: detalleDelegate };
    const reporteDAO = new ReporteDAO(prisma as any);
    detalleDelegate.findMany.mockResolvedValue([]);
    const desde = new Date(2026, 0, 1);
    const hasta = new Date(2026, 0, 2);
    await reporteDAO.obtenerDetallesEnRango(desde, hasta);
    expect(detalleDelegate.findMany).toHaveBeenCalledWith({
      where: { sales: { sold_at: { gte: desde, lt: hasta } } },
      include: { product_variants: { include: { products: true } }, sales: true },
    });
  });
});

describe("ReporteVentasDAO", () => {
  it("obtenerVentasEnRango incluye vendedor, pagos y detalles ordenados", async () => {
    const delegate = prismaDelegateMock();
    const dao = new ReporteVentasDAO({ sales: delegate } as any);
    delegate.findMany.mockResolvedValue([]);
    const desde = new Date(2026, 0, 1);
    const hasta = new Date(2026, 0, 2);
    await dao.obtenerVentasEnRango(desde, hasta);

    const arg = delegate.findMany.mock.calls[0][0];
    expect(arg.where).toEqual({ sold_at: { gte: desde, lt: hasta } });
    expect(arg.orderBy).toEqual({ sold_at: "asc" });
    expect(arg.include.users).toBe(true);
    expect(arg.include.payments).toBe(true);
    expect(
      arg.include.sale_details.include.product_variants.include.products,
    ).toBe(true);
  });
});
