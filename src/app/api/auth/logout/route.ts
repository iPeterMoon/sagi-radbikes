import { NextRequest, NextResponse } from "next/server";
import { createServicioInicioSesion } from "@/lib/auth/factory";

const servicio = createServicioInicioSesion();

export async function POST(req: NextRequest) {
  try{
    const token = 
      req.headers.get("authorization")?.replace("Bearer ", "") ||
      req.cookies.get("token")?.value;

    if (token) {
      await servicio.cerrarSesion(token);
    }

    const response = NextResponse.json({message: "Logout exitoso" });
    response.cookies.delete("token");
    return response;
  } catch (error: any){
    console.error("CERRAR SESION - ERROR: ", error);
    return NextResponse.json({error: error.message }, { status: 500 });
  }

}
