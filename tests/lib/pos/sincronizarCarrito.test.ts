import { describe, expect, it } from "vitest";
import {
  mapCarritoItem,
  prepararProductosVenta,
  sincronizarCarrito,
} from "@/lib/pos/sincronizarCarrito";
import type { ProductoCarritoDTO } from "@/types/dtos";
import type { POSProduct } from "@/types/pos";

const producto = (over: Partial<POSProduct> = {}): POSProduct => ({
  id: 7,
  name: "Casco",
  category: "Accesorios",
  price: 100,
  calcularIVA: false,
  stock: 5,
  image: "/casco-nuevo.png",
  sku: "CAS-1",
  barcodeUpc: "123456",
  ...over,
});

const itemServidor = (
  over: Partial<ProductoCarritoDTO> = {},
): ProductoCarritoDTO => ({
  idVariante: "7",
  nombre: "Casco",
  cantidad: 2,
  precioUnitario: 80,
  subtotal: 160,
  urlImagen: "/casco-viejo.png",
  porcentajeImpuesto: 16,
  precioIncluyeIVA: false,
  ...over,
});

describe("sincronizarCarrito", () => {
  it("adopta el precio y la regla vigentes del catálogo", () => {
    const carrito = [mapCarritoItem(itemServidor())];
    const resultado = sincronizarCarrito(
      carrito,
      [producto({ price: 100, calcularIVA: false })],
    );

    expect(resultado[0].product.price).toBe(100);
    expect(resultado[0].product.calcularIVA).toBe(false);
    expect(resultado[0].product.image).toBe("/casco-nuevo.png");
    expect(resultado[0].qty).toBe(2);
  });

  it("actualiza la regla cuando el producto pasa a calcular IVA", () => {
    const carrito = [
      mapCarritoItem(itemServidor({ precioIncluyeIVA: true, precioUnitario: 116 })),
    ];
    const resultado = sincronizarCarrito(
      carrito,
      [producto({ price: 116, calcularIVA: true })],
    );

    expect(resultado[0].product.price).toBe(116);
    expect(resultado[0].product.calcularIVA).toBe(true);
  });

  it("conserva el snapshot si la variante ya no está en el catálogo", () => {
    const item = mapCarritoItem(
      itemServidor({ porcentajeImpuesto: 0, precioIncluyeIVA: undefined }),
    );

    expect(item.product.calcularIVA).toBe(false);
    expect(sincronizarCarrito([item], [])[0]).toEqual(item);
  });
});

describe("prepararProductosVenta", () => {
  it("envía precio y regla vigentes, con el subtotal redondeado", () => {
    const carrito = [mapCarritoItem(itemServidor())];
    const lineas = prepararProductosVenta(
      carrito,
      [producto({ price: 100.123, calcularIVA: false })],
    );

    expect(lineas[0]).toEqual(
      expect.objectContaining({
        idVariante: "7",
        cantidad: 2,
        precioUnitario: 100.123,
        subtotal: 200.25,
        porcentajeImpuesto: 16,
        precioIncluyeIVA: true,
      }),
    );
  });

  it("cae al snapshot del carrito si el catálogo no trae la variante", () => {
    const carrito = [mapCarritoItem(itemServidor())];
    const lineas = prepararProductosVenta(carrito, []);

    expect(lineas[0]).toEqual(
      expect.objectContaining({
        precioUnitario: 80,
        subtotal: 160,
        precioIncluyeIVA: false,
      }),
    );
  });
});
