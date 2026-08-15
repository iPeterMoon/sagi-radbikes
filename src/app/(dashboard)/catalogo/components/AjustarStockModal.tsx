"use client";

import { useState } from "react";
import { VarianteDTO } from "@/types/dtos";
import { IconX } from "@/components/ui/Icons";

const twField =
  "w-full py-[9px] px-3 border border-gray-200 rounded-lg text-[13px] text-gray-900 outline-none bg-white box-border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

interface Props {
  variante: VarianteDTO;
  onClose: () => void;
  onAdjust: (delta: number) => Promise<void>;
}

/**
 * Modal para ajustar el stock de una variante sumando o restando una
 * cantidad relativa al valor actual (a diferencia de "Editar variante",
 * que sobrescribe el stock con un valor absoluto).
 */
export default function AjustarStockModal({ variante, onClose, onAdjust }: Props) {
  const [modo, setModo] = useState<"sumar" | "restar">("sumar");
  const [cantidad, setCantidad] = useState<number | "">("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (cantidad === "" || Number.isNaN(Number(cantidad)) || Number(cantidad) <= 0) {
      setError("Ingresa una cantidad válida mayor a 0");
      return;
    }

    const delta = modo === "restar" ? -Number(cantidad) : Number(cantidad);

    setIsLoading(true);
    try {
      await onAdjust(delta);
      onClose();
    } catch (err: any) {
      setError(err?.message || "No se pudo ajustar el stock");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-1020 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-[min(96vw,380px)] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
      >
        <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">
          <h2 className="text-[15px] font-bold text-gray-900 m-0">
            Ajustar stock — {variante.sku}
          </h2>
          <button
            onClick={onClose}
            className="ml-auto bg-transparent border-none cursor-pointer text-gray-400 p-1 flex hover:text-gray-600 transition-colors"
          >
            <IconX size={16} />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-3">
          <p className="text-[12px] text-gray-500">
            Stock actual: <strong>{variante.stock}</strong>
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setModo("sumar")}
              className={`flex-1 py-2 rounded-lg text-[13px] font-semibold cursor-pointer border transition-colors ${
                modo === "sumar"
                  ? "bg-green-50 border-green-300 text-green-700"
                  : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              + Sumar
            </button>
            <button
              type="button"
              onClick={() => setModo("restar")}
              className={`flex-1 py-2 rounded-lg text-[13px] font-semibold cursor-pointer border transition-colors ${
                modo === "restar"
                  ? "bg-red-50 border-red-300 text-red-700"
                  : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              − Restar
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">
              Cantidad
            </label>
            <input
              type="number"
              min={1}
              value={cantidad}
              onChange={(e) =>
                setCantidad(e.target.value === "" ? "" : Number(e.target.value))
              }
              placeholder="0"
              className={`${twField} ${error ? "border-red-500" : ""}`}
            />
            {error && <p className="text-red-500 text-[11px] mt-1">{error}</p>}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-2.5 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-1.5 rounded-lg border border-gray-200 bg-white cursor-pointer text-[13px] text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-4 py-1.5 rounded-lg border-none bg-blue-600 text-white cursor-pointer text-[13px] font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Aplicando..." : "Aplicar ajuste"}
          </button>
        </div>
      </div>
    </div>
  );
}
