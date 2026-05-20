"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CartItem,
  PaymentMethod,
  POSProduct,
  VentaResumenDTO,
  CheckoutError,
} from "@/types/pos";
import SearchBar from "./components/SearchBar";
import CategoryTabs from "./components/CategoryTabs";
import ProductGrid, { parseProductsFromXml } from "./components/ProductGrid";
import CartPanel from "./components/CartPanel";
import SuccessModal from "./components/SuccessModal";

function parseCartFromXml(xmlString: string): CartItem[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  const parserError = xmlDoc.querySelector("parsererror");
  if (parserError) throw new Error(parserError.textContent || "XML inválido");

  return Array.from(xmlDoc.querySelectorAll("carrito > items > item")).map((item) => {
    const id = Number(item.querySelector("idProducto")?.textContent?.trim() || "0");
    const name = item.querySelector("nombre")?.textContent?.trim() || "";
    const qty = Number(item.querySelector("cantidad")?.textContent?.trim() || "0");
    const price = Number(item.querySelector("precioUnitario")?.textContent?.trim() || "0");

    return {
      product: {
        id,
        name,
        category: "Sin categoría",
        price,
        stock: 0,
        image: "/placeholder.png",
        sku: "",
      },
      qty,
    };
  });
}

function parseVentaResumenFromXml(xmlString: string): VentaResumenDTO {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  const parserError = xmlDoc.querySelector("parsererror");
  if (parserError) throw new Error(parserError.textContent || "XML inválido");

  const respuesta = xmlDoc.querySelector("respuestaVenta");
  if (!respuesta) {
    throw new Error("Respuesta de venta inválida");
  }

  const getText = (selector: string) => xmlDoc.querySelector(selector)?.textContent?.trim() || "";
  const fecha = new Date(getText("respuestaVenta > fecha"));

  return {
    idVenta: getText("respuestaVenta > idVenta"),
    total: Number(getText("respuestaVenta > total") || 0),
    mensaje: getText("respuestaVenta > mensaje"),
    estado: getText("respuestaVenta > estado"),
    fecha,
    folio: getText("respuestaVenta > folio"),
    subtotal: Number(getText("respuestaVenta > subtotal") || 0),
    importeIVA: Number(getText("respuestaVenta > importeIVA") || 0),
    porcentajeImpuesto: Number(getText("respuestaVenta > porcentajeImpuesto") || 0),
    pago: {
      idPago: getText("respuestaVenta > pago > idPago"),
      metodoPago: getText("respuestaVenta > pago > metodoPago"),
      monto: Number(getText("respuestaVenta > pago > monto") || 0),
      fechaHora: new Date(getText("respuestaVenta > pago > fechaHora")),
      idVenta: getText("respuestaVenta > idVenta"),
    },
  };
}

function parseErrorXml(xmlString: string): CheckoutError {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  const parserError = xmlDoc.querySelector("parsererror");
  if (parserError) {
    return { error: parserError.textContent || "XML inválido" };
  }

  const mensaje = xmlDoc.querySelector("mensaje")?.textContent?.trim() || "Error desconocido";
  const errorCode = xmlDoc.querySelector("error")?.textContent?.trim();
  const detallesElement = xmlDoc.querySelector("detalles");
  const detalles = detallesElement
    ? Array.from(detallesElement.querySelectorAll("item")).map((item) => ({
        producto: item.querySelector("producto")?.textContent?.trim() || "",
        solicitado: Number(item.querySelector("solicitado")?.textContent?.trim() || "0"),
        disponible: Number(item.querySelector("disponible")?.textContent?.trim() || "0"),
      }))
    : undefined;

  return {
    error: errorCode || mensaje,
    detalles: detalles?.length ? detalles : undefined,
  };
}

