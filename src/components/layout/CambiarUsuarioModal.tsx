"use client";

import { useEffect, useState } from "react";
import { authApi } from "@/lib/api/auth";
import { posApi } from "@/lib/api/pos";
import { VendedorActivoDTO } from "@/types/dtos";
import { IconX } from "@/components/ui/Icons";

const AVATAR_COLORS = [
  { bg: "#dbeafe", text: "#1d4ed8" },
  { bg: "#ede9fe", text: "#6d28d9" },
  { bg: "#dcfce7", text: "#15803d" },
  { bg: "#ffedd5", text: "#c2410c" },
  { bg: "#fce7f3", text: "#be185d" },
];

function getAvatarColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function getIniciales(nombre: string, apellido: string): string {
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
}

interface CambiarUsuarioModalProps {
  onClose: () => void;
  /** Id del usuario logueado actualmente, para excluirlo de la lista. */
  usuarioActualId?: string;
}

/**
 * Modal de 2 pasos para cambiar rápidamente de usuario en una terminal
 * compartida (ej. el mostrador de POS), sin pasar por /login ni perder el
 * estado de la página actual (como un carrito en curso). El paso final hace
 * un login real con la contraseña de la persona elegida — no es un cambio
 * "de mentira": actualiza el token y por lo tanto los permisos también.
 */
export default function CambiarUsuarioModal({
  onClose,
  usuarioActualId,
}: CambiarUsuarioModalProps) {
  const [vendedores, setVendedores] = useState<VendedorActivoDTO[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [seleccionado, setSeleccionado] = useState<VendedorActivoDTO | null>(null);
  const [password, setPassword] = useState("");
  const [ingresando, setIngresando] = useState(false);

  useEffect(() => {
    posApi
      .obtenerVendedoresActivos()
      .then((data) =>
        setVendedores(data.filter((v) => v.idUsuario !== usuarioActualId)),
      )
      .catch(() => setError("No se pudo cargar la lista de usuarios"))
      .finally(() => setCargando(false));
  }, [usuarioActualId]);

  const handleElegir = (vendedor: VendedorActivoDTO) => {
    setSeleccionado(vendedor);
    setError("");
    setPassword("");
  };

  const handleVolver = () => {
    setSeleccionado(null);
    setError("");
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seleccionado || !password) return;

    setError("");
    setIngresando(true);
    try {
      const sesion = await authApi.login({
        username: seleccionado.username,
        password,
      } as any);
      localStorage.setItem("usuario", JSON.stringify(sesion.usuario));
      window.dispatchEvent(new Event("usuarioUpdated"));
      onClose();
    } catch (err: any) {
      setError(err.message || "Contraseña incorrecta");
    } finally {
      setIngresando(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-[min(96vw,420px)] shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            {seleccionado ? `Hola, ${seleccionado.nombre}` : "Cambiar usuario"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <IconX size={16} />
          </button>
        </div>

        <div className="p-5">
          {!seleccionado ? (
            cargando ? (
              <p className="text-[13px] text-gray-400 text-center py-6">Cargando...</p>
            ) : error ? (
              <p className="text-[13px] text-red-600 text-center py-6">{error}</p>
            ) : vendedores.length === 0 ? (
              <p className="text-[13px] text-gray-400 text-center py-6">
                No hay otros usuarios activos.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 max-h-[50vh] overflow-y-auto">
                {vendedores.map((vendedor, i) => {
                  const color = getAvatarColor(i);
                  return (
                    <button
                      key={vendedor.idUsuario}
                      type="button"
                      onClick={() => handleElegir(vendedor)}
                      className="flex flex-col items-center gap-2 p-3.5 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors cursor-pointer"
                    >
                      <div
                        style={{ background: color.bg, color: color.text }}
                        className="w-11 h-11 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0"
                      >
                        {getIniciales(vendedor.nombre, vendedor.apellido)}
                      </div>
                      <div className="text-center">
                        <div className="text-[13px] font-semibold text-gray-900 leading-tight">
                          {vendedor.nombre} {vendedor.apellido}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          @{vendedor.username}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )
          ) : (
            <form onSubmit={handleSubmit}>
              <button
                type="button"
                onClick={handleVolver}
                className="text-[12px] text-gray-500 hover:text-gray-700 mb-3.5 cursor-pointer bg-transparent border-none p-0"
              >
                ‹ Elegir otra persona
              </button>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Contraseña de @{seleccionado.username}
              </label>
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresá tu contraseña"
                className="w-full py-2.5 px-3.5 border border-gray-200 rounded-lg text-[13px] text-gray-900 outline-none bg-white focus:ring-2 focus:ring-blue-500 transition-shadow"
              />
              {error && <p className="text-red-500 text-[12px] mt-2">{error}</p>}
              <button
                type="submit"
                disabled={ingresando || !password}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white border-none rounded-lg py-2.5 cursor-pointer text-sm font-bold transition-colors"
              >
                {ingresando ? "Ingresando..." : "Ingresar"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
