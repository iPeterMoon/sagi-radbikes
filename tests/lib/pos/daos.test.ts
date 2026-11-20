import { beforeEach, describe, expect, it } from "vitest";
import { VentaDAO } from "@/lib/pos/datos/daos/implementaciones/VentaDAO";
import { DetalleVentaDAO } from "@/lib/pos/datos/daos/implementaciones/DetalleVentaDAO";
import { PagoDAO } from "@/lib/pos/datos/daos/implementaciones/PagoDAO";
import { ProductoDAO } from "@/lib/pos/datos/daos/implementaciones/ProductoDAO";
import { prismaDelegateMock } from "../../helpers/mocks";

/* eslint-disable @typescript-eslint/no-explicit-any */

describe("VentaDAO", () => {
  let delegate: any;
  let dao: VentaDAO;

  beforeEach(() => {
    delegate = prismaDelegateMock();
    dao = new VentaDAO({ sales: delegate } as any);
  });

  it("getByUsuario filtra por vendedor y ordena descendente", async () => {
    delegate.findMany.mockResolvedValue([]);
    await dao.getByUsuario(1n);
    expect(delegate.findMany).toHaveBeenCalledWith({
      where: { user_seller: 1n },
      include: { sale_details: true, payments: true },
      orderBy: { created_at: "desc" },
    });
  });

  it("getByFolio incluye detalles y pagos", async () => {
    delegate.findFirst.mockResolvedValue(null);
    await dao.getByFolio("F-1");
    const arg = delegate.findFirst.mock.calls[0][0];
    expect(arg.where).toEqual({ folio: "F-1" });
    expect(arg.include.payments).toBe(true);
    expect(arg.include.sale_details.include.product_variants.include.products).toBe(true);
  });

  it("createWithDetails crea la cabecera", async () => {
    delegate.create.mockResolvedValue({ id: 10n });
    const data = {
      user_seller: 1n,
      folio: "F-1",
      total: 116,
      subtotal: 100,
      IVA_amount: 16,
      tax_percentage: 16,
    };
    await dao.createWithDetails(data);
    expect(delegate.create).toHaveBeenCalledWith({ data });
  });
});

describe("DetalleVentaDAO", () => {
  it("getByVenta incluye la variante y su producto", async () => {
    const delegate = prismaDelegateMock();
    const dao = new DetalleVentaDAO({ sale_details: delegate } as any);
    delegate.findMany.mockResolvedValue([]);
    await dao.getByVenta(10n);
    expect(delegate.findMany).toHaveBeenCalledWith({
      where: { sale_id: 10n },
      include: { product_variants: { include: { products: true } } },
    });
  });

  it("createMany usa el cliente Prisma directamente", async () => {
    const delegate = prismaDelegateMock();
    const prisma = { sale_details: delegate };
    const dao = new DetalleVentaDAO(prisma as any);
    delegate.createMany.mockResolvedValue({ count: 1 });
    const detalles = [
      { sale_id: 10n, variant_id: 7n, quantity: 2, unitPrice: 50, unitCost: 30 },
    ];
    await dao.createMany(detalles);
    expect(delegate.createMany).toHaveBeenCalledWith({ data: detalles });
  });
});

describe("PagoDAO", () => {
  it("getByVenta y createPago delegan", async () => {
    const delegate = prismaDelegateMock();
    const dao = new PagoDAO({ payments: delegate } as any);
    delegate.findMany.mockResolvedValue([]);
    delegate.create.mockResolvedValue({ id: 1n });

    await dao.getByVenta(10n);
    await dao.createPago({ sale_id: 10n, paymentMethod: "efectivo", amount: 116 });

    expect(delegate.findMany).toHaveBeenCalledWith({ where: { sale_id: 10n } });
    expect(delegate.create).toHaveBeenCalledWith({
      data: { sale_id: 10n, paymentMethod: "efectivo", amount: 116 },
    });
  });
});

describe("ProductoDAO (POS)", () => {
  let delegate: any;
  let dao: ProductoDAO;

  beforeEach(() => {
    delegate = prismaDelegateMock();
    dao = new ProductoDAO({ product_variants: delegate } as any);
  });

  it("getActivos incluye relaciones de producto", async () => {
    delegate.findMany.mockResolvedValue([]);
    await dao.getActivos();
    const arg = delegate.findMany.mock.calls[0][0];
    expect(arg.where).toEqual({ is_active: true });
    expect(arg.include.products.include.subcategory).toBe(true);
  });

  it("buscarPorNombreOSKU busca por SKU o nombre del producto", async () => {
    delegate.findMany.mockResolvedValue([]);
    await dao.buscarPorNombreOSKU("casco");
    const arg = delegate.findMany.mock.calls[0][0];
    expect(arg.where.is_active).toBe(true);
    expect(arg.where.OR).toEqual([
      { SKU: { contains: "casco", mode: "insensitive" } },
      { products: { name: { contains: "casco", mode: "insensitive" } } },
    ]);
  });

  it("restarStock usa updateMany condicionado al stock disponible", async () => {
    delegate.updateMany.mockResolvedValue({ count: 1 });
    await expect(dao.restarStock(7n, 2)).resolves.toBe(true);
    expect(delegate.updateMany).toHaveBeenCalledWith({
      where: { id: 7n, stock: { gte: 2 } },
      data: { stock: { decrement: 2 } },
    });

    delegate.updateMany.mockResolvedValue({ count: 0 });
    await expect(dao.restarStock(7n, 999)).resolves.toBe(false);
  });

  it("getBySKU y getByCodigoBarras consultan por sus campos", async () => {
    delegate.findUnique.mockResolvedValue(null);
    delegate.findFirst.mockResolvedValue(null);
    await dao.getBySKU("SKU-1");
    await dao.getByCodigoBarras("123");
    expect(delegate.findUnique).toHaveBeenCalledWith({ where: { SKU: "SKU-1" } });
    expect(delegate.findFirst).toHaveBeenCalledWith({ where: { barcode_upc: "123" } });
  });
});
