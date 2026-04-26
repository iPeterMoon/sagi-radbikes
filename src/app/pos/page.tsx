"use client";

import { useState, useCallback } from "react";
import { CartItem, PaymentMethod, POSCategory, POSProduct } from "@/types/pos";
import { MOCK_PRODUCTS } from "@/lib/mockProducts";
import SearchBar from "./components/SearchBar";
import CategoryTabs from "./components/CategoryTabs";
import ProductGrid from "./components/ProductGrid";
import CartPanel from "./components/CartPanel";

export default function POSPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<POSCategory>("Todas");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");

  const filtered = MOCK_PRODUCTS.filter((p) => {
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

  const handleCheckout = () => {
    console.log("Checkout", { cart, paymentMethod });
  };

  return (
    // Ocupa exactamente el espacio del <main> sin padding ni scroll propio
    <div className="flex h-full overflow-hidden">
      {/* ── Left: Product catalog ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Search bar */}
        <div className="px-6 pt-5 pb-3 bg-gray-50 shrink-0">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        {/* Category tabs */}
        <div className="px-6 pb-3 bg-gray-50 shrink-0">
          <CategoryTabs active={activeCategory} onChange={setActiveCategory} />
        </div>

        {/* Scrollable product grid — único elemento que crece y hace scroll */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <ProductGrid products={filtered} onAdd={addToCart} />
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