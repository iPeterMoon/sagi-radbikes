// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, renderHook } from "@testing-library/react";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";

function type(keys: string[], target: EventTarget = window) {
  for (const key of keys) {
    target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
  }
}

describe("useBarcodeScanner", () => {
  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  it("captura el código al presionar Enter", () => {
    const onScan = vi.fn();
    renderHook(() => useBarcodeScanner({ onScan }));

    type(["1", "2", "3", "4", "Enter"]);

    expect(onScan).toHaveBeenCalledWith("1234");
  });

  it("ignora códigos más cortos que minLength", () => {
    const onScan = vi.fn();
    renderHook(() => useBarcodeScanner({ onScan, minLength: 5 }));

    type(["1", "2", "3", "Enter"]);

    expect(onScan).not.toHaveBeenCalled();
  });

  it("respeta un minLength personalizado", () => {
    const onScan = vi.fn();
    renderHook(() => useBarcodeScanner({ onScan, minLength: 2 }));
    type(["a", "b", "Enter"]);
    expect(onScan).toHaveBeenCalledWith("ab");
  });

  it("ignora teclas que no son de un solo carácter", () => {
    const onScan = vi.fn();
    renderHook(() => useBarcodeScanner({ onScan, minLength: 4 }));
    type(["Shift", "ArrowLeft", "Tab", "a", "b", "c", "d", "Enter"]);
    expect(onScan).toHaveBeenCalledWith("abcd");
  });

  it("descarta el buffer al escribir en un input no autorizado", () => {
    const onScan = vi.fn();
    renderHook(() => useBarcodeScanner({ onScan, minLength: 4 }));

    const input = document.createElement("input");
    document.body.appendChild(input);

    // La primera tecla entra al buffer desde window...
    type(["a", "b", "c", "d"]);
    // ...pero al escribir en el input se limpia y Enter no dispara el scan.
    type(["x"], input);
    type(["Enter"]);

    expect(onScan).not.toHaveBeenCalled();
  });

  it("sí captura en un input marcado con data-allow-scan", () => {
    const onScan = vi.fn();
    renderHook(() => useBarcodeScanner({ onScan, minLength: 4 }));

    const input = document.createElement("input");
    input.setAttribute("data-allow-scan", "true");
    document.body.appendChild(input);

    type(["1", "2", "3", "4", "Enter"], input);

    expect(onScan).toHaveBeenCalledWith("1234");
  });

  it("no escucha cuando está deshabilitado", () => {
    const onScan = vi.fn();
    renderHook(() => useBarcodeScanner({ onScan, enabled: false }));
    type(["1", "2", "3", "4", "Enter"]);
    expect(onScan).not.toHaveBeenCalled();
  });

  it("deja de escuchar al desmontar", () => {
    const onScan = vi.fn();
    const { unmount } = renderHook(() => useBarcodeScanner({ onScan }));
    unmount();
    type(["1", "2", "3", "4", "Enter"]);
    expect(onScan).not.toHaveBeenCalled();
  });
});
