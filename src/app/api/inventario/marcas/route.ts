import { NextRequest, NextResponse } from "next/server";
import { createServicioCatalogo } from "@/lib/inventory/factory";

const servicio = createServicioCatalogo();

export async function GET(req: NextRequest) {
  void req; // La firma de la ruta recibe el request, pero este GET no lo usa.
  try {
    const marcas = await servicio.obtenerMarcas();
    return NextResponse.json(marcas, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const marca = await servicio.crearMarca(body);
    return NextResponse.json(marca, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
