"use client";

import { useState } from "react";
import { IconX } from "@/components/ui/Icons";

const twField =
  "w-full py-[9px] px-3 border border-gray-200 rounded-lg text-[13px] text-gray-900 outline-none bg-white box-border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
const twLabel = "text-xs font-semibold text-gray-700 mb-1 block";

interface Props {
  onClose: () => void;
  onSave: (nombre: string, descripcion: string) => void;
  validate?: (nombre: string) => string | undefined;
}

export default function AddRolModal({ onClose, onSave, validate }: Props) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    const trimmed = nombre.trim();
    if (!trimmed) {
      setError("El nombre es requerido");
      return;
    }
    const validationError = validate?.(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }
    onSave(trimmed, descripcion.trim());
  };

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
            Agregar rol
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none p-1"
          >
            <IconX size={16} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-3">
          <div>
            <label className={twLabel}>Nombre <span className="text-red-500">*</span></label>
            <input
              autoFocus
              value={nombre}
              onChange={(e) => { setNombre(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="Ej. Encargado de taller"
              className={`${twField} ${error ? "border-red-500" : ""}`}
            />
            {error && <p className="text-red-500 text-[11px] mt-1">{error}</p>}
          </div>
          <div>
            <label className={twLabel}>Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción opcional del rol..."
              rows={2}
              className={`${twField} resize-none`}
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