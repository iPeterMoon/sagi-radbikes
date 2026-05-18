import { NextRequest, NextResponse } from "next/server";
import { proxyWithAuth } from "../../../utils/authProxy";

/**
 * Manejador para la ruta GET /api/inventario/etiquetas. Recibe una solicitud GET con el ID del producto en los parámetros de la ruta,
 * envía una solicitud al servicio de catálogos para obtener las etiquetas asociadas a ese producto y devuelve la respuesta con los
 * datos de las etiquetas.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productoId: string }> },
) {
  const { productoId } = await params;
  return proxyWithAuth(
    req,
    `${process.env.CATALOG_SERVICE_URL}/etiquetas/${productoId}`,
    "GET",
  );
}

/**
 * Manejador para la ruta POST /api/inventario/etiquetas. Recibe una solicitud POST con los datos de la nueva etiqueta y
 * la envía al servicio de catálogos.
 */
export async function POST(req: NextRequest) {
  const body = await req.arrayBuffer();
  return proxyWithAuth(
    req,
    `${process.env.CATALOG_SERVICE_URL}/etiquetas`,
    "POST",
    body || undefined,
  );
}

/**
 * Manejador para la ruta DELETE /api/inventario/etiquetas. Recibe una solicitud DELETE con el ID del producto en los parámetros de la ruta,
 * envía una solicitud al servicio de catálogos para eliminar las etiquetas asociadas a ese producto y devuelve la respuesta
 * con el resultado de la operación.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productoId: string }> },
) {
  const { productoId } = await params;
  return proxyWithAuth(
    req,
    `${process.env.CATALOG_SERVICE_URL}/etiquetas/${productoId}`,
    "DELETE",
  );
}
