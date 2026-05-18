import { NextRequest, NextResponse } from "next/server";
import { proxyWithAuth } from "../../../utils/authProxy";

/**
 * Función auxiliar para manejar las solicitudes GET, PUT, PATCH y DELETE a la ruta /api/inventario/productos/[id].
 * Recibe la solicitud, el método HTTP y el ID del producto, envía una solicitud al servicio de catálogos con los
 * datos correspondientes y devuelve la respuesta con el resultado de la operación.
 */
async function proxyWithId(req: NextRequest, method: string, id: string) {
  const search = req.nextUrl.search;

  const hasBody = method !== "GET" && method !== "HEAD";
  let body: BodyInit | undefined = undefined;

  if (hasBody) {
    const text = await req.text();
    if (text) {
      try {
        const bodyObj = JSON.parse(text);
        bodyObj.id = id;
        body = JSON.stringify(bodyObj);
      } catch {
        body = text;
      }
    }
  }

  // PATCH, PUT go to /productos in catalog service according to backend index.ts mappings
  // Except DELETE goes to /productos/:id
  const targetUrl =
    method === "GET" || method === "DELETE"
      ? `${process.env.CATALOG_SERVICE_URL}/productos/${id}${search}`
      : `${process.env.CATALOG_SERVICE_URL}/productos${search}`;

  return proxyWithAuth(req, targetUrl, method, body);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyWithId(req, "GET", id);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyWithId(req, "PUT", id);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyWithId(req, "PATCH", id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyWithId(req, "DELETE", id);
}
