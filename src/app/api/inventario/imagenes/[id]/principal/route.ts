import { NextRequest, NextResponse } from "next/server";

/**
 * Manejador para la ruta PATCH /api/inventario/imagenes/[id]/principal. Recibe una solicitud PATCH con el ID 
 * de la imagen en los parámetros de la ruta, envía una solicitud al servicio de catálogos para establecer esa imagen 
 * como principal y devuelve la respuesta con el resultado de la operación. 
 * Si la operación es exitosa, devuelve un mensaje de confirmación. Si ocurre un error,
 * devuelve un mensaje de error con el estado correspondiente.
 */
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const res = await fetch(
    `${process.env.CATALOG_SERVICE_URL}/imagenes/${id}/principal`,
    { method: "PATCH" },
  );
  return new NextResponse(await res.text(), { status: res.status });
}
