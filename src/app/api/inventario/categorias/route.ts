import { NextRequest, NextResponse } from "next/server";
import { createServicioCatalogo } from "@/lib/inventory/factory";

const servicio = createServicioCatalogo();

export async function GET(req: NextRequest) {
  try {
    const categorias = await servicio.obtenerCategorias();
    return NextResponse.json(categorias, { status: 200 });
  } catch (error: any) {
    console.error("GET CATEGORIAS - ERROR: ",error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const categoria = await servicio.crearCategoria(body);
    return NextResponse.json(categoria, { status: 201 });
  } catch (error: any) {
    console.error("POST CATEGORIAS - ERROR: ", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
