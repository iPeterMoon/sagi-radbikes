import { NextResponse } from "next/server";
import { obtenerCategorias } from "@/backend/controladores/InventarioControlador";

export async function GET() {
  try {
    const categorias = await obtenerCategorias();
    return NextResponse.json(categorias);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
