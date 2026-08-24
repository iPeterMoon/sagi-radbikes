"use client";

import { useEffect, useState } from "react";
import { reportesApi } from "@/lib/api/reportes";
import {
  ReporteVentasDTO,
  TopProductoReporteDTO,
  VentaPorDiaDTO,
} from "@/types/dtos";
import { formatPrice } from "@/lib/utils";
import { IconWarning, IconDownload } from "@/components/ui/Icons";
import { Wallet, Receipt, TrendingUp, PieChart } from "@boxicons/react";
import type { BoxIconProps } from "@boxicons/react";

/** Cantidad de ventas a mostrar por página en el listado detallado. */
const PER_PAGE = 10;

const thClass =
  "px-3.5 py-2.5 text-[11px] font-bold text-gray-400 tracking-[0.06em] text-left uppercase border-b border-gray-200";
const thRightClass =
  "px-3.5 py-2.5 text-[11px] font-bold text-gray-400 tracking-[0.06em] text-right uppercase border-b border-gray-200";
const tdClass = "p-3.5 text-[13px] text-gray-700 border-b border-gray-100 align-middle";
const tdRightClass = `${tdClass} text-right [font-variant-numeric:tabular-nums]`;

/** Formatea una fecha local como "YYYY-MM-DD", sin desfases de zona horaria. */
function formatearFechaInput(fecha: Date): string {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Convierte "YYYY-MM-DD" a "DD/MM", para etiquetas cortas de gráficas y tablas. */
function formatearFechaCorta(fechaISO: string): string {
  const [, month, day] = fechaISO.split("-");
  return `${day}/${month}`;
}

/** Formatea una fecha/hora ISO completa para el listado detallado. */
function formatearFechaHora(fechaISO: string): string {
  return new Date(fechaISO).toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Carga una imagen pública como data URL base64, lista para `doc.addImage`.
 * Devuelve `null` si no se pudo cargar, para que el PDF se genere igual sin logo.
 */
async function cargarImagenComoDataURL(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Card de un KPI del resumen del reporte. */
function ResumenCard({
  label,
  Icon,
  value,
  caption,
  valueClass = "text-gray-900",
}: {
  label: string;
  Icon: React.ComponentType<BoxIconProps>;
  value: string;
  caption: string;
  valueClass?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.04em] text-gray-500">
          {label}
        </p>
        <Icon size="xs" className="text-gray-300" />
      </div>
      <p
        className={`text-[26px] leading-tight font-bold mb-1 [font-variant-numeric:tabular-nums] ${valueClass}`}
      >
        {value}
      </p>
      <p className="text-[12px] text-gray-500">{caption}</p>
    </div>
  );
}

/** Placeholder de las cards de resumen mientras se carga el reporte. */
function ResumenCardSkeleton() {
  return (
    <div className="rounded-xl p-5 border border-gray-200 bg-white animate-pulse">
      <div className="h-3 w-20 bg-gray-100 rounded mb-4" />
      <div className="h-7 w-28 bg-gray-100 rounded mb-2" />
      <div className="h-3 w-16 bg-gray-100 rounded" />
    </div>
  );
}

/** Gráfica de barras horizontales con los productos más vendidos por ingresos. */
function TopProductosChart({ productos }: { productos: TopProductoReporteDTO[] }) {
  const top = [...productos].sort((a, b) => b.ingresos - a.ingresos).slice(0, 5);
  const max = Math.max(...top.map((p) => p.ingresos), 1);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-4">Top productos por ingresos</h3>
      {top.length === 0 ? (
        <p className="text-[13px] text-gray-400">No hay ventas en el rango seleccionado.</p>
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

/** Gráfica de barras verticales con el total vendido por día. Se desplaza horizontalmente si el rango es largo. */
function VentasPorDiaChart({ dias }: { dias: VentaPorDiaDTO[] }) {
  const ALTO_BARRA = 110;
  const max = Math.max(...dias.map((d) => d.total), 1);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-4">Ventas por día</h3>
      {dias.length === 0 ? (
        <p className="text-[13px] text-gray-400">No hay ventas en el rango seleccionado.</p>
      ) : (
        <div className="overflow-x-auto">
          <div
            className="flex items-end gap-2 min-w-max px-1"
            style={{ height: ALTO_BARRA + 24 }}
          >
            {dias.map((d) => (
              <div
                key={d.fecha}
                className="flex flex-col items-center gap-1.5 w-7 shrink-0"
                title={`${formatearFechaCorta(d.fecha)}: $${formatPrice(d.total)} · ${d.cantidadVentas} ${d.cantidadVentas === 1 ? "venta" : "ventas"}`}
              >
                <div
                  className="w-full bg-primary rounded-t"
                  style={{ height: Math.max(3, (d.total / max) * ALTO_BARRA) }}
                />
                <span className="text-[9px] text-gray-400 whitespace-nowrap">
                  {formatearFechaCorta(d.fecha)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Página de Reportes de Venta: permite elegir un rango de fechas y muestra
 * un resumen de KPIs, productos más vendidos, ventas por día y el listado
 * detallado de ventas del rango, con exportación a PDF.
 */
export default function ReportesPage() {
  const hoy = new Date();
  const primerDiaDelMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  const [desde, setDesde] = useState(formatearFechaInput(primerDiaDelMes));
  const [hasta, setHasta] = useState(formatearFechaInput(hoy));
  const [reporte, setReporte] = useState<ReporteVentasDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exportando, setExportando] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelado = false;
    setLoading(true);
    setError("");

    reportesApi
      .obtenerReporteVentas(desde, hasta)
      .then((data) => {
        if (cancelado) return;
        setReporte(data);
        setPage(1);
      })
      .catch((err) => {
        if (cancelado) return;
        setError(err.message || "No se pudo generar el reporte");
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [desde, hasta]);

  const handleExportarPDF = async () => {
    if (!reporte || reporte.ventas.length === 0) return;

    setExportando(true);
    try {
      const [{ jsPDF }, { autoTable }, logoDataUrl] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
        cargarImagenComoDataURL("/logo-radbikes.png"),
      ]);

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const MARGIN = 14;
      const HEADER_HEIGHT = 34;
      const azulPrimario: [number, number, number] = [30, 58, 138];
      const gris900: [number, number, number] = [17, 24, 39];
      const gris500: [number, number, number] = [107, 114, 128];
      const gris200: [number, number, number] = [229, 231, 235];
      const gris50: [number, number, number] = [249, 250, 251];

      /** Encabezado de marca (logo + título + período), repetido en cada página. */
      const dibujarEncabezado = () => {
        if (logoDataUrl) {
          const logoAlto = 16;
          const logoAncho = logoAlto * (527 / 474);
          doc.addImage(logoDataUrl, "PNG", MARGIN, 8, logoAncho, logoAlto);
        }
        const textoX = logoDataUrl ? MARGIN + 22 : MARGIN;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        doc.setTextColor(...gris900);
        doc.text("RAD Bikes", textoX, 16);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(...gris500);
        doc.text("Reporte de Ventas", textoX, 22);

        doc.setFontSize(9);
        doc.text(`Período: ${reporte.desde} a ${reporte.hasta}`, pageWidth - MARGIN, 13, {
          align: "right",
        });
        doc.text(`Generado el ${new Date().toLocaleString("es-MX")}`, pageWidth - MARGIN, 18, {
          align: "right",
        });

        doc.setDrawColor(...azulPrimario);
        doc.setLineWidth(0.6);
        doc.line(MARGIN, HEADER_HEIGHT - 6, pageWidth - MARGIN, HEADER_HEIGHT - 6);
        doc.setTextColor(0, 0, 0);
      };

      /** Título de sección con un pequeño acento de color, como en la pantalla. */
      const dibujarTituloSeccion = (texto: string, y: number) => {
        doc.setFillColor(...azulPrimario);
        doc.rect(MARGIN, y - 3, 2.4, 2.4, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...gris900);
        doc.text(texto, MARGIN + 4.5, y);
      };

      /** Cards de KPIs del resumen, estilo consistente con las cards de la pantalla. */
      const dibujarResumenKPIs = (y: number): number => {
        const gap = 4;
        const anchoCard = (pageWidth - MARGIN * 2 - gap * 2) / 3;
        const altoCard = 22;
        const margenPositivo = reporte.resumen.montoMargen >= 0;

        const items: { label: string; valor: string; caption: string; color: [number, number, number] }[] = [
          {
            label: "TOTAL VENDIDO",
            valor: `$${formatPrice(reporte.resumen.total)}`,
            caption: `${reporte.resumen.cantidadVentas} ${reporte.resumen.cantidadVentas === 1 ? "venta" : "ventas"}`,
            color: gris900,
          },
          {
            label: "VENTAS REALIZADAS",
            valor: String(reporte.resumen.cantidadVentas),
            caption: "en el rango seleccionado",
            color: gris900,
          },
          {
            label: "MARGEN DE GANANCIA",
            valor: `$${formatPrice(reporte.resumen.montoMargen)}`,
            caption: `${reporte.resumen.porcentajeMargen.toFixed(1)}% de margen`,
            color: margenPositivo ? [22, 163, 74] : [220, 38, 38],
          },
        ];

        items.forEach((item, i) => {
          const x = MARGIN + i * (anchoCard + gap);
          doc.setDrawColor(...gris200);
          doc.setFillColor(...gris50);
          doc.roundedRect(x, y, anchoCard, altoCard, 1.5, 1.5, "FD");

          doc.setFont("helvetica", "bold");
          doc.setFontSize(7);
          doc.setTextColor(...gris500);
          doc.text(item.label, x + 4, y + 6.5);

          doc.setFont("helvetica", "bold");
          doc.setFontSize(13);
          doc.setTextColor(...item.color);
          doc.text(item.valor, x + 4, y + 14);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(...gris500);
          doc.text(item.caption, x + 4, y + 19.5);
        });

        doc.setTextColor(0, 0, 0);
        return y + altoCard;
      };

      const opcionesTabla = {
        margin: { left: MARGIN, right: MARGIN, top: HEADER_HEIGHT + 4 },
        styles: { fontSize: 9 },
        headStyles: { fillColor: azulPrimario },
        didDrawPage: dibujarEncabezado,
      };

      dibujarEncabezado();

      dibujarTituloSeccion("Resumen del período", 46);
      let cursorY = dibujarResumenKPIs(50) + 14;

      if (reporte.topProductos.length > 0) {
        dibujarTituloSeccion("Top productos", cursorY);
        autoTable(doc, {
          ...opcionesTabla,
          startY: cursorY + 4,
          head: [["#", "Producto", "SKU", "Unidades", "Ingresos"]],
          body: reporte.topProductos.map((p, i) => [
            i + 1,
            p.nombre,
            p.sku,
            p.unidadesVendidas,
            `$${formatPrice(p.ingresos)}`,
          ]),
        });
        cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
      }

      if (reporte.ventasPorDia.length > 0) {
        if (cursorY > pageHeight - 60) {
          doc.addPage();
          dibujarEncabezado();
          cursorY = HEADER_HEIGHT + 8;
        }
        dibujarTituloSeccion("Ventas por día", cursorY);
        autoTable(doc, {
          ...opcionesTabla,
          startY: cursorY + 4,
          head: [["Fecha", "Ventas", "Total"]],
          body: reporte.ventasPorDia.map((d) => [
            formatearFechaCorta(d.fecha),
            d.cantidadVentas,
            `$${formatPrice(d.total)}`,
          ]),
        });
        cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
      }

      if (cursorY > pageHeight - 40) {
        doc.addPage();
        dibujarEncabezado();
        cursorY = HEADER_HEIGHT + 8;
      }
      dibujarTituloSeccion("Detalle de ventas", cursorY);
      autoTable(doc, {
        ...opcionesTabla,
        startY: cursorY + 4,
        head: [["Folio", "Fecha", "Vendedor", "Método de pago", "Total"]],
        body: reporte.ventas.map((v) => [
          v.folio,
          formatearFechaHora(v.fecha),
          v.vendedor,
          v.metodoPago,
          `$${formatPrice(v.total)}`,
        ]),
        styles: { fontSize: 8 },
      });

      const totalPaginas = (
        doc as unknown as { internal: { getNumberOfPages: () => number } }
      ).internal.getNumberOfPages();
      for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...gris500);
        doc.text("RAD Bikes", MARGIN, pageHeight - 8);
        doc.text(`Página ${i} de ${totalPaginas}`, pageWidth - MARGIN, pageHeight - 8, {
          align: "right",
        });
      }

      doc.save(`reporte-ventas_${reporte.desde}_a_${reporte.hasta}.pdf`);
    } catch {
      setError("No se pudo generar el PDF");
    } finally {
      setExportando(false);
    }
  };

  const totalPages = reporte ? Math.ceil(reporte.ventas.length / PER_PAGE) || 1 : 1;
  const paginadas = reporte
    ? reporte.ventas.slice((page - 1) * PER_PAGE, page * PER_PAGE)
    : [];
  const margenPositivo = (reporte?.resumen.montoMargen ?? 0) >= 0;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 m-0">Reportes de Venta</h1>
        <button
          onClick={handleExportarPDF}
          disabled={!reporte || reporte.ventas.length === 0 || exportando}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white border-none rounded-lg px-5 py-2.5 cursor-pointer text-sm font-bold flex items-center gap-2 shadow-[0_4px_12px_rgba(37,99,235,0.3)] transition-colors"
        >
          <IconDownload size={16} />
          {exportando ? "Generando..." : "Exportar PDF"}
        </button>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap items-end">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Desde</label>
          <input
            type="date"
            value={desde}
            max={hasta}
            onChange={(e) => setDesde(e.target.value)}
            className="py-2.25 px-3 border border-gray-200 rounded-lg text-[13px] text-gray-700 outline-none bg-white focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Hasta</label>
          <input
            type="date"
            value={hasta}
            min={desde}
            max={formatearFechaInput(hoy)}
            onChange={(e) => setHasta(e.target.value)}
            className="py-2.25 px-3 border border-gray-200 rounded-lg text-[13px] text-gray-700 outline-none bg-white focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
        </div>
        {loading && reporte && (
          <span className="text-[12px] text-gray-400 pb-2.5">Actualizando…</span>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5 text-[13px] mb-6">
          <IconWarning size={16} />
          {error}
        </div>
      )}

      {!reporte ? (
        <div className="flex flex-col gap-6">
          <section>
            <div className="h-3.5 w-40 bg-gray-100 rounded mb-3 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ResumenCardSkeleton />
              <ResumenCardSkeleton />
              <ResumenCardSkeleton />
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
            <h2 className="text-sm font-bold text-gray-900 mb-3">Resumen del período</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ResumenCard
                label="Total vendido"
                Icon={Wallet}
                value={`$${formatPrice(reporte.resumen.total)}`}
                caption={`${reporte.resumen.cantidadVentas} ${reporte.resumen.cantidadVentas === 1 ? "venta" : "ventas"}`}
              />
              <ResumenCard
                label="Ventas realizadas"
                Icon={Receipt}
                value={String(reporte.resumen.cantidadVentas)}
                caption="en el rango seleccionado"
              />
              <ResumenCard
                label="Margen de ganancia"
                Icon={TrendingUp}
                value={`$${formatPrice(reporte.resumen.montoMargen)}`}
                caption={`${reporte.resumen.porcentajeMargen.toFixed(1)}% de margen`}
                valueClass={margenPositivo ? "text-green-600" : "text-red-600"}
              />
            </div>
          </section>

          <section>
            <h2 className="flex items-center gap-1.5 text-sm font-bold text-gray-900 mb-3">
              <PieChart size="xs" className="text-gray-400" />
              Análisis
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TopProductosChart productos={reporte.topProductos} />
              <VentasPorDiaChart dias={reporte.ventasPorDia} />
            </div>
          </section>

          <section>
            <h2 className="flex items-center gap-1.5 text-sm font-bold text-gray-900 mb-3">
              <Receipt size="xs" className="text-gray-400" />
              Detalle de ventas
            </h2>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {reporte.ventas.length === 0 ? (
                <p className="text-[13px] text-gray-400 p-5">
                  No hay ventas en el rango seleccionado.
                </p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className={thClass}>Folio</th>
                          <th className={thClass}>Fecha</th>
                          <th className={thClass}>Vendedor</th>
                          <th className={thClass}>Método de pago</th>
                          <th className={thRightClass}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginadas.map((v, i) => (
                          <tr
                            key={`${v.folio}-${i}`}
                            className="hover:bg-gray-50/60 transition-colors"
                          >
                            <td className={`${tdClass} font-mono text-gray-500`}>{v.folio}</td>
                            <td className={tdClass}>{formatearFechaHora(v.fecha)}</td>
                            <td className={`${tdClass} font-medium text-gray-900`}>
                              {v.vendedor}
                            </td>
                            <td className={tdClass}>{v.metodoPago}</td>
                            <td className={`${tdRightClass} font-semibold text-gray-900`}>
                              ${formatPrice(v.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <span className="text-[13px] text-gray-500 font-medium">
                      Mostrando {paginadas.length} de {reporte.ventas.length} ventas
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className={`px-3.5 py-1.5 rounded-md border border-gray-200 text-[13px] font-medium transition-colors ${
                          page === 1
                            ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
                        }`}
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className={`px-3.5 py-1.5 rounded-md border border-gray-200 text-[13px] font-medium transition-colors ${
                          page >= totalPages
                            ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
                        }`}
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
