import { NextRequest, NextResponse } from "next/server";
import { proxyWithAuth } from "../../utils/authProxy";

/**
 * Manejador para la ruta GET /api/inventario/marcas. Recibe una solicitud GET y devuelve una lista de marcas.
 */
export async function GET(req: NextRequest) {
  return proxyWithAuth(req, `${process.env.CATALOG_SERVICE_URL}/marcas`, "GET");
}

/**
 * Manejador para la ruta POST /api/inventario/marcas. Recibe una solicitud POST con los datos de la nueva marca y
 * la envía al servicio de catálogos.
 */
export async function POST(req: NextRequest) {
  const body = await req.arrayBuffer();
  return proxyWithAuth(
    req,
    `${process.env.CATALOG_SERVICE_URL}/marcas`,
    "POST",
    body || undefined,
  );
}
