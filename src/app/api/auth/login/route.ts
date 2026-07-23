import { NextRequest, NextResponse } from "next/server";
import { LoginDTO } from "@/lib/api/auth";
import { createServicioInicioSesion } from "@/lib/auth/factory";

const SESSION_TIMEOUT_HOURS = Number(process.env.SESSION_TIMEOUT_HOURS || "12");
const SAFE_SESSION_TIMOUT_HOURS = 
  Number.isFinite(SESSION_TIMEOUT_HOURS) && SESSION_TIMEOUT_HOURS > 0
    ? SESSION_TIMEOUT_HOURS : 12;

const servicio = createServicioInicioSesion();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Asumiendo que iniciarSesion devuelve el token o los datos del usuario
    const sesion = await servicio.iniciarSesion(body);

    const response = NextResponse.json(sesion, { status: 200 });

    if (sesion.token) {
       response.cookies.set("token", sesion.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: SAFE_SESSION_TIMOUT_HOURS * 3600
       });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
