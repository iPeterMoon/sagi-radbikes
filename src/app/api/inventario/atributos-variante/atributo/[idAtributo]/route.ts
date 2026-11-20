import { NextRequest, NextResponse } from "next/server";
import { createServicioCatalogo } from "@/lib/inventory/factory";

const servicio = createServicioCatalogo();

/**
 * Elimina un atributo por su ID.
 * Ruta separada de `GET /atributos-variante/{variantId}` porque el parámetro
 * de la ruta de lectura es la variante, no el atributo.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ idAtributo: string }> },
) {
  try {
    const idAtributo = (await params).idAtributo;
    await servicio.eliminarAtributoVariante(idAtributo);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("DELETE ATRIBUTOS-VARIANTE[IDATRIBUTO] - ERROR: ", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
