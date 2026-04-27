import { NextRequest, NextResponse } from "next/server";
import { IServicioInventario } from "@/backend/negocio/interfaces/IServicioInventario";
import { ServicioInventario } from "@/backend/negocio/ServicioInventario";
import { AccesoDatos } from "@/backend/datos/AccesoDatos";

const accesoDatos: IServicioInventario = new ServicioInventario(
  new AccesoDatos(),
);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await accesoDatos.establecerImagenPrincipal(id);
    return NextResponse.json({ success: result });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to set main image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
