import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CarritoBO } from "@/lib/pos/negocio/BOs/CarritoBO";
import { ProductoBO } from "@/lib/pos/negocio/BOs/ProductoBO";
import { VentaBO } from "@/lib/pos/negocio/BOs/VentaBO";
import { DetalleStockDTO } from "@/lib/pos/negocio/DTOsSalida/DetalleStockDTO";
import { posAccesoMock } from "../../helpers/mocks";

 

const item = (over: any = {}) => ({
  idVariante: "7",
  nombre: "Casco",
  cantidad: 1,
  precioUnitario: 50,
  subtotal: 50,
  urlImagen: "",
  ...over,
});

describe("CarritoBO", () => {
  let bo: CarritoBO;

  beforeEach(() => {
    bo = new CarritoBO();
  });

  it("agrega un producto nuevo y calcula su subtotal", () => {
    bo.agregar(item({ cantidad: 2, subtotal: 100 }));
    expect(bo.obtenerItems()).toHaveLength(1);
    expect(bo.calcularTotal()).toBe(100);
  });

  it("fusiona cantidades al agregar un producto existente", () => {
    bo.agregar(item({ cantidad: 1, subtotal: 50 }));
    bo.agregar(item({ cantidad: 2, subtotal: 100 }));
    const items = bo.obtenerItems();
    expect(items).toHaveLength(1);
    expect(items[0].cantidad).toBe(3);
    expect(items[0].subtotal).toBe(150);
    expect(bo.calcularTotal()).toBe(150);
  });

  it("no muta el objeto original al agregar", () => {
    const original = item({ cantidad: 1, subtotal: 50 });
    bo.agregar(original);
    original.cantidad = 99;
    expect(bo.obtenerItems()[0].cantidad).toBe(1);
  });

  it("elimina un producto por variante", () => {
    bo.agregar(item({ idVariante: "1", subtotal: 10 }));
    bo.agregar(item({ idVariante: "2", subtotal: 20 }));
    bo.eliminar("1");
    expect(bo.obtenerItems().map((i) => i.idVariante)).toEqual(["2"]);
  });

  it("limpiar deja el carrito vacío", () => {
    bo.agregar(item());
    bo.limpiar();
    expect(bo.obtenerItems()).toEqual([]);
    expect(bo.calcularTotal()).toBe(0);
  });

  it("cambiarCantidad recalcula el subtotal", async () => {
    bo.agregar(item({ cantidad: 1, subtotal: 50 }));
    await bo.cambiarCantidad("7", 4);
    expect(bo.obtenerItems()[0].cantidad).toBe(4);
    expect(bo.obtenerItems()[0].subtotal).toBe(200);
  });

  it("cambiarCantidad ignora variantes ausentes", async () => {
    bo.agregar(item());
    await bo.cambiarCantidad("999", 10);
    expect(bo.obtenerItems()[0].cantidad).toBe(1);
  });

  it("obtenerItems devuelve una copia, no la referencia interna", () => {
    bo.agregar(item());
    const copia = bo.obtenerItems();
    copia.push(item({ idVariante: "x" }));
    expect(bo.obtenerItems()).toHaveLength(1);
  });
});

describe("ProductoBO (POS)", () => {
  let acceso: any;
  let bo: ProductoBO;

  beforeEach(() => {
    acceso = posAccesoMock();
    bo = new ProductoBO(acceso);
  });

  it("busca por nombre o SKU cuando hay término", async () => {
    acceso.productoDAO.buscarPorNombreOSKU.mockResolvedValue([
      { id: 7n, product_id: 5n, products: { name: "Casco" } },
    ]);
    const dtos = await bo.filtrarCatalogo("casco");
    expect(acceso.productoDAO.buscarPorNombreOSKU).toHaveBeenCalledWith("casco");
    expect(dtos[0].nombre).toBe("Casco");
  });

  it("lista solo activos cuando no hay término", async () => {
    acceso.productoDAO.getActivos.mockResolvedValue([]);
    await bo.filtrarCatalogo();
    expect(acceso.productoDAO.getActivos).toHaveBeenCalled();
  });

  it("verificarStock compara contra el stock del servidor", async () => {
    acceso.productoDAO.getById.mockResolvedValue({ id: 7n, stock: 5 });
    await expect(bo.verificarStock("7", 5)).resolves.toBe(true);
    await expect(bo.verificarStock("7", 6)).resolves.toBe(false);
  });

  it("verificarStock devuelve false si el producto no existe", async () => {
    acceso.productoDAO.getById.mockResolvedValue(null);
    await expect(bo.verificarStock("7", 1)).resolves.toBe(false);
  });
});

