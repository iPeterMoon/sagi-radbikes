import { NextRequest, NextResponse } from "next/server";

/**
 * Manejador para la ruta GET /api/inventario/marcas. Recibe una solicitud GET y devuelve una lista de marcas. 
 * Maneja posibles errores y devuelve una respuesta con el mensaje de error y el estado correspondiente en caso 
 * de que ocurra un error. Si la operación es exitosa, devuelve un mensaje de confirmación.
 */
export async function GET() {
  try {
    const res = await fetch(`${process.env.CATALOG_SERVICE_URL}/marcas`);
    return new NextResponse(await res.text(), { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

/**
 * Manejador para la ruta POST /api/inventario/marcas. Recibe una solicitud POST con los datos de la nueva marca y 
 * la envía al servicio de catálogos. Maneja posibles errores y devuelve una respuesta con el mensaje de error y el estado correspondiente en caso de que ocurra un error.
 * Si la operación es exitosa, devuelve un mensaje de confirmación.
 */
export async function POST(req: NextRequest) {
  try {
    const res = await fetch(`${process.env.CATALOG_SERVICE_URL}/marcas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: await req.text(),
    });
    return new NextResponse(await res.text(), { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
