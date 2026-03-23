import { NextRequest, NextResponse } from "next/server";
import { obtenerSubCategorias } from "@/backend/controladores/InventarioControlador";

export async function GET(req: NextRequest) {
  try {
    const subCategorias = await obtenerSubCategorias(req);
    return NextResponse.json(subCategorias);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
