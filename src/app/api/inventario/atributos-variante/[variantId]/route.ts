import { NextRequest, NextResponse } from "next/server";
import { createServicioCatalogo } from "@/lib/inventory/factory";

const servicio = createServicioCatalogo();

export async function GET(req: NextRequest, { params }: { params: Promise<{ variantId: string }> }) {
  try {
    const variantId = (await params).variantId;
    const atributos = await servicio.obtenerAtributosVariante(variantId);
    return NextResponse.json(atributos, { status: 200 });
  } catch (error: any) {
    console.error("GET ATRIBUTOS-VARIANTE[VARIANTID] - ERROR: ", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ variantId: string }> }) {
  try {
    const idAtributo = (await params).variantId;
    await servicio.eliminarAtributoVariante(idAtributo);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("DELETE ATRIBUTOS-VARIANTE[VARIANTID] - ERROR: ", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
