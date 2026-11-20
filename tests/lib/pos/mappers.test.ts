import { describe, expect, it } from "vitest";
import { ProductoMapper } from "@/lib/pos/negocio/mappers/ProductoMapper";
import { VentaMapper } from "@/lib/pos/negocio/mappers/VentaMapper";
import { TicketMapper } from "@/lib/pos/negocio/mappers/TicketMapper";

 

describe("ProductoMapper (POS)", () => {
  it("prefiere la imagen principal de la variante", () => {
    const dto = ProductoMapper.toDTO({
      id: 1n,
      product_id: 9n,
      SKU: "S1",
      barcode_upc: "123",
      price: 100,
      stock: 5,
      products: {
        name: "Bici",
        description: "d",
        subcategory: { id: 2n, name: "MTB" },
        product_images: [{ is_main_image: true, image_url: "producto.png" }],
      },
      product_images: [
        { is_main_image: false, image_url: "var-1.png" },
        { is_main_image: true, image_url: "var-main.png" },
      ],
      product_variant_attributes: [{ name: "Color", value: "Rojo" }],
    });
    expect(dto).toEqual({
      idVariante: "1",
      nombre: "Bici",
      precio: 100,
      stock: 5,
      tieneIVA: true,
      descripcion: "d",
      SKU: "S1",
      codigoBarras: "123",
      urlImagen: "var-main.png",
      categoria: { idCategoria: "2", nombre: "MTB" },
      atributos: [{ nombre: "Color", valor: "Rojo" }],
      idProductoPadre: "9",
    });
  });

  it("cae a la primera imagen de la variante cuando no hay principal", () => {
    const dto = ProductoMapper.toDTO({
      id: 1n,
      product_id: 9n,
      product_images: [{ is_main_image: false, image_url: "var-1.png" }],
      products: { product_images: [{ is_main_image: true, image_url: "producto.png" }] },
    });
    expect(dto.urlImagen).toBe("var-1.png");
  });

  it("cae a la imagen principal del producto cuando la variante no tiene", () => {
    const dto = ProductoMapper.toDTO({
      id: 1n,
      product_id: 9n,
      products: { product_images: [{ is_main_image: true, image_url: "producto.png" }] },
    });
    expect(dto.urlImagen).toBe("producto.png");
  });

  it("cae a la primera imagen del producto", () => {
    const dto = ProductoMapper.toDTO({
      id: 1n,
      product_id: 9n,
      products: { product_images: [{ is_main_image: false, image_url: "producto.png" }] },
    });
    expect(dto.urlImagen).toBe("producto.png");
  });

  it("usa valores por defecto cuando faltan datos", () => {
    const dto = ProductoMapper.toDTO({ id: 1n, product_id: 9n });
    expect(dto).toEqual({
      idVariante: "1",
      nombre: "",
      precio: 0,
      stock: 0,
      tieneIVA: true,
      descripcion: "",
      SKU: undefined,
      codigoBarras: "",
      urlImagen: "",
      categoria: { idCategoria: "", nombre: "" },
      atributos: [],
      idProductoPadre: "9",
    });
  });

  it("mapea has_iva=false del producto padre a tieneIVA=false", () => {
    const dto = ProductoMapper.toDTO({
      id: 1n,
      product_id: 9n,
      products: { has_iva: false },
    });
    expect(dto.tieneIVA).toBe(false);
  });

  it("asume IVA por defecto si el producto padre no lo define", () => {
    const dto = ProductoMapper.toDTO({ id: 1n, product_id: 9n });
    expect(dto.tieneIVA).toBe(true);
  });

  it("toDTOList mapea listas", () => {
    const list = ProductoMapper.toDTOList([
      { id: 1n, product_id: 1n },
      { id: 2n, product_id: 1n },
    ]);
    expect(list.map((d) => d.idVariante)).toEqual(["1", "2"]);
  });
});

describe("VentaMapper", () => {
  it("mapea venta y pago a resumen", () => {
    const fecha = new Date("2026-01-02T10:00:00Z");
    const dto = VentaMapper.toResumenDTO(
      {
        id: 10n,
        total: 116,
        tax_percentage: 16,
        folio: "F-1",
        created_at: fecha,
      },
      { id: 20n, paymentMethod: "efectivo", amount: 116, created_at: fecha, sale_id: 10n },
      100,
      16,
    );

    expect(dto).toEqual({
      idVenta: "10",
      total: 116,
      subtotal: 100,
      importeIVA: 16,
      porcentajeImpuesto: 16,
      folio: "F-1",
      fecha,
      estado: "completada",
      mensaje: "Venta registrada exitosamente",
      pago: {
        idPago: "20",
        metodoPago: "efectivo",
        monto: 116,
        fechaHora: fecha,
        idVenta: "10",
      },
    });
  });

  it("usa valores por defecto en el pago", () => {
    const dto = VentaMapper.toResumenDTO(
      { id: 10n, total: "50", tax_percentage: null },
      { id: 20n, sale_id: 10n },
      50,
      0,
    );
    expect(dto.total).toBe(50);
    expect(dto.porcentajeImpuesto).toBe(0);
    expect(dto.pago.metodoPago).toBe("");
    expect(dto.pago.monto).toBe(0);
    expect(dto.pago.fechaHora).toBeInstanceOf(Date);
  });
});

describe("TicketMapper", () => {
  it("mapea una venta con detalles y atributos", () => {
    const fecha = new Date("2026-03-01T12:00:00Z");
    const dto = TicketMapper.toTicketDTO({
      folio: "F-9",
      created_at: fecha,
      subtotal: "100.00",
      IVA_amount: "16.00",
      tax_percentage: "16",
      total: "116.00",
      payments: [{ paymentMethod: "tarjeta" }],
      sale_details: [
        {
          variant_id: 3n,
          quantity: 2,
          unitPrice: "50.00",
          product_variants: {
            products: { name: "Casco" },
            product_variant_attributes: [
              { name: "Talla", value: "M" },
              { name: "Color", value: "Azul" },
            ],
          },
        },
      ],
    });

    expect(dto.folio).toBe("F-9");
    expect(dto.fecha).toBe(fecha);
    expect(dto.subtotal).toBe(100);
    expect(dto.importeIVA).toBe(16);
    expect(dto.porcentajeImpuesto).toBe(16);
    expect(dto.total).toBe(116);
    expect(dto.metodoPago).toBe("tarjeta");
    expect(dto.items).toEqual([
      {
        nombre: "Casco",
        cantidad: 2,
        precioUnitario: 50,
        atributos: "Talla: M, Color: Azul",
      },
    ]);
  });

  it("usa valores por defecto sin pago, sin nombre y sin atributos", () => {
    const dto = TicketMapper.toTicketDTO({
      folio: "F-9",
      subtotal: 0,
      IVA_amount: 0,
      tax_percentage: 0,
      total: 0,
      sale_details: [
        {
          variant_id: 42n,
          quantity: 1,
          unitPrice: 10,
          product_variants: { product_variant_attributes: [] },
        },
      ],
    });
    expect(dto.metodoPago).toBe("N/A");
    expect(dto.fecha).toBeInstanceOf(Date);
    expect(dto.items[0].nombre).toBe("Producto 42");
    expect(dto.items[0].atributos).toBeUndefined();
  });
});
