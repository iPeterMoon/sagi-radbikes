// hooks/useBarcodeScanner.ts
"use client";

import { useEffect, useRef } from "react";

interface UseBarcodeScannerOptions {
  onScan: (codigo: string) => void;
  /** Longitud mínima del código para considerarse válido (evita falsos positivos). */
  minLength?: number;
  enabled?: boolean;
}

const SCAN_ATTR = "data-allow-scan";

/**
 * Captura el código completo que entrega un escáner de código de barras USB
 * (actúa como teclado + Enter al final). Ignora cualquier campo editable
 * que no esté explícitamente marcado con data-allow-scan="true".
 */
export function useBarcodeScanner({
  onScan,
  minLength = 4,
  enabled = true,
}: UseBarcodeScannerOptions) {
  const bufferRef = useRef("");

  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isEditable =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (isEditable && target?.getAttribute(SCAN_ATTR) !== "true") {
        bufferRef.current = "";
        return;
      }

      if (e.key === "Enter") {
        const codigo = bufferRef.current;
        bufferRef.current = "";
        if (codigo.length >= minLength) {
          e.preventDefault();
          onScan(codigo);
        }
        return;
      }

      if (e.key.length !== 1) return; // ignora Shift, Tab, flechas, etc.
      bufferRef.current += e.key;
    }

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [enabled, onScan, minLength]);
}