import { NextRequest, NextResponse } from "next/server";

/**
 * Realiza un proxy de solicitud incluyendo las cookies de autenticación.
 * Mantiene los headers necesarios pero reenvia la cookie de token.
 *
 * @param req - Solicitud original de Next.js
 * @param targetUrl - URL del servicio backend destino
 * @param method - Método HTTP (GET, POST, PUT, etc.)
 * @param body - Cuerpo de la solicitud (opcional)
 * @returns Respuesta de Next.js con los datos del backend
 */
export async function proxyWithAuth(
  req: NextRequest,
  targetUrl: string,
  method: string,
  body?: BodyInit | null,
): Promise<NextResponse> {
  try {
    // Extraer el token de la cookie
    const token = req.cookies.get("token")?.value;

    // Preparar headers, incluyendo la autenticación
    const headers: HeadersInit = {};

    const contentType = req.headers.get("content-type");
    if (contentType) headers["Content-Type"] = contentType;

    const accept = req.headers.get("accept");
    if (accept) headers["Accept"] = accept;

    // Incluir token en header Authorization si existe
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // También incluir la cookie si es soportada
    const cookie = req.headers.get("cookie");
    if (cookie) {
      headers["Cookie"] = cookie;
    }

    const res = await fetch(targetUrl, {
      method,
      headers,
      body,
      cache: "no-store",
    });

    // Retornar respuesta del backend preservando headers importantes
    const resHeaders: HeadersInit = {};
    const resContentType = res.headers.get("content-type");
    if (resContentType) resHeaders["Content-Type"] = resContentType;

    return new NextResponse(await res.arrayBuffer(), {
      status: res.status,
      headers: resHeaders,
    });
  } catch (error: any) {
    console.error("[proxyWithAuth] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
