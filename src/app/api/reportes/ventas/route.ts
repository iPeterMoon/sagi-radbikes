import { NextRequest, NextResponse } from "next/server";
import { createServicioReporteVentas } from "@/lib/reportes/factory";
import { FiltroReporteVentasDTO } from "@/types/dtos";

const servicio = createServicioReporteVentas();

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const filtro: FiltroReporteVentasDTO = {
      desde: searchParams.get("desde") ?? "",
      hasta: searchParams.get("hasta") ?? "",
    };
    const reporte = await servicio.generarReporte(filtro);
    return NextResponse.json(reporte, { status: 200 });
  } catch (error: any) {
    console.error("GET REPORTE VENTAS - ERROR: ", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
