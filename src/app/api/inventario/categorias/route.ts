import { NextRequest, NextResponse } from "next/server";

/**
 * Manejador para la ruta GET /api/inventario/categorias. Recibe una solicitud GET y devuelve una lista de categorías.
 */
export async function GET() {
  try {
    const res = await fetch(`${process.env.CATALOG_SERVICE_URL}/categorias`);
    return new NextResponse(await res.text(), { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
/**
 * Manejador para la ruta POST /api/inventario/categorias. Recibe una solicitud POST con los datos de la nueva categoría y 
 * la envía al servicio de catálogos.
 */
export async function POST(req: NextRequest) {
  try {
    const res = await fetch(`${process.env.CATALOG_SERVICE_URL}/categorias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: await req.text(),
    });
    return new NextResponse(await res.text(), { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
