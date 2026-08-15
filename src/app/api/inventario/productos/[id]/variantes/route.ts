import { NextRequest, NextResponse } from "next/server";
import { createServicioCatalogo } from "@/lib/inventory/factory";
import { CrearVarianteDTO } from "@/types/dtos";

const servicio = createServicioCatalogo();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const variantes = await servicio.obtenerVariantes(id);
    return NextResponse.json(variantes, { status: 200 });
  } catch (error: any) {
    console.error("GET VARIANTES[ID] - ERROR: ", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const body: Omit<CrearVarianteDTO, "idProducto"> = await req.json();
    const dto: CrearVarianteDTO = { ...body, idProducto: id };
    const variante = await servicio.crearVariante(dto);
    return NextResponse.json(variante, { status: 201 });
  } catch (error: any) {
    console.error("POST VARIANTES[ID] - ERROR: ", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
