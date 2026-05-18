import { NextRequest, NextResponse } from "next/server";
import { proxyWithAuth } from "../../utils/authProxy";

async function proxy(req: NextRequest, method: string) {
  // Extraemos la parte dinámica de la URL (ej. "", "/123", o "/123/imagenes")
  const urlPath = req.nextUrl.pathname.replace("/api/inventario/productos", "");
  const search = req.nextUrl.search;

  const hasBody = method !== "GET" && method !== "HEAD";
  // Usamos arrayBuffer para manejar tanto JSON como subidas de imágenes correctamente
  const body = hasBody ? await req.arrayBuffer() : undefined;

  return proxyWithAuth(
    req,
    `${process.env.CATALOG_SERVICE_URL}/productos${urlPath}${search}`,
    method,
    body,
  );
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
