"use client";

import { useState, useCallback, useEffect } from "react";
import { CartItem, PaymentMethod, POSProduct } from "@/types/pos";
import SearchBar from "./components/SearchBar";
import CategoryTabs from "./components/CategoryTabs";
import ProductGrid from "./components/ProductGrid";
import CartPanel from "./components/CartPanel";

export default function POSPage() {
  const [products, setProducts] = useState<POSProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [checkoutStatus, setCheckoutStatus] = useState<string | null>(null);

  // ── Fetch products from POS service ──
  useEffect(() => {
    fetch("/api/pos/productos")
      .then((r) => r.json())
      .then((data: Array<{
        idProducto: string;
        nombre: string;
        precio: number;
        stock: number;
        urlImagen: string;
        SKU: string;
        categoria: { nombre: string };
      }>) => {
        const mapped: POSProduct[] = data.map((p) => ({
          id: Number(p.idProducto),
          name: p.nombre,
          price: p.precio,
          stock: p.stock,
          image: p.urlImagen,
          sku: p.SKU,
          category: p.categoria?.nombre ?? "Sin categoría",
        }));
        setProducts(mapped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = ["Todas", ...Array.from(new Set(products.map((p) => p.category)))];

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

  const addToCart = useCallback((product: POSProduct) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  }, []);

  const increment = useCallback((id: number) => {
    setCart((prev) =>
      prev.map((i) => (i.product.id === id ? { ...i, qty: i.qty + 1 } : i))
    );
  }, []);

  const decrement = useCallback((id: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.product.id === id ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutStatus("procesando");
    try {
      const body = {
        idUsuario: "1", // TODO: leer del token de sesión
        metodoPago: paymentMethod === "tarjeta" ? "tarjeta_debito" : paymentMethod,
        porcentajeImpuesto: 16,
        productos: cart.map((i) => ({
          idProducto: String(i.product.id),
          nombre: i.product.name,
          cantidad: i.qty,
          precioUnitario: i.product.price,
          subtotal: i.product.price * i.qty,
        })),
      };
      const res = await fetch("/api/pos/venta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        setCheckoutStatus(`error: ${err.error}`);
        return;
      }
      const resumen = await res.json();
      setCheckoutStatus(`✓ Venta ${resumen.folio} registrada`);
      setCart([]);
      // Refresh stock counts
      fetch("/api/pos/productos")
        .then((r) => r.json())
        .then((data: Array<{ idProducto: string; nombre: string; precio: number; stock: number; urlImagen: string; SKU: string; categoria: { nombre: string } }>) =>
          setProducts(data.map((p) => ({
            id: Number(p.idProducto),
            name: p.nombre,
            price: p.precio,
            stock: p.stock,
            image: p.urlImagen,
            sku: p.SKU,
            category: p.categoria?.nombre ?? "Sin categoría",
          })))
        )
        .catch(console.error);
    } catch {
      setCheckoutStatus("error: no se pudo conectar con el servidor");
    }
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
        {checkoutStatus && (
          <div className={`mx-6 mb-2 px-4 py-2 rounded text-sm font-medium ${
            checkoutStatus.startsWith("error")
              ? "bg-red-100 text-red-700"
              : checkoutStatus === "procesando"
              ? "bg-yellow-50 text-yellow-700"
              : "bg-green-100 text-green-700"
          }`}>
            {checkoutStatus}
          </div>
        )}

        {/* Scrollable product grid */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {loading ? (
            <p className="text-gray-400 mt-10 text-center text-sm">Cargando productos…</p>
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
    </div>
  );
}