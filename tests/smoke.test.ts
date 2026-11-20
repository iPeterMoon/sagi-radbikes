import { describe, expect, it } from "vitest";
import { getStockStatus } from "@/lib/utils";

describe("smoke", () => {
  it("carga el alias @/ y ejecuta lógica real", () => {
    expect(getStockStatus(0, 5)).toBe("CRÍTICO");
  });
});
