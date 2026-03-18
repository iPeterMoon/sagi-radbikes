"use client";

import { useState } from "react";
import { Product, ModalType } from "@/types/inventory";
import { MOCK_PRODUCTS, CATEGORIES } from "@/lib/mockData";
import { getStockStatus } from "@/lib/utils";
import ProductTable from "./components/ProductTable";
import ProductFormModal from "./components/ProductFormModal";
import {
  DeleteConfirmationModal,
  SalesHistoryErrorModal,
} from "./components/DeleteConfirmationModal";
import StatusFeedbackModal from "./components/StatusFeedbackModal";
import { IconSearch, IconPlus } from "@/components/ui/Icons";

const PER_PAGE = 5;

export default function InventarioPage() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"bajo" | "critico" | null>(
    null,
  );
  const [filterCategory, setFilterCategory] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalType>(null);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    if (
      q &&
      !p.name.toLowerCase().includes(q) &&
      !p.sku.toLowerCase().includes(q) &&
      !p.brand.toLowerCase().includes(q)
    )
      return false;
    if (filterCategory && p.category !== filterCategory) return false;
    if (
      filterStatus === "bajo" &&
      getStockStatus(p.stock, p.minStock) !== "BAJO"
    )
      return false;
    if (
      filterStatus === "critico" &&
      getStockStatus(p.stock, p.minStock) !== "CRÍTICO"
    )
      return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSave = (data: Product) => {
    if (modal?.type === "edit") {
      setProducts((prev) => prev.map((p) => (p.id === data.id ? data : p)));
      setModal(null);
    } else {
      setProducts((prev) => [...prev, data]);
      setModal({ type: "success-add" });
    }
  };

  const handleDelete = (product: Product) => {
    if (product.hasSalesHistory) {
      setModal({ type: "sales-error", product });
    } else {
      setModal({ type: "delete", product });
    }
  };

  const confirmDelete = () => {
    if (modal?.type !== "delete") return;
    setProducts((prev) => prev.filter((p) => p.id !== modal.product.id));
    setModal({ type: "success-delete" });
  };

  const handleToggle = (id: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)),
    );
  };

  const filterBtnClass = (active: boolean, activeColors: string) =>
    `px-4 py-[9px] rounded-lg cursor-pointer text-[13px] font-semibold transition-all duration-150 border outline-none ${
      active
        ? `border-transparent ${activeColors}`
        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
    }`;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 m-0">
          Gestión de Catálogo
        </h1>
        <button
          onClick={() => setModal({ type: "add" })}
          className="bg-blue-600 hover:bg-blue-700 text-white border-none rounded-lg px-5 py-2.5 cursor-pointer text-sm font-bold flex items-center gap-2 shadow-[0_4px_12px_rgba(37,99,235,0.3)] transition-colors"
        >
          <IconPlus /> Nuevo Producto
        </button>
      </div>

      <div className="flex gap-2.5 mb-4 flex-wrap items-center">
        {/* Search */}
        <div className="relative flex-[1_1_280px] min-w-50">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <IconSearch />
          </span>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por producto, SKU o marca..."
            className="w-full py-2.25 pl-9 pr-3 border border-gray-200 rounded-lg text-[13px] text-gray-700 outline-none bg-white focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
        </div>

        {/* Stock bajo */}
        <button
          onClick={() => {
            setFilterStatus((f) => (f === "bajo" ? null : "bajo"));
            setPage(1);
          }}
          className={filterBtnClass(
            filterStatus === "bajo",
            "bg-orange-50 text-orange-600",
          )}
        >
          Stock bajo
        </button>

        {/* Stock crítico */}
        <button
          onClick={() => {
            setFilterStatus((f) => (f === "critico" ? null : "critico"));
            setPage(1);
          }}
          className={filterBtnClass(
            filterStatus === "critico",
            "bg-red-50 text-red-600",
          )}
        >
          Stock crítico
        </button>

        {/* Category dropdown */}
        <div className="relative">
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setPage(1);
            }}
            className="py-2.25 pl-3.5 pr-8 rounded-lg border border-gray-200 bg-white cursor-pointer text-[13px] text-gray-700 appearance-none outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          >
            <option value="">Categoría</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
            ▼
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <ProductTable
          products={paginated}
          onEdit={(p) => setModal({ type: "edit", product: p })}
          onDelete={handleDelete}
          onToggle={handleToggle}
        />

        {/* Pagination */}
        <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <span className="text-[13px] text-gray-500 font-medium">
            Mostrando {paginated.length} de {filtered.length} productos
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-3.5 py-1.5 rounded-md border border-gray-200 text-[13px] font-medium transition-colors ${
                page === 1
                  ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
              }`}
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className={`px-3.5 py-1.5 rounded-md border border-gray-200 text-[13px] font-medium transition-colors ${
                page >= totalPages
                  ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
              }`}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {modal?.type === "add" && (
        <ProductFormModal
          product={null}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      {modal?.type === "edit" && (
        <ProductFormModal
          product={modal.product}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      {modal?.type === "delete" && (
        <DeleteConfirmationModal
          product={modal.product}
          onClose={() => setModal(null)}
          onConfirm={confirmDelete}
        />
      )}
      {modal?.type === "sales-error" && (
        <SalesHistoryErrorModal
          product={modal.product}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "success-add" && (
        <StatusFeedbackModal
          type="add"
          onClose={() => setModal(null)}
          onContinue={() => setModal({ type: "add" })}
        />
      )}
      {modal?.type === "success-delete" && (
        <StatusFeedbackModal type="delete" onClose={() => setModal(null)} />
      )}
    </>
  );
}
