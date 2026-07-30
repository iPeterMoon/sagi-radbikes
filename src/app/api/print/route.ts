// app/api/print/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createServicioVenta } from "@/lib/pos/factory";

const servicio = createServicioVenta();

export async function POST(req: NextRequest) {
  try {
    const { folio } = await req.json();
    if (!folio) {
      return NextResponse.json({ error: "folio es requerido" }, { status: 400 });
    }

    await servicio.imprimirVenta(folio);

    return NextResponse.json({ status: "impreso" }, { status: 200 });
  } catch (error: any) {
    console.error("[POST /api/print] Error:", error);
    const status = error.message === "VENTA_NO_ENCONTRADA" ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}