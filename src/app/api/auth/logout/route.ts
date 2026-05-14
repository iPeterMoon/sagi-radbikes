import { NextRequest, NextResponse } from "next/server";

/**
 * Manejador para la ruta POST /api/auth/logout. Envía una solicitud al servicio de autenticación para cerrar la sesión del usuario,
 * invalida el token JWT y elimina la cookie de sesión. Devuelve una respuesta con el resultado de la operación.
 * Si el cierre de sesión es exitoso, devuelve un mensaje de confirmación. Si ocurre un error, 
 * devuelve un mensaje de error con el estado correspondiente.
 */
export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const res = await fetch(`${process.env.AUTH_SERVICE_URL}/logout`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await res.text();
  const response = new NextResponse(data, { status: res.status });
  response.cookies.delete("token");
  return response;
}