function buildVentaXml(
  idUsuario: string,
  metodoPago: string,
  porcentajeImpuesto: number,
  productos: CartItem[],
): string {
  const productosXml = productos
    .map(
      (item) => `<producto><idProducto>${item.product.id}</idProducto><nombre>${item.product.name}</nombre><cantidad>${item.qty}</cantidad><precioUnitario>${item.product.price.toFixed(2)}</precioUnitario><subtotal>${(item.product.price * item.qty).toFixed(2)}</subtotal></producto>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<crearVenta>
  <idUsuario>${idUsuario}</idUsuario>
  <metodoPago>${metodoPago}</metodoPago>
  <porcentajeImpuesto>${porcentajeImpuesto}</porcentajeImpuesto>
  <productos>${productosXml}</productos>
</crearVenta>`;
}

function buildAgregarProductoXml(product: POSProduct): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<agregarProducto>
  <idProducto>${product.id}</idProducto>
  <nombre>${product.name}</nombre>
  <cantidad>1</cantidad>
  <precioUnitario>${product.price.toFixed(2)}</precioUnitario>
  <subtotal>${product.price.toFixed(2)}</subtotal>
</agregarProducto>`;
}

function buildCambiarCantidadXml(cantidad: number): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<cambiarCantidad>
  <cantidad>${cantidad}</cantidad>
</cambiarCantidad>`;
}

/**
 * Página del Punto de Venta (POS).
 * Interfaz para realizar ventas: búsqueda de productos, gestión de carrito, checkout y procesamiento de pagos.
 */
