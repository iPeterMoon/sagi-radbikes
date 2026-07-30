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
import type {
  CrearVentaDTO,
  ProductoCarritoDTO,
  ProductoVentaDTO,
} from "@/types/dtos";
import { posApi } from "@/lib/api/pos";
import SearchBar from "./components/SearchBar";
import CategoryTabs from "./components/CategoryTabs";
import ProductGrid from "./components/ProductGrid";
import CartPanel from "./components/CartPanel";
import SuccessModal from "./components/SuccessModal";

function mapProductoVenta(p: ProductoVentaDTO): POSProduct {
  return {
    id: Number(p.idProducto),
    name: p.nombre,
    category: p.categoria?.nombre ?? "Sin categoría",
    price: p.precio,
    stock: p.stock,
    image: p.urlImagen || "/placeholder.png",
    sku: p.SKU,
  };
}

function mapCarritoItem(item: ProductoCarritoDTO): CartItem {
  return {
    product: {
      id: Number(item.idProducto),
      name: item.nombre,
      category: "Sin categoría",
      price: item.precioUnitario,
      stock: 0,
      image: item.urlImagen || "/placeholder.png",
      sku: "",
    },
    qty: item.cantidad,
  };
}

function mapCheckoutError(err: any): CheckoutError {
  const msg = err?.message || "Error desconocido";
  if (err?.detalles) {
    return { error: msg, detalles: err.detalles };
  }
  return { error: msg };
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
  }, [products, cart.length]);

  /**
   * Función auxiliar para manejar errores de autenticación.
   * Si el error contiene "Unauthorized" o "No token provided", redirige al login.
   */
  const handleAuthError = useCallback(
    (error: any): boolean => {
      const errorMessage = error?.error || error?.message || "";
      if (
        errorMessage.includes("Unauthorized") ||
        errorMessage.includes("No token provided")
      ) {
        document.cookie =
          "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        router.replace("/login");
        return true;
      }
      return false;
    },
    [router],
  );

  // ── Load products and cart ──
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await posApi.obtenerProductos();
        setProducts(data.map(mapProductoVenta));
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
        const data = await posApi.obtenerCarrito();
        setCart(data.map(mapCarritoItem));
      } catch (err: any) {
        if (!handleAuthError(err)) {
          console.error("Error loading carrito:", err);
        }
      }
    };

    loadProducts();
    loadCart();
  }, [handleAuthError]);

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

  const addToCart = useCallback(
    async (product: POSProduct) => {
      try {
        const data = await posApi.agregarProductoCarrito({
          idProducto: String(product.id),
          nombre: product.name,
          cantidad: 1,
          precioUnitario: product.price,
          subtotal: product.price,
          urlImagen: product.image,
        });
        setCart(data.map(mapCarritoItem));
      } catch (err: any) {
        if (!handleAuthError(err)) {
          setCheckoutError(mapCheckoutError(err));
        }
      }
    },
    [handleAuthError],
  );

  const increment = useCallback(
    async (id: number) => {
      try {
        const currentItem = cart.find((item) => item.product.id === id);
        const newQty = currentItem ? currentItem.qty + 1 : 1;
        const data = await posApi.cambiarCantidad(String(id), newQty);
        setCart(data.map(mapCarritoItem));
      } catch (err: any) {
        if (!handleAuthError(err)) {
          setCheckoutError(mapCheckoutError(err));
        }
      }
    },
    [handleAuthError, cart],
  );

  const decrement = useCallback(
    async (id: number) => {
      try {
        const currentItem = cart.find((item) => item.product.id === id);
        if (!currentItem) return;
        const newQty = currentItem.qty - 1;
        if (newQty < 1) {
          const data = await posApi.eliminarProductoCarrito(String(id));
          setCart(data.map(mapCarritoItem));
          return;
        }
        const data = await posApi.cambiarCantidad(String(id), newQty);
        setCart(data.map(mapCarritoItem));
      } catch (err: any) {
        if (!handleAuthError(err)) {
          setCheckoutError(mapCheckoutError(err));
        }
      }
    },
    [handleAuthError, cart],
  );

  const clearCart = useCallback(async () => {
    try {
      await posApi.limpiarCarrito();
      setCart([]);
    } catch (err: any) {
      if (!handleAuthError(err)) {
        setCheckoutError(mapCheckoutError(err));
      }
    }
  }, [handleAuthError]);

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

      const dto: CrearVentaDTO = {
        idUsuario,
        metodoPago:
          paymentMethod === "tarjeta" ? "tarjeta_debito" : paymentMethod,
        porcentajeImpuesto: 16,
        productos: cart.map((item) => ({
          idProducto: String(item.product.id),
          nombre: item.product.name,
          cantidad: item.qty,
          precioUnitario: item.product.price,
          subtotal: item.product.price * item.qty,
          urlImagen: item.product.image,
        })),
      };

      const resumen = await posApi.registrarVenta(dto);
      updateProductsStock(cart);
      setVentaResumen(resumen);
      setModalOpen(true);
      setCheckoutError(null);

      try {
        await posApi.limpiarCarrito();
        setCart([]);
      } catch {
        // best-effort
      }
    } catch (err: any) {
      setCheckoutError(mapCheckoutError(err));
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
      await posApi.imprimirTicket(resumen.folio);
    } catch (error: any) {
      console.error("Error al imprimir ticket:", error);
      setCheckoutError(mapCheckoutError(error));
    }
  }, []);

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
