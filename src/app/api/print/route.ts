// app/api/print/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createServicioVenta } from "@/lib/pos/factory";

const servicio = createServicioVenta();

const ERROR_MESSAGES: Record<string, { status: number; mensaje: string }> = {
  IMPRESORA_DESCONECTADA: {
    status: 503,
    mensaje: "La impresora no está conectada. Verifica el cable USB y que esté encendida.",
  },
  IMPRESORA_TIMEOUT: {
    status: 504,
    mensaje: "La impresora no respondió. Revisa que tenga papel e inténtalo de nuevo.",
  },
  VENTA_NO_ENCONTRADA: {
    status: 404,
    mensaje: "No se encontró la venta con ese folio.",
  },
  IMPRESORA_ERROR: {
    status: 500,
    mensaje: "Ocurrió un error al imprimir. Verifica que la impresora tenga papel y esté lista.",
  }
};

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
    const conocido = ERROR_MESSAGES[error.message];
    if (conocido) {
      return NextResponse.json(
        { error: error.message, mensaje: conocido.mensaje },
        { status: conocido.status });
    }
    return NextResponse.json({ error: "IMPRESORA_ERROR", mensaje: "Ocurrió un error al imprimir el ticket." }, { status: 500 });
  }
}