export default function POSPage() {
  const router = useRouter();
  const [products, setProducts] = useState<POSProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [checkoutError, setCheckoutError] = useState<CheckoutError | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [ventaResumen, setVentaResumen] = useState<VentaResumenDTO | null>(
    null,
  );

  // Sincroniza las imágenes y datos del carrito con el catálogo cargado.
  // Si el carrito proviene del servicio POS sin `urlImagen`, usamos
  // la información del producto del catálogo para mostrar la imagen real.
  useEffect(() => {
    if (products.length === 0 || cart.length === 0) return;

    setCart((prev) =>
      prev.map((item) => {
        const prod = products.find((p) => p.id === item.product.id);
        if (!prod) return item;
        return {
          ...item,
          product: {
            ...item.product,
            image: prod.image,
            name: prod.name,
            category: prod.category,
            sku: prod.sku,
          },
        };
      }),
    );
  }, [products]);

  /**
   * Función auxiliar para manejar errores de autenticación.
   * Si el error contiene "Unauthorized" o "No token provided", redirige al login.
   */
  const handleAuthError = (error: any): boolean => {
    const errorMessage = error?.error || error?.message || "";
    if (
      errorMessage.includes("Unauthorized") ||
      errorMessage.includes("No token provided")
    ) {
      // Limpiar la cookie de token
      document.cookie =
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      router.replace("/login");
      return true;
    }
    return false;
  };

  // ── Fetch products and cart from POS service ──
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/pos/productos", {
          headers: { Accept: "application/xml" },
        });
        const text = await res.text();
        if (!res.ok) {
          const error = parseErrorXml(text);
          if (!handleAuthError(error)) {
            console.error("Error loading products:", error);
          }
          return;
        }
        const mapped = parseProductsFromXml(text);
        setProducts(mapped);
      } catch (err: any) {
        if (!handleAuthError(err)) {
          console.error("Error loading products:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    const loadCart = async () => {
      try {
        const res = await fetch("/api/pos/carrito", {
          headers: { Accept: "application/xml" },
        });
        const text = await res.text();
        if (!res.ok) {
          const error = parseErrorXml(text);
          if (!handleAuthError(error)) {
            console.error("Error loading carrito:", error);
          }
          return;
        }
        setCart(parseCartFromXml(text));
      } catch (err: any) {
        if (!handleAuthError(err)) {
          console.error("Error loading carrito:", err);
        }
      }
    };

    loadProducts();
    loadCart();
  }, []);

  const categories = [
    "Todas",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  const filtered = products.filter((p) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    const matchCategory =
      activeCategory === "Todas" || p.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const addToCart = useCallback(async (product: POSProduct) => {
    try {
      const xml = buildAgregarProductoXml(product);
      const res = await fetch("/api/pos/carrito", {
        method: "POST",
        headers: { "Content-Type": "application/xml", Accept: "application/xml" },
        body: xml,
      });
      const text = await res.text();
      if (!res.ok) {
        const error = parseErrorXml(text);
        if (!handleAuthError(error)) {
          setCheckoutError(error);
        }
        return;
      }
      setCart(parseCartFromXml(text));
    } catch (err: any) {
      setCheckoutError({ error: err.message || "No se pudo agregar el producto" });
    }
  }, []);

  const increment = useCallback(async (id: number) => {
    try {
      const currentItem = cart.find((item) => item.product.id === id);
      const newQty = currentItem ? currentItem.qty + 1 : 1;
      const xml = buildCambiarCantidadXml(newQty);
      const res = await fetch(`/api/pos/carrito/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/xml", Accept: "application/xml" },
        body: xml,
      });
      const text = await res.text();
      if (!res.ok) {
        const error = parseErrorXml(text);
        if (!handleAuthError(error)) {
          setCheckoutError(error);
        }
        return;
      }
      setCart(parseCartFromXml(text));
    } catch (err: any) {
      setCheckoutError({ error: err.message || "No se pudo actualizar la cantidad" });
    }
  }, [cart]);

  const decrement = useCallback(async (id: number) => {
    try {
      const currentItem = cart.find((item) => item.product.id === id);
      if (!currentItem) return;
      const newQty = currentItem.qty - 1;
      if (newQty < 1) {
        await fetch(`/api/pos/carrito/${id}`, { method: "DELETE" });
        setCart((prev) => prev.filter((item) => item.product.id !== id));
        return;
      }
      const xml = buildCambiarCantidadXml(newQty);
      const res = await fetch(`/api/pos/carrito/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/xml", Accept: "application/xml" },
        body: xml,
      });
      const text = await res.text();
      if (!res.ok) {
        const error = parseErrorXml(text);
        if (!handleAuthError(error)) {
          setCheckoutError(error);
        }
        return;
      }
      setCart(parseCartFromXml(text));
    } catch (err: any) {
      setCheckoutError({ error: err.message || "No se pudo actualizar la cantidad" });
    }
  }, [cart]);

  const clearCart = useCallback(async () => {
    try {
      const res = await fetch("/api/pos/carrito", {
        method: "DELETE",
        headers: { Accept: "application/xml" },
      });
      const text = await res.text();
      if (!res.ok) {
        const error = parseErrorXml(text);
        if (!handleAuthError(error)) {
          setCheckoutError(error);
        }
        return;
      }
      setCart(parseCartFromXml(text));
    } catch (err: any) {
      setCheckoutError({ error: err.message || "No se pudo limpiar el carrito" });
    }
  }, []);

  /** Actualiza el stock de los productos de forma reactiva sin hacer un fetch completo */
  const updateProductsStock = useCallback((productsToDecrement: CartItem[]) => {
    setProducts((prev) =>
      prev.map((product) => {
        const decrementItem = productsToDecrement.find(
          (item) => item.product.id === product.id,
        );
        if (decrementItem) {
          return {
            ...product,
            stock:
              product.stock === null
                ? null
                : Math.max(0, product.stock - decrementItem.qty),
          };
        }
        return product;
      }),
    );
  }, []);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const usuarioStr = localStorage.getItem("usuario");
      const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
      const idUsuario = usuario?.idUsuario || "1";

      const xml = buildVentaXml(
        idUsuario,
        paymentMethod === "tarjeta" ? "tarjeta_debito" : paymentMethod,
        16,
        cart,
      );

      const res = await fetch("/api/pos/venta", {
        method: "POST",
        headers: { "Content-Type": "application/xml", Accept: "application/xml" },
        body: xml,
      });

      const text = await res.text();
      if (!res.ok) {
        const error = parseErrorXml(text);
        if (handleAuthError(error)) {
          return;
        }
        setCheckoutError(error);
        return;
      }

      const resumen = parseVentaResumenFromXml(text);
      updateProductsStock(cart);
      setVentaResumen(resumen);
      setModalOpen(true);
      setCheckoutError(null);

      const clearRes = await fetch("/api/pos/carrito", {
        method: "DELETE",
        headers: { Accept: "application/xml" },
      });
      if (clearRes.ok) {
        setCart([]);
      }
    } catch (err: any) {
      setCheckoutError({ error: err.message || "error: no se pudo conectar con el servidor" });
    }
  };

  /** Manejador para limpiar carrito y cerrar modal */
  const handleNewSale = useCallback(() => {
    clearCart();
    setVentaResumen(null);
  }, [clearCart]);

  /** Manejador para imprimir recibo */
  const handlePrintReceipt = useCallback(async (resumen: VentaResumenDTO) => {
    try {
      // Crear contenido del recibo
      const receiptContent = generateReceiptHTML(resumen);

      // Crear un blob con el contenido HTML
      const blob = new Blob([receiptContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);

      // Abrir en nueva ventana para imprimir
      const printWindow = window.open(url, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (error) {
      console.error("Error al generar recibo:", error);
    }
  }, []);

  /** Genera el HTML del recibo para imprimir */
  const generateReceiptHTML = (resumen: VentaResumenDTO): string => {
    const formattedDate = new Date(resumen.fecha).toLocaleString("es-MX");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Recibo - ${resumen.folio}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            width: 80mm;
            margin: 0;
            padding: 10mm;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 18px;
          }
          .header p {
            margin: 2px 0;
            font-size: 12px;
            color: #666;
          }
          .ticket-number {
            font-size: 14px;
            font-weight: bold;
            margin: 10px 0;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 10px 0;
          }
          .section-title {
            font-weight: bold;
            margin-top: 10px;
            margin-bottom: 5px;
            font-size: 12px;
          }
          .item {
            font-size: 11px;
            margin: 3px 0;
            display: flex;
            justify-content: space-between;
          }
          .total-section {
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            padding: 10px 0;
            margin: 10px 0;
            font-weight: bold;
            font-size: 14px;
          }
          .total-amount {
            text-align: right;
            font-size: 16px;
            font-weight: bold;
            color: #000;
          }
          .payment-info {
            font-size: 11px;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            font-size: 10px;
            color: #666;
            margin-top: 20px;
            border-top: 1px solid #ccc;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SAGI RADBIKES</h1>
          <p>Punto de Venta</p>
        </div>
        
        <div class="ticket-number">
          Ticket: ${resumen.folio}
        </div>
        <p style="font-size: 11px; margin: 0;">Fecha: ${formattedDate}</p>
        
        <div class="divider"></div>
        
        <div class="section-title">RESUMEN DE VENTA</div>
        <div class="item">
          <span>Subtotal:</span>
          <span>$${resumen.subtotal.toFixed(2)}</span>
        </div>
        <div class="item">
          <span>IVA (${resumen.porcentajeImpuesto}%):</span>
          <span>$${resumen.importeIVA.toFixed(2)}</span>
        </div>
        
        <div class="total-section">
          <div class="total-amount">
            TOTAL: $${resumen.total.toFixed(2)}
          </div>
        </div>
        
        <div class="payment-info">
          <strong>Método de Pago:</strong><br>
          ${resumen.pago.metodoPago.replace("_", " ").toUpperCase()}
        </div>
        
        <div class="footer">
          <p>¡Gracias por su compra!</p>
          <p>Conserve este recibo</p>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left: Product catalog ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Search bar */}
        <div className="px-6 pt-5 pb-3 bg-gray-50 shrink-0">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        {/* Category tabs */}
        <div className="px-6 pb-3 bg-gray-50 shrink-0">
          <CategoryTabs
            active={activeCategory}
            onChange={setActiveCategory}
            categories={categories}
          />
        </div>

        {/* Feedback de checkout */}
        {checkoutError && (
          <div className="mx-6 mb-3 px-4 py-3 rounded-md text-sm bg-red-50 border border-red-200 text-red-800 shadow-sm">
            {checkoutError.error === "STOCK_INSUFICIENTE" &&
            checkoutError.detalles ? (
              <div className="flex flex-col gap-1.5">
                <p className="font-bold text-red-900">
                  Revisa el stock de los siguientes productos:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  {checkoutError.detalles.map((item, idx) => (
                    <li key={idx}>
                      <span className="font-semibold">{item.producto}</span>
                      <span className="text-red-700 ml-1">
                        (Disponible: {item.disponible} | Solicitado:{" "}
                        {item.solicitado})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <span className="font-medium">{checkoutError.error}</span>
            )}
          </div>
        )}

        {/* Scrollable product grid */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {loading ? (
            <div className="p-16 text-center text-gray-500 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-sm font-medium">Cargando productos...</p>
            </div>
          ) : (
            <ProductGrid products={filtered} onAdd={addToCart} />
          )}
        </div>
      </div>

      {/* ── Right: Cart panel ── */}
      <CartPanel
        cart={cart}
        paymentMethod={paymentMethod}
        onPaymentChange={setPaymentMethod}
        onIncrement={increment}
        onDecrement={decrement}
        onClear={clearCart}
        onCheckout={handleCheckout}
      />

      {/* ── Success Modal ── */}
      <SuccessModal
        isOpen={modalOpen}
        resumen={ventaResumen}
        onClose={() => setModalOpen(false)}
        onNewSale={handleNewSale}
        onPrint={handlePrintReceipt}
      />
    </div>
  );
}