describe("VentaBO.validarVenta", () => {
  let bo: VentaBO;

  beforeEach(() => {
    bo = new VentaBO(posAccesoMock());
  });

  it("acepta una venta válida", () => {
    expect(
      bo.validarVenta({
        idUsuario: "1",
        metodoPago: "efectivo",
        productos: [item()],
        porcentajeImpuesto: 16,
      } as any),
    ).toEqual([]);
  });

  it("acumula todos los errores de validación", () => {
    const errores = bo.validarVenta({
      idUsuario: "",
      metodoPago: "",
      productos: [],
      porcentajeImpuesto: 150,
    } as any);
    expect(errores).toEqual([
      "idUsuario es requerido",
      "metodoPago es requerido",
      "El carrito no puede estar vacío",
      "porcentajeImpuesto debe estar entre 0 y 100",
    ]);
  });

  it("rechaza impuestos negativos", () => {
    expect(
      bo.validarVenta({
        idUsuario: "1",
        metodoPago: "efectivo",
        productos: [item()],
        porcentajeImpuesto: -1,
      } as any),
    ).toContain("porcentajeImpuesto debe estar entre 0 y 100");
  });
});

describe("VentaBO.verificarStock", () => {
  let acceso: any;
  let bo: VentaBO;

  beforeEach(() => {
    acceso = posAccesoMock();
    bo = new VentaBO(acceso);
  });

  it("devuelve lista vacía cuando hay stock suficiente", async () => {
    acceso.productoDAO.getById.mockResolvedValue({
      id: 7n,
      stock: 10,
      products: { name: "Casco" },
    });
    await expect(bo.verificarStock([item({ cantidad: 3 })])).resolves.toEqual([]);
  });

  it("reporta el producto con stock insuficiente", async () => {
    acceso.productoDAO.getById.mockResolvedValue({
      id: 7n,
      stock: 1,
      products: { name: "Casco" },
    });
    const errores = await bo.verificarStock([item({ cantidad: 2 })]);
    expect(errores).toHaveLength(1);
    expect(errores[0]).toBeInstanceOf(DetalleStockDTO);
    expect(errores[0]).toEqual({
      producto: "Casco",
      solicitado: 2,
      disponible: 1,
    });
  });

  it("usa el id como nombre cuando el producto no existe", async () => {
    acceso.productoDAO.getById.mockResolvedValue(null);
    const errores = await bo.verificarStock([item({ idVariante: "42", cantidad: 1 })]);
    expect(errores[0]).toEqual({
      producto: "ID: 42",
      solicitado: 1,
      disponible: 0,
    });
  });
});

