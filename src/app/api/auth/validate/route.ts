import { NextRequest, NextResponse } from "next/server";
import { createServicioInicioSesion } from "@/lib/auth/factory";

const servicio = createServicioInicioSesion();

export async function GET(req: NextRequest) {
  try {
    const token =
      req.headers.get("authorization")?.replace("Bearer ", "") ||
      req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const usuario = await servicio.validarToken(token);

    if (usuario) {
      return NextResponse.json(usuario, { status: 200 });
    } else {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
  } catch (error: any) {
    console.error(" VALIDAR - ERROR: ", error);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}