import { NextRequest, NextResponse } from "next/server";

async function proxy(req: NextRequest, method: string) {
  // Extraemos la parte dinámica de la URL (ej. "", "/123", o "/123/imagenes")
  const urlPath = req.nextUrl.pathname.replace("/api/inventario/productos", "");
  const search = req.nextUrl.search;

  // Solo pasamos el content-type, ignoramos otros headers para no corromper la compresión (gzip)
  const headers: HeadersInit = {};
  const contentType = req.headers.get("content-type");
  if (contentType) headers["Content-Type"] = contentType;

  const hasBody = method !== "GET" && method !== "HEAD";
  // Usamos arrayBuffer para manejar tanto JSON como subidas de imágenes correctamente
  const body = hasBody ? await req.arrayBuffer() : undefined;

  const res = await fetch(
    `${process.env.CATALOG_SERVICE_URL}/productos${urlPath}${search}`,
    {
      method,
      headers,
      body,
      cache: "no-store",
    },
  );

  // Retornar al cliente solo con los headers seguros
  const resHeaders: HeadersInit = {};
  const resContentType = res.headers.get("content-type");
  if (resContentType) resHeaders["Content-Type"] = resContentType;

  return new NextResponse(await res.arrayBuffer(), {
    status: res.status,
    headers: resHeaders,
  });
}

export async function GET(req: NextRequest) {
  return proxy(req, "GET");
}
export async function POST(req: NextRequest) {
  return proxy(req, "POST");
}
export async function PUT(req: NextRequest) {
  return proxy(req, "PUT");
}
export async function PATCH(req: NextRequest) {
  return proxy(req, "PATCH");
}
export async function DELETE(req: NextRequest) {
  return proxy(req, "DELETE");
}
