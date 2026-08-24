import { NextResponse } from "next/server";
import { createServicioReportes } from "@/lib/dashboard/factory";

const servicio = createServicioReportes();

export async function GET() {
  try {
    const resumen = await servicio.obtenerResumen();
    return NextResponse.json(resumen, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
