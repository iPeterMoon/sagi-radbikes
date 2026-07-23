import { NextRequest, NextResponse } from "next/server";
import { createServicioCatalogo } from "@/lib/inventory/factory";

const servicio = createServicioCatalogo();

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await servicio.eliminarImagen(id);
    return NextResponse.json({ success: result }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
