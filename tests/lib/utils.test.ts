import { describe, expect, it } from "vitest";
import {
  STOCK_STATUS_RANK,
  formatPrice,
  getActiveVariants,
  getProductMinPrice,
  getProductStatus,
  getProductTotalStock,
  getStockStatus,
  getWorstStockStatus,
} from "@/lib/utils";
import { makeProduct, makeVariant } from "../helpers/fixtures";

describe("getStockStatus", () => {
  it("devuelve NORMAL cuando minStock es null (notificaciones desactivadas)", () => {
    expect(getStockStatus(0, null)).toBe("NORMAL");
    expect(getStockStatus(100, null)).toBe("NORMAL");
  });

  it("devuelve CRÍTICO cuando el stock es 0 o negativo", () => {
    expect(getStockStatus(0, 10)).toBe("CRÍTICO");
    expect(getStockStatus(-5, 10)).toBe("CRÍTICO");
  });

  it("devuelve CRÍTICO cuando el stock es exactamente el 50% del mínimo", () => {
    expect(getStockStatus(5, 10)).toBe("CRÍTICO");
  });

  it("devuelve BAJO cuando el stock está por encima del 50% pero no supera el mínimo", () => {
    expect(getStockStatus(6, 10)).toBe("BAJO");
    expect(getStockStatus(10, 10)).toBe("BAJO");
  });

  it("devuelve NORMAL cuando el stock supera el mínimo", () => {
    expect(getStockStatus(11, 10)).toBe("NORMAL");
  });

  it("devuelve CRÍTICO con minStock 0 y stock 0", () => {
    expect(getStockStatus(0, 0)).toBe("CRÍTICO");
  });

  it("devuelve NORMAL con minStock 0 y stock positivo", () => {
    expect(getStockStatus(1, 0)).toBe("NORMAL");
  });
});

describe("STOCK_STATUS_RANK", () => {
  it("ordena por severidad creciente", () => {
    expect(STOCK_STATUS_RANK.NORMAL).toBeLessThan(STOCK_STATUS_RANK.BAJO);
    expect(STOCK_STATUS_RANK.BAJO).toBeLessThan(STOCK_STATUS_RANK["CRÍTICO"]);
  });
});

describe("getWorstStockStatus", () => {
  it("devuelve NORMAL sin variantes", () => {
    expect(getWorstStockStatus([])).toBe("NORMAL");
  });

  it("ignora variantes sin umbral configurado", () => {
    expect(
      getWorstStockStatus([
        { stock: 0, minStock: null },
        { stock: 100, minStock: 10 },
      ]),
    ).toBe("NORMAL");
  });

  it("devuelve el estado más severo entre las variantes", () => {
    expect(
      getWorstStockStatus([
        { stock: 100, minStock: 10 },
        { stock: 9, minStock: 10 },
      ]),
    ).toBe("BAJO");

    expect(
      getWorstStockStatus([
        { stock: 9, minStock: 10 },
        { stock: 0, minStock: 10 },
      ]),
    ).toBe("CRÍTICO");
  });
});

describe("formatPrice", () => {
  it("formatea en es-MX con dos decimales", () => {
    expect(formatPrice(1234.5)).toBe("1,234.50");
    expect(formatPrice(0)).toBe("0.00");
  });
});

describe("helpers de producto", () => {
  it("getActiveVariants filtra las inactivas", () => {
    const product = makeProduct({
      variants: [
        makeVariant({ id: 1, active: true }),
        makeVariant({ id: 2, active: false }),
      ],
    });
    expect(getActiveVariants(product).map((v) => v.id)).toEqual([1]);
  });

  it("getProductTotalStock suma solo las variantes activas", () => {
    const product = makeProduct({
      variants: [
        makeVariant({ stock: 3, active: true }),
        makeVariant({ stock: 7, active: true }),
        makeVariant({ stock: 100, active: false }),
      ],
    });
    expect(getProductTotalStock(product)).toBe(10);
  });

  it("getProductStatus considera solo las variantes activas", () => {
    const product = makeProduct({
      variants: [
        makeVariant({ stock: 100, minStock: 10, active: true }),
        makeVariant({ stock: 0, minStock: 10, active: false }),
      ],
    });
    expect(getProductStatus(product)).toBe("NORMAL");
  });

  it("getProductMinPrice devuelve 0 sin variantes", () => {
    expect(getProductMinPrice(makeProduct({ variants: [] }))).toBe(0);
  });

  it("getProductMinPrice devuelve el mínimo incluyendo inactivas", () => {
    const product = makeProduct({
      variants: [
        makeVariant({ price: 200 }),
        makeVariant({ price: 150 }),
        makeVariant({ price: 99 }),
      ],
    });
    expect(getProductMinPrice(product)).toBe(99);
  });
});
