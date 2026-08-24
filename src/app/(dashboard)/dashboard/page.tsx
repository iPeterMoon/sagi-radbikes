"use client";

import { useState, useEffect } from "react";
import { dashboardApi } from "@/lib/api/dashboard";
import {
  DashboardResumenDTO,
  VentasPeriodoDTO,
  MargenPeriodoDTO,
  TopProductoDTO,
} from "@/types/dtos";
import { formatPrice } from "@/lib/utils";
import { IconWarning } from "@/components/ui/Icons";
import { Wallet, TrendingUp, Trophy, PieChart } from "@boxicons/react";

const thClass =
  "px-3.5 py-2.5 text-[11px] font-bold text-gray-400 tracking-[0.06em] text-left uppercase border-b border-gray-200";
const thRightClass =
  "px-3.5 py-2.5 text-[11px] font-bold text-gray-400 tracking-[0.06em] text-right uppercase border-b border-gray-200";
const tdClass = "p-3.5 text-[13px] text-gray-700 border-b border-gray-100 align-middle";
const tdRightClass = `${tdClass} text-right [font-variant-numeric:tabular-nums]`;

interface PeriodoCardProps {
  label: string;
  ventas: VentasPeriodoDTO;
  margen: MargenPeriodoDTO;
  destacado?: boolean;
}

