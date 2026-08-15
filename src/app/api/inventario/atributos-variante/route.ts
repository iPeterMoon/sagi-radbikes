import { NextRequest, NextResponse } from "next/server";
import { createServicioCatalogo } from "@/lib/inventory/factory";

const servicio = createServicioCatalogo();

export async function POST(req: NextRequest) {
  try {
    const { nombre, valor, idVariante } = await req.json();
    if (!nombre || !valor || !idVariante) {
      return NextResponse.json({ error: "Se requieren nombre, valor e idVariante" }, { status: 400 });
    }
    const atributo = { nombre, valor, idVariante };
    return NextResponse.json(await servicio.crearAtributoVariante(atributo), { status: 201 });
  } catch (error: any) {
    console.error("POST ATRIBUTO-VARIANTE - ERROR: ", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
