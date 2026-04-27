"use client";

import Image from "next/image";
import { SuccessModalProps } from "@/types/inventory";
import {
  IconCheck,
  IconArrowRight,
  IconPlus,
  IconGrid,
} from "@/components/ui/Icons";

/**
 * Modal de retroalimentación de estado.
 * Se muestra tras agregar o eliminar un producto exitosamente.
 * El tipo "add" incluye una imagen de portada; el tipo "delete" usa un icono simple.
 */
export default function StatusFeedbackModal({
  type,
  onClose,
  onContinue,
}: SuccessModalProps) {
  const isAdd = type === "add";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-[min(96vw,380px)] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
      >
        {isAdd && (
          <div className="h-45 overflow-hidden relative">
            <Image
              src="https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=200&fit=crop"
              alt="Producto agregado"
              className="w-full h-full object-cover"
              width={400}
              height={200}
            />
            <div className="absolute inset-0 bg-linear-to-b from-black/10 to-black/40 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-white shadow-[0_0_0_8px_rgba(34,197,94,0.3)]">
                <IconCheck />
              </div>
            </div>
          </div>
        )}

        {!isAdd && (
          <div className="pt-8 flex justify-center">
            <div className="w-18 h-18 rounded-full bg-green-50 border-[3px] border-green-200 flex items-center justify-center text-green-500">
              <IconCheck />
            </div>
          </div>
        )}

        <div className="px-7 pb-7 pt-6 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-1.5">
            {isAdd ? "¡Producto Agregado!" : "Producto Eliminado"}
          </h2>

          {isAdd ? (
            <div className="flex flex-col gap-2.5 mt-5">
              <button
                onClick={onClose}
                className="p-2.75 rounded-lg border-none bg-blue-600 text-white cursor-pointer text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <IconGrid /> Ir al Catálogo
              </button>
              <button
                onClick={onContinue}
                className="p-2.75 rounded-lg border border-gray-200 bg-white cursor-pointer text-sm text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <IconPlus /> Agregar Otro
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="mt-5 w-full p-2.75 rounded-lg border-none bg-blue-600 text-white cursor-pointer text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
            >
              Continuar <IconArrowRight />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
