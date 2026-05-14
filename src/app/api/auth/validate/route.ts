import { NextRequest, NextResponse } from "next/server";

/**
 * Manejador para la ruta GET /api/auth/validate. Recibe el token JWT en el encabezado de autorización o en una cookie,
 * lo envía al servicio de autenticación y devuelve una respuesta con el resultado de la validación.
 */
async function validate(req: NextRequest) {
  const token =
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    req.cookies.get("token")?.value;

  const res = await fetch(`${process.env.AUTH_SERVICE_URL}/validate`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await res.text();
  return new NextResponse(data, { status: res.status });
}
/**
 * Manejadores para las rutas POST y GET /api/auth/validate. Ambos métodos permiten validar el token JWT del usuario autenticado,
 * enviando el token al servicio de autenticación y devolviendo la respuesta con el resultado de la validación. 
 * Esto permite que tanto las solicitudes POST como GET puedan ser utilizadas para validar la sesión del usuario.
 */
export async function POST(req: NextRequest) {
  return await validate(req);
}
export async function GET(req: NextRequest) {
  return await validate(req);
}
