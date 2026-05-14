import { NextRequest, NextResponse } from "next/server";

/**
 * Función auxiliar para manejar las solicitudes GET, PUT, PATCH y DELETE a la ruta /api/inventario/productos/[id]. 
 * Recibe la solicitud, el método HTTP y el ID del producto, envía una solicitud al servicio de catálogos con los 
 * datos correspondientes y devuelve la respuesta con el resultado de la operación.
 */
async function proxyWithId(req: NextRequest, method: string, id: string) {
  const search = req.nextUrl.search;

  const headers: HeadersInit = {};
  const contentType = req.headers.get("content-type");
  if (contentType) headers["Content-Type"] = contentType;

  const hasBody = method !== "GET" && method !== "HEAD";
  let bodyStr: string | undefined = undefined;

  if (hasBody) {
    const text = await req.text();
    if (text) {
      try {
        const bodyObj = JSON.parse(text);
        bodyObj.id = id;
        bodyStr = JSON.stringify(bodyObj);
      } catch {
        bodyStr = text;
      }
    }
  }

  // PATCH, PUT go to /productos in catalog service according to backend index.ts mappings
  // Except DELETE goes to /productos/:id
  const targetUrl = method === "GET" || method === "DELETE"
    ? `${process.env.CATALOG_SERVICE_URL}/productos/${id}${search}`
    : `${process.env.CATALOG_SERVICE_URL}/productos${search}`;

  const res = await fetch(targetUrl, {
    method,
    headers,
    body: bodyStr,
    cache: "no-store",
  });

  const resHeaders: HeadersInit = {};
  const resContentType = res.headers.get("content-type");
  if (resContentType) resHeaders["Content-Type"] = resContentType;

  return new NextResponse(await res.arrayBuffer(), {
    status: res.status,
    headers: resHeaders,
  });
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
