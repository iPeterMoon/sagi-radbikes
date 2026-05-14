import { NextRequest, NextResponse } from "next/server";
/**
 * Manejador para la ruta GET /api/inventario/etiquetas. Recibe una solicitud GET con el ID del producto en los parámetros de la ruta,
 * envía una solicitud al servicio de catálogos para obtener las etiquetas asociadas a ese producto y devuelve la respuesta con los 
 * datos de las etiquetas.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ productoId: string }> },
) {
  const { productoId } = await params;
  const res = await fetch(
    `${process.env.CATALOG_SERVICE_URL}/etiquetas/${productoId}`,
  );
  return new NextResponse(await res.text(), { status: res.status });
}

/**
 * Manejador para la ruta POST /api/inventario/etiquetas. Recibe una solicitud POST con los datos de la nueva etiqueta y 
 * la envía al servicio de catálogos.
 */
export async function POST(req: NextRequest) {
  const res = await fetch(`${process.env.CATALOG_SERVICE_URL}/etiquetas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await req.text(),
  });
  return new NextResponse(await res.text(), { status: res.status });
}

/**
 * Manejador para la ruta DELETE /api/inventario/etiquetas. Recibe una solicitud DELETE con el ID del producto en los parámetros de la ruta,
 * envía una solicitud al servicio de catálogos para eliminar las etiquetas asociadas a ese producto y devuelve la respuesta 
 * con el resultado de la operación.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ productoId: string }> },
) {
  const { productoId } = await params;
  const res = await fetch(
    `${process.env.CATALOG_SERVICE_URL}/etiquetas/${productoId}`,
    { method: "DELETE" },
  );
  return new NextResponse(await res.text(), { status: res.status });
}
