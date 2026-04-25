"use client";

import { useState } from "react";
import { IconX } from "@/components/ui/Icons";

export type AttributeType = "brand" | "category" | "subcategory" | null;

interface AddAttributeModalProps {
  type: AttributeType;
  categories: string[];
  initialParentCategory: string;
  onClose: () => void;
  onSave: (value: string, parentCategory?: string) => void;
}

const twField =
  "w-full py-[9px] px-3 border border-gray-200 rounded-lg text-[13px] text-gray-900 outline-none bg-white box-border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
const twLabel = "text-xs font-semibold text-gray-700 mb-1 block";

export default function AddAttributeModal({
  type,
  categories,
  initialParentCategory,
  onClose,
  onSave,
}: AddAttributeModalProps) {
  const [value, setValue] = useState("");
  const [parentCat, setParentCat] = useState(initialParentCategory);

  if (!type) return null;

  const handleSave = () => {
    if (!value.trim()) return;
    onSave(value.trim(), type === "subcategory" ? parentCat : undefined);
  };

  const title =
    type === "brand"
      ? "Marca"
      : type === "category"
        ? "Categoría"
        : "Subcategoría";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-1010 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl w-full max-w-90 overflow-hidden shadow-2xl border border-gray-100"
      >
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900 text-[15px] m-0">
            Agregar {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none p-1"
          >
            <IconX size={16} />
          </button>
        </div>

        <div className="p-5">
          {type === "subcategory" && (
            <div className="mb-4">
              <label className={twLabel}>Categoría Padre</label>
              <select
                id="categoriaPadre"
                value={parentCat}
                onChange={(e) => setParentCat(e.target.value)}
                className={`${twField} appearance-none cursor-pointer`}
              >
                <option value="">Selecciona una categoría...</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className={twLabel}>
              Nombre de la nueva {title.toLowerCase()}
            </label>
            <input
              id={title.toLowerCase() + "-input"}
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder={`Ej. ${type === "brand" ? "Yamaha" : type === "category" ? "Electrónicos" : "Frenos ABS"}`}
              className={twField}
            />
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-gray-200 bg-white cursor-pointer text-[13px] font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg border-none bg-blue-600 text-white cursor-pointer text-[13px] font-semibold hover:bg-blue-700 transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
