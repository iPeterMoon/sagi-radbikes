import { NextRequest, NextResponse } from "next/server";
import { createServicioCatalogo } from "@/lib/inventory/factory";

const servicio = createServicioCatalogo();

export async function POST(req: NextRequest) {
  try {
    const { nombre, valor, idProducto } = await req.json();
    if (!nombre || !valor || !idProducto) {
      return NextResponse.json({ error: "Se requieren nombre, valor e idProducto" }, { status: 400 });
    }
    const etiqueta = { nombre, valor, idProducto };
    return NextResponse.json(await servicio.crearEtiqueta(etiqueta), { status: 201 });
  } catch (error: any) {
    console.error("POST ETIQUETA - ERROR: ",error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
