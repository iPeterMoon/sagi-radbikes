import { NextRequest, NextResponse } from "next/server";
import { createServicioCatalogo } from "@/lib/inventory/factory";

const servicio = createServicioCatalogo();

export async function GET(req: NextRequest) {
  try {
    const idCategoria = req.nextUrl.searchParams.get("idCategoria");

    const subcategorias = idCategoria 
      ? await servicio.obtenerSubCategoriasPorCategoria(idCategoria)
      : await servicio.obtenerSubCategorias();

    return NextResponse.json(subcategorias, { status: 200 });
  } catch (error: any) {
    console.error("GET SUBCATEGORIAS - ERROR: ",error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.nombre || !body.idCategoria) {
      return NextResponse.json({ error: "Se requiere nombre e idCategoria"}, { status: 400});
    }
    const subcategoria = await servicio.crearSubCategoria(body);
    return NextResponse.json(subcategoria, { status: 201 });
  } catch (error: any) {
    console.error("POST SUBCATEGORIAS - ERROR: ", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
