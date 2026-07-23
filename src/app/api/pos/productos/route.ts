import { NextRequest, NextResponse } from "next/server";
import { createServicioVenta } from "@/lib/pos/factory";

const servicio = createServicioVenta();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const busqueda = searchParams.get("busqueda") ?? "";
    const productos = await servicio.buscarProductos(busqueda);
    return NextResponse.json(productos, { status: 200});
  } catch(error: any) {
    console.error("GET POS/PRODUCTOS - ERROR: ", error);
    return NextResponse.json({ error: error.message }, { status: 500});
  }
}
