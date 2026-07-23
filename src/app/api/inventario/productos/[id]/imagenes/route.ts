import { NextRequest, NextResponse } from "next/server";
import { createServicioCatalogo } from "@/lib/inventory/factory";

const servicio = createServicioCatalogo();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    const archivos = formData.getAll("archivos").filter((f): f is File => f instanceof File);

    if (!id) {
      return NextResponse.json({ error: "El ID del producto es requerido"}, { status: 400});
    }
    if (archivos.length === 0) {
      return NextResponse.json({ error: "No se encontraron archivos de imagen" }, { status: 400 });
    }

    const mainImageIndex = formData.get("mainImageIndex")
      ? Number(formData.get("mainImageIndex"))
      : undefined;

    await servicio.agregarImagenes(id, archivos, mainImageIndex);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