/** Card de resumen financiero de un período: ventas totales y margen de ganancia. */
function PeriodoCard({ label, ventas, margen, destacado = false }: PeriodoCardProps) {
  const margenPositivo = margen.montoMargen >= 0;

  return (
    <div
      className={`rounded-xl p-5 border ${
        destacado ? "bg-primary border-primary" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <p
          className={`text-xs font-semibold uppercase tracking-[0.04em] ${
            destacado ? "text-blue-200" : "text-gray-500"
          }`}
        >
          {label}
        </p>
        <Wallet size="xs" className={destacado ? "text-blue-200" : "text-gray-300"} />
      </div>

      <p
        className={`text-[26px] leading-tight font-bold mb-1 [font-variant-numeric:tabular-nums] ${
          destacado ? "text-white" : "text-gray-900"
        }`}
      >
        ${formatPrice(ventas.total)}
      </p>
      <p className={`text-[12px] ${destacado ? "text-blue-200" : "text-gray-500"}`}>
        {ventas.cantidadVentas} {ventas.cantidadVentas === 1 ? "venta" : "ventas"}
      </p>

      <div
        className={`flex items-center justify-between mt-4 pt-3 border-t ${
          destacado ? "border-blue-800/60" : "border-gray-100"
        }`}
      >
        <span
          className={`flex items-center gap-1.5 text-[12px] font-medium ${
            destacado ? "text-blue-200" : "text-gray-500"
          }`}
        >
          <TrendingUp size="xs" />
          Margen
        </span>
        <span
          className={`text-[13px] font-bold [font-variant-numeric:tabular-nums] ${
            destacado
              ? margenPositivo
                ? "text-emerald-300"
                : "text-red-300"
              : margenPositivo
                ? "text-green-600"
                : "text-red-600"
          }`}
        >
          ${formatPrice(margen.montoMargen)} · {margen.porcentajeMargen.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

/** Placeholder de las cards de resumen mientras se carga el dashboard. */
function PeriodoCardSkeleton() {
  return (
    <div className="rounded-xl p-5 border border-gray-200 bg-white animate-pulse">
      <div className="h-3 w-16 bg-gray-100 rounded mb-4" />
      <div className="h-7 w-28 bg-gray-100 rounded mb-2" />
      <div className="h-3 w-14 bg-gray-100 rounded mb-5" />
      <div className="h-3 w-full bg-gray-100 rounded" />
    </div>
  );
}

/** Gráfica de barras horizontales con los productos más vendidos por ingresos. */
function TopProductosChart({ productos }: { productos: TopProductoDTO[] }) {
  const top = [...productos].sort((a, b) => b.ingresos - a.ingresos).slice(0, 5);
  const max = Math.max(...top.map((p) => p.ingresos), 1);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-4">Top productos por ingresos</h3>
      {top.length === 0 ? (
        <p className="text-[13px] text-gray-400">Todavía no hay ventas este mes.</p>
      ) : (
        <div className="flex flex-col gap-3.5">
          {top.map((p) => (
            <div key={p.sku}>
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <span className="text-[12.5px] text-gray-700 truncate">{p.nombre}</span>
                <span className="text-[12.5px] font-semibold text-gray-900 [font-variant-numeric:tabular-nums] shrink-0">
                  ${formatPrice(p.ingresos)}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${(p.ingresos / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Gráfica de composición de ingresos del mes: costo vs. margen de ganancia. */
function ComposicionMesChart({
  ventas,
  margen,
}: {
  ventas: VentasPeriodoDTO;
  margen: MargenPeriodoDTO;
}) {
  const total = ventas.total;
  const costo = Math.max(0, total - margen.montoMargen);
  const margenPositivo = margen.montoMargen >= 0;
  const margenPct = total > 0 ? Math.max(0, Math.min(100, margen.porcentajeMargen)) : 0;
  const costoPct = 100 - margenPct;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-4">Composición de ingresos · Este mes</h3>
      {total === 0 ? (
        <p className="text-[13px] text-gray-400">Todavía no hay ventas este mes.</p>
      ) : (
        <>
          <div className="h-3 rounded-full overflow-hidden flex bg-gray-100 mb-4">
            <div className="h-full bg-gray-400" style={{ width: `${costoPct}%` }} />
            <div className="h-full bg-green-500" style={{ width: `${margenPct}%` }} />
          </div>
          <div className="flex items-center justify-between text-[12.5px]">
            <span className="flex items-center gap-1.5 text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-400 shrink-0" />
              Costo · ${formatPrice(costo)}
            </span>
            <span
              className={`flex items-center gap-1.5 font-medium ${
                margenPositivo ? "text-green-600" : "text-red-600"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
              Margen · {margen.porcentajeMargen.toFixed(1)}%
            </span>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Dashboard de KPIs: ventas y margen de ganancia de hoy/semana/mes, y
 * productos más vendidos del mes en curso.
 */
export default function DashboardPage() {
  const [resumen, setResumen] = useState<DashboardResumenDTO | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    dashboardApi
      .obtenerResumen()
      .then(setResumen)
      .catch((err) => setError(err.message || "No se pudo cargar el dashboard"));
  }, []);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 m-0">Dashboard</h1>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5 text-[13px] mb-6">
          <IconWarning size={16} />
          {error}
        </div>
      )}

      {!resumen ? (
        <div className="flex flex-col gap-6">
          <section>
            <div className="h-3.5 w-40 bg-gray-100 rounded mb-3 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <PeriodoCardSkeleton />
              <PeriodoCardSkeleton />
              <PeriodoCardSkeleton />
            </div>
          </section>
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-48 rounded-xl border border-gray-200 bg-white animate-pulse" />
            <div className="h-48 rounded-xl border border-gray-200 bg-white animate-pulse" />
          </section>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <section>
            <h2 className="text-sm font-bold text-gray-900 mb-3">Resumen financiero</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <PeriodoCard label="Hoy" ventas={resumen.ventas.hoy} margen={resumen.margen.hoy} destacado />
              <PeriodoCard label="Esta semana" ventas={resumen.ventas.semana} margen={resumen.margen.semana} />
              <PeriodoCard label="Este mes" ventas={resumen.ventas.mes} margen={resumen.margen.mes} />
            </div>
          </section>

          <section>
            <h2 className="flex items-center gap-1.5 text-sm font-bold text-gray-900 mb-3">
              <PieChart size="xs" className="text-gray-400" />
              Análisis
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TopProductosChart productos={resumen.topProductos} />
              <ComposicionMesChart ventas={resumen.ventas.mes} margen={resumen.margen.mes} />
            </div>
          </section>

          <section>
            <h2 className="flex items-center gap-1.5 text-sm font-bold text-gray-900 mb-3">
              <Trophy size="xs" className="text-gray-400" />
              Productos más vendidos (mes en curso)
            </h2>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {resumen.topProductos.length === 0 ? (
                <p className="text-[13px] text-gray-400 p-5">
                  Todavía no hay ventas este mes.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className={`${thClass} w-10`}>#</th>
                        <th className={thClass}>Producto</th>
                        <th className={thClass}>SKU</th>
                        <th className={thRightClass}>Unidades</th>
                        <th className={thRightClass}>Ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumen.topProductos.map((p, i) => (
                        <tr key={p.sku} className="hover:bg-gray-50/60 transition-colors">
                          <td className={`${tdClass} text-gray-400 font-semibold`}>{i + 1}</td>
                          <td className={`${tdClass} font-medium text-gray-900`}>{p.nombre}</td>
                          <td className={`${tdClass} font-mono text-gray-500`}>
                            {p.sku}
                          </td>
                          <td className={tdRightClass}>{p.unidadesVendidas}</td>
                          <td className={`${tdRightClass} font-semibold text-gray-900`}>
                            ${formatPrice(p.ingresos)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
