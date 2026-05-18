import { NextRequest, NextResponse } from "next/server";
import { proxyWithAuth } from "../../utils/authProxy";

/**
 * Manejador para la ruta GET /api/inventario/categorias. Recibe una solicitud GET y devuelve una lista de categorías.
 */
export async function GET(req: NextRequest) {
  return proxyWithAuth(
    req,
    `${process.env.CATALOG_SERVICE_URL}/categorias`,
    "GET",
  );
}
/**
 * Manejador para la ruta POST /api/inventario/categorias. Recibe una solicitud POST con los datos de la nueva categoría y
 * la envía al servicio de catálogos.
 */
export async function POST(req: NextRequest) {
  const body = await req.arrayBuffer();
  return proxyWithAuth(
    req,
    `${process.env.CATALOG_SERVICE_URL}/categorias`,
    "POST",
    body || undefined,
  );
}
