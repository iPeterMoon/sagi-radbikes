"use client";

import { PaymentMethod } from "@/types/pos";
import { CurrencyNotes,
         CreditCardAlt,
         SwapDiagonal,           
 } from "@boxicons/react";  

interface PaymentOption {
  key: PaymentMethod;
  label: string;
  icon: React.ReactNode;
}

/** Opciones de pago disponibles con sus etiquetas e iconos. */
const PAYMENT_OPTIONS: PaymentOption[] = [
  { key: "efectivo", label: "EFECTIVO", icon: <CurrencyNotes size="md" /> },
  { key: "tarjeta", label: "TARJETA", icon: <CreditCardAlt size="md" /> },
  { key: "transferencia", label: "TRANSF.", icon: <SwapDiagonal size="md" /> },
];

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

/**
 * Selector de método de pago en el panel del carrito.
 * Muestra tres opciones en una cuadrícula: efectivo, tarjeta y transferencia.
 */
export default function PaymentMethodSelector({
  selected,
  onChange,
}: PaymentMethodSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {PAYMENT_OPTIONS.map(({ key, label, icon }) => {
        const isActive = selected === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border text-[10px] font-bold tracking-wide transition-all cursor-pointer outline-none ${
              isActive
                ? "border-[#1a2e5a]/25 bg-[#eef2ff] text-[#1a2e5a] shadow-sm"
                : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            <span className={isActive ? "text-[#1a2e5a]" : "text-gray-400"}>
              {icon}
            </span>
            {label}
          </button>
        );
      })}
    </div>
  );
}