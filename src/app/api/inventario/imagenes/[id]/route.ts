import { NextRequest, NextResponse } from "next/server";
import { proxyWithAuth } from "../../../../utils/authProxy";

/**
 * Manejador para la ruta DELETE /api/inventario/imagenes/[id]. Recibe una solicitud DELETE con el ID de la imagen en los parámetros de la ruta,
 * envía una solicitud al servicio de catálogos para eliminar esa imagen y devuelve la respuesta con el resultado de la operación.
 * Si la operación es exitosa, devuelve un mensaje de confirmación. Si ocurre un error,
 * devuelve un mensaje de error con el estado correspondiente.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyWithAuth(
    req,
    `${process.env.CATALOG_SERVICE_URL}/imagenes/${id}`,
    "DELETE",
  );
}
