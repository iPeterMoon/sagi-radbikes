import { NextRequest, NextResponse } from "next/server";
import { createServicioCatalogo } from "@/lib/inventory/factory";

const servicio = createServicioCatalogo();

/**
 * Elimina una etiqueta por su ID.
 * Ruta separada de `GET /etiquetas/{productoId}` porque el parámetro de la
 * ruta de lectura es el producto, no la etiqueta.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ idEtiqueta: string }> },
) {
  try {
    const idEtiqueta = (await params).idEtiqueta;
    await servicio.eliminarEtiqueta(idEtiqueta);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("DELETE ETIQUETAS[IDETIQUETA] - ERROR: ", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
