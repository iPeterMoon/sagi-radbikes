"use client";

import { VentaResumenDTO } from "@/types/pos";
import { Printer } from "@boxicons/react";
import { useState } from "react";

interface SuccessModalProps {
  isOpen: boolean;
  resumen: VentaResumenDTO | null;
  printError: string | null;
  onClose: () => void;
  onNewSale: () => void;
  onPrint: (resumen: VentaResumenDTO) => void;
}

export default function SuccessModal({
  isOpen,
  resumen,
  printError,
  onClose,
  onNewSale,
  onPrint,
}: SuccessModalProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen || !resumen) return null;

  const handleNewSale = () => {
    onNewSale();
    onClose();
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      await onPrint(resumen);
    } finally {
      setIsPrinting(false);
    }
  };

  const formattedDate = new Date(resumen.fecha).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl">
        {/* Checkmark Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-14 w-14 text-green-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-3 text-center text-2xl font-bold text-gray-900">
          ¡Venta Registrada con Éxito!
        </h2>

        {/* Subtitle */}
        <p className="mb-8 text-center text-sm text-gray-500 leading-relaxed">
          La transacción se ha completado correctamente y el inventario ha sido actualizado.
        </p>

        {printError && (
          <div className="mb-4 px-4 py-3 rounded-md text-sm bg-red-50 border border-red-200 text-red-800">
            {printError}
          </div>
        )}

        {/* Buttons - Stacked Vertically */}
        <div className="space-y-3 mb-6">
          {/* Nueva Venta Button (Primary) */}
          <button
            onClick={handleNewSale}
            className="w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800"
          >
            Nueva Venta
          </button>

          {/* Imprimir Recibo Button (Secondary) */}
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 px-6 py-3 font-semibold text-gray-600 transition hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50"
          >
            <Printer className="h-5 w-5" />
            {isPrinting ? "Imprimiendo..." : printError? "Reintentar Impresión" : "Imprimir Recibo"}
          </button>
        </div>

        {/* Footer */}
        <div className="border-t pt-4 text-center text-xs text-gray-400">
          <p>
            Ticket #{resumen.folio} • {formattedDate}
          </p>
        </div>
      </div>
    </div>
  );
}
