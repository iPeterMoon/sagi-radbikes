import { NextRequest, NextResponse } from "next/server";
import { proxyWithAuth } from "../../utils/authProxy";

/**
 * POST /api/pos/venta → POST :8080/pos/venta
 *
 * NUEVO FLUJO XML:
 * Recibe XML desde el cliente y lo transfiere al gateway/POS microservicio.
 * Los headers Content-Type y Accept se fuerzan a application/xml.
 * La respuesta se retorna como XML (application/xml).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    const headers: HeadersInit = {
      "Content-Type": "application/xml",
      "Accept": "application/xml",
    };

    const token = req.cookies.get("token")?.value;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const cookie = req.headers.get("cookie");
    if (cookie) {
      headers["Cookie"] = cookie;
    }

    const posServiceUrl = process.env.POS_SERVICE_URL || "http://localhost:8080/pos";
    const targetUrl = `${posServiceUrl}/venta`;

    const res = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: body || undefined,
      cache: "no-store",
    });

    const responseText = await res.text();
    const resHeaders: HeadersInit = {
      "Content-Type": res.headers.get("content-type") || "application/xml",
    };

    return new NextResponse(responseText, {
      status: res.status,
      headers: resHeaders,
    });
  } catch (error: any) {
    console.error("[POST /api/pos/venta] Error:", error);

    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<respuestaVenta estado="error" codigo="500">
  <mensaje>Error interno del servidor</mensaje>
  <detalles>${error.message || "Error desconocido"}</detalles>
</respuestaVenta>`;

    return new NextResponse(errorXml, {
      status: 500,
      headers: { "Content-Type": "application/xml" },
    });
  }
}
