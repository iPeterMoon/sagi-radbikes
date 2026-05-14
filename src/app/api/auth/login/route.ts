import { NextRequest, NextResponse } from "next/server";

/**
 * Manejador para la ruta POST /api/auth/login. Recibe las credenciales del usuario en el cuerpo de la solicitud,
 * las envía al servicio de autenticación y, si la autenticación es exitosa, devuelve una respuesta con el token JWT
 * en una cookie. Si la autenticación falla, devuelve un error con el mensaje correspondiente.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${process.env.AUTH_SERVICE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.text();
  const response = new NextResponse(data, { status: res.status });

  const cookie = res.headers.get("set-cookie");
  if (cookie) response.headers.set("set-cookie", cookie);
  return response;
}
