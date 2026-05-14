import { NextRequest } from "next/server";

/**
 * Manejador para la ruta POST /api/inventario/productos/[id]/imagenes. Recibe una solicitud POST 
 * con el ID del producto en los parámetros de la ruta y los datos de la imagen en el cuerpo de la solicitud,
 * envía una solicitud al servicio de catálogos para agregar la imagen al producto correspondiente y devuelve 
 * la respuesta con el resultado de la operación.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const targetUrl = `${process.env.CATALOG_SERVICE_URL}/productos/${id}/imagenes`;
  const body = await req.formData();

  const headers = new Headers();
  const token = req.cookies.get("token")?.value || req.headers.get("authorization")?.replace("Bearer ", "");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(targetUrl, {
    method: "POST",
    headers,
    body,
    cache: "no-store",
  });

  const resHeaders: HeadersInit = {};
  const resContentType = res.headers.get("content-type");
  if (resContentType) resHeaders["Content-Type"] = resContentType;

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: resHeaders,
  });
}
