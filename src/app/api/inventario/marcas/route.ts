import { NextResponse } from "next/server";
import { obtenerMarcas } from "@/backend/controladores/InventarioControlador";

export async function GET() {
  try {
    const marcas = await obtenerMarcas();
    return NextResponse.json(marcas);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