describe("VentaBO.calcularTotal", () => {
  let bo: VentaBO;

  beforeEach(() => {
    bo = new VentaBO(posAccesoMock());
  });

  it("calcula subtotal, IVA y total redondeados a centavos", () => {
    const total = bo.calcularTotal(
      [item({ subtotal: 100 }), item({ idVariante: "8", subtotal: 33.333 })],
      16,
    );
    // Cada línea se redondea a centavos: subtotal + IVA == total exactamente.
    expect(total.subtotal).toBe(133.33);
    expect(total.importeIVA).toBe(21.33);
    expect(total.total).toBe(154.66);
  });

  it("con impuesto 0 el total iguala al subtotal", () => {
    expect(bo.calcularTotal([item({ subtotal: 100 })], 0)).toEqual({
      subtotal: 100,
      importeIVA: 0,
      total: 100,
    });
  });

  it("respeta el porcentaje por ítem cuando la tasa es 0", () => {
    const total = bo.calcularTotal(
      [
        item({ subtotal: 100, porcentajeImpuesto: 16 }),
        item({ idVariante: "8", subtotal: 50, porcentajeImpuesto: 0 }),
      ],
      16,
    );
    expect(total.subtotal).toBe(150);
    expect(total.importeIVA).toBe(16);
    expect(total.total).toBe(166);
  });

  it("usa la tasa general cuando el ítem no trae porcentaje", () => {
    const total = bo.calcularTotal(
      [item({ subtotal: 100 }), item({ idVariante: "8", subtotal: 50, porcentajeImpuesto: 0 })],
      16,
    );
    expect(total.importeIVA).toBe(16);
    expect(total.total).toBe(166);
  });

  it("extrae el IVA cuando el precio del ítem ya lo incluye", () => {
    const total = bo.calcularTotal(
      [item({ subtotal: 116, precioIncluyeIVA: true })],
      16,
    );
    expect(total).toEqual({ subtotal: 100, importeIVA: 16, total: 116 });
  });

  it("combina ítems con precio base y con precio ya incluido", () => {
    const total = bo.calcularTotal(
      [
        item({ subtotal: 100 }),
        item({ idVariante: "8", subtotal: 100, precioIncluyeIVA: true }),
      ],
      16,
    );
    expect(total).toEqual({ subtotal: 186.21, importeIVA: 29.79, total: 216 });
  });
});

