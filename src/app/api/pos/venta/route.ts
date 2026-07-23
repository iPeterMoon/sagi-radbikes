import { NextRequest, NextResponse } from "next/server";
import { createServicioVenta } from "@/lib/pos/factory";

const servicio = createServicioVenta();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const resultado = await servicio.registrarVenta(body);
    return NextResponse.json(resultado, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/pos/venta] Error:", error);
    return NextResponse.json(
      { error: error.message, detalles: error.detalles ?? null },
      { status: error.message === "STOCK_INSUFICIENTE" ? 409 : 500 },
    );
  }
}
