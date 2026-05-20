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
    const body = await req.arrayBuffer();
    
    // Crear headers personalizados forzando XML
    const headers: HeadersInit = {
      "Content-Type": "application/xml",
      "Accept": "application/xml",
    };

    // Incluir token de autenticación
    const token = req.cookies.get("token")?.value;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Incluir cookies
    const cookie = req.headers.get("cookie");
    if (cookie) {
      headers["Cookie"] = cookie;
    }

    // Realizar el fetch directamente al gateway/POS
    const posServiceUrl = process.env.POS_SERVICE_URL || "http://localhost:8080/pos";
    const targetUrl = `${posServiceUrl}/venta`;

    const res = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: body || undefined,
      cache: "no-store",
    });

    // Retornar respuesta preservando Content-Type XML
    const resHeaders: HeadersInit = {};
    const resContentType = res.headers.get("content-type");
    if (resContentType) {
      resHeaders["Content-Type"] = resContentType;
    } else {
      // Si no viene Content-Type, asegurar que sea XML
      resHeaders["Content-Type"] = "application/xml";
    }

    return new NextResponse(await res.arrayBuffer(), {
      status: res.status,
      headers: resHeaders,
    });
  } catch (error: any) {
    console.error("[POST /api/pos/venta] Error:", error);
    
    // Retornar error como XML
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