describe("VentaBO.registrarVenta", () => {
  let acceso: any;
  let bo: VentaBO;

  beforeEach(() => {
    acceso = posAccesoMock();
    bo = new VentaBO(acceso);
    vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
    acceso.ventaDAO.createWithDetails.mockResolvedValue({
      id: 10n,
      total: 116,
      tax_percentage: 16,
      folio: "VENTA-1700000000000",
      created_at: new Date(),
    });
    acceso.productoDAO.getById.mockResolvedValue({ id: 7n, cost: 30 });
    acceso.detalleVentaDAO.createMany.mockResolvedValue(undefined);
    acceso.pagoDAO.createPago.mockResolvedValue({
      id: 20n,
      sale_id: 10n,
      paymentMethod: "efectivo",
      amount: 116,
    });
    acceso.productoDAO.restarStock.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const dto = {
    idUsuario: "1",
    metodoPago: "efectivo",
    porcentajeImpuesto: 16,
    productos: [item({ cantidad: 2, precioUnitario: 50, subtotal: 100 })],
  };

  it("persiste cabecera, detalles con costo del servidor, pago y descuenta stock", async () => {
    const resumen = await bo.registrarVenta(dto as any);

    expect(acceso.ventaDAO.createWithDetails).toHaveBeenCalledWith({
      user_seller: 1n,
      folio: "VENTA-1700000000000",
      total: 116,
      subtotal: 100,
      IVA_amount: 16,
      tax_percentage: 16,
    });
    expect(acceso.detalleVentaDAO.createMany).toHaveBeenCalledWith([
      {
        sale_id: 10n,
        variant_id: 7n,
        quantity: 2,
        unitPrice: 50,
        unitCost: 30,
      },
    ]);
    expect(acceso.pagoDAO.createPago).toHaveBeenCalledWith({
      sale_id: 10n,
      paymentMethod: "efectivo",
      amount: 116,
    });
    expect(acceso.productoDAO.restarStock).toHaveBeenCalledWith(7n, 2);
    expect(resumen.idVenta).toBe("10");
    expect(resumen.total).toBe(116);
  });

  it("extrae el IVA y guarda el precio base si el precio ya lo incluye", async () => {
    await bo.registrarVenta({
      ...dto,
      productos: [
        item({
          cantidad: 2,
          precioUnitario: 58,
          subtotal: 116,
          precioIncluyeIVA: true,
        }),
      ],
    } as any);

    expect(acceso.ventaDAO.createWithDetails).toHaveBeenCalledWith(
      expect.objectContaining({ subtotal: 100, IVA_amount: 16, total: 116 }),
    );
    expect(acceso.detalleVentaDAO.createMany).toHaveBeenCalledWith([
      expect.objectContaining({ quantity: 2, unitPrice: 50 }),
    ]);
  });

  it("usa el precio y la regla vigentes de BD aunque el DTO traiga datos viejos", async () => {
    acceso.productoDAO.getById.mockResolvedValue({
      id: 7n,
      cost: 30,
      price: 100,
      products: { calcular_iva: false },
    });

    await bo.registrarVenta({
      ...dto,
      productos: [
        item({
          cantidad: 1,
          precioUnitario: 80,
          subtotal: 80,
          precioIncluyeIVA: false,
        }),
      ],
    } as any);

    expect(acceso.productoDAO.getById).toHaveBeenCalledWith(7n, {
      products: true,
    });
    expect(acceso.ventaDAO.createWithDetails).toHaveBeenCalledWith(
      expect.objectContaining({ subtotal: 86.21, IVA_amount: 13.79, total: 100 }),
    );
    expect(acceso.detalleVentaDAO.createMany).toHaveBeenCalledWith([
      expect.objectContaining({ quantity: 1, unitPrice: 86.21, unitCost: 30 }),
    ]);
    expect(acceso.pagoDAO.createPago).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 100 }),
    );
  });

  it("suma el IVA cuando el producto pasó de precio incluido a precio base", async () => {
    acceso.productoDAO.getById.mockResolvedValue({
      id: 7n,
      cost: 30,
      price: 100,
      products: { calcular_iva: true },
    });

    await bo.registrarVenta({
      ...dto,
      productos: [
        item({
          cantidad: 1,
          precioUnitario: 100,
          subtotal: 100,
          precioIncluyeIVA: true,
        }),
      ],
    } as any);

    expect(acceso.ventaDAO.createWithDetails).toHaveBeenCalledWith(
      expect.objectContaining({ subtotal: 100, IVA_amount: 16, total: 116 }),
    );
    expect(acceso.detalleVentaDAO.createMany).toHaveBeenCalledWith([
      expect.objectContaining({ quantity: 1, unitPrice: 100 }),
    ]);
  });

  it("usa costo 0 si la variante ya no existe al crear detalles", async () => {
    acceso.productoDAO.getById.mockResolvedValue(null);
    await bo.registrarVenta(dto as any);
    expect(acceso.detalleVentaDAO.createMany.mock.calls[0][0][0].unitCost).toBe(0);
  });

  it("lanza si el descuento de stock falla", async () => {
    acceso.productoDAO.restarStock.mockResolvedValue(false);
    await expect(bo.registrarVenta(dto as any)).rejects.toThrow(
      /Stock insuficiente para completar la venta/,
    );
  });
});

describe("VentaBO.obtenerVentaParaTicket", () => {
  let acceso: any;
  let bo: VentaBO;

  beforeEach(() => {
    acceso = posAccesoMock();
    bo = new VentaBO(acceso);
  });

  it("lanza VENTA_NO_ENCONTRADA si el folio no existe", async () => {
    acceso.ventaDAO.getByFolio.mockResolvedValue(null);
    await expect(bo.obtenerVentaParaTicket("X")).rejects.toThrow("VENTA_NO_ENCONTRADA");
  });

  it("mapea la venta a un ticket", async () => {
    acceso.ventaDAO.getByFolio.mockResolvedValue({
      folio: "F-1",
      created_at: new Date(),
      subtotal: 100,
      IVA_amount: 16,
      tax_percentage: 16,
      total: 116,
      payments: [{ paymentMethod: "efectivo" }],
      sale_details: [],
    });
    const ticket = await bo.obtenerVentaParaTicket("F-1");
    expect(ticket.folio).toBe("F-1");
    expect(ticket.total).toBe(116);
  });
});
