import { NextRequest, NextResponse } from "next/server";
import { createServicioConfiguracion } from "@/lib/settings/factory";
import { ActualizarConfiguracionDTO } from "@/types/dtos";

const servicio = createServicioConfiguracion();

export async function GET() {
  try {
    const configuracion = await servicio.obtener();
    return NextResponse.json(configuracion, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const dto: ActualizarConfiguracionDTO = await req.json();
    const configuracion = await servicio.actualizar(dto);
    return NextResponse.json(configuracion, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
