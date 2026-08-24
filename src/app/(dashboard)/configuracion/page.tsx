"use client";

import { useState, useEffect } from "react";
import { configuracionApi } from "@/lib/api/configuracion";

const twField =
  "w-full py-[9px] px-3 border border-gray-200 rounded-lg text-[13px] text-gray-900 outline-none bg-white box-border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
const twLabel = "text-xs font-semibold text-gray-700 mb-1 block";

/**
 * Página de Configuración general del sistema (margen de ganancia sugerido y,
 * a futuro, otras configuraciones administrativas).
 */
export default function ConfiguracionPage() {
  const [margen, setMargen] = useState<number | string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    configuracionApi
      .obtener()
      .then((dto) => setMargen(dto.margenGananciaSugerido))
      .catch((err) => setError(err.message || "No se pudo cargar la configuración"))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setError("");
    setSuccess(false);
    if (margen === "" || Number.isNaN(Number(margen)) || Number(margen) <= 0) {
      setError("El margen debe ser un número mayor a 0");
      return;
    }
    setIsSaving(true);
    try {
      await configuracionApi.actualizar({ margenGananciaSugerido: Number(margen) });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "No se pudo guardar la configuración");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 m-0">
          Configuración
        </h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 max-w-md">
        <h2 className="text-sm font-bold text-gray-900 mb-1">
          Precios y márgenes
        </h2>
        <p className="text-[12px] text-gray-500 mb-4">
          Multiplicador usado para sugerir un precio de venta a partir del
          costo de un producto o variante (ej. 1.5 = 50% de margen sobre el
          costo). La sugerencia siempre se puede editar al capturar el precio.
        </p>

        {isLoading ? (
          <p className="text-[13px] text-gray-400">Cargando...</p>
        ) : (
          <>
            <label className={twLabel}>Margen de ganancia sugerido</label>
            <input
              type="number"
              min={1}
              step={0.1}
              value={margen}
              onChange={(e) =>
                setMargen(e.target.value === "" ? "" : Number(e.target.value))
              }
              className={twField}
            />

            {error && <p className="text-red-500 text-[11px] mt-2">{error}</p>}
            {success && (
              <p className="text-green-600 text-[11px] mt-2">
                Configuración guardada.
              </p>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="mt-4 px-4 py-1.5 rounded-lg border-none bg-blue-600 text-white cursor-pointer text-[13px] font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? "Guardando..." : "Guardar"}
            </button>
          </>
        )}
      </div>
    </>
  );
}
