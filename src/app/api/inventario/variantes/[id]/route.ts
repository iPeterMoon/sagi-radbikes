import { NextRequest, NextResponse } from "next/server";
import { createServicioCatalogo } from "@/lib/inventory/factory";
import { ActualizarVarianteDTO } from "@/types/dtos";

const servicio = createServicioCatalogo();

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const dto: ActualizarVarianteDTO = await req.json();
    dto.idVariante = id;

    const variante = await servicio.actualizarVariante(dto);
    return NextResponse.json(variante, { status: 200 });
  } catch (error: any) {
    console.error("PUT VARIANTES[ID] - ERROR: ", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    await servicio.eliminarVariante(id);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("DELETE VARIANTES[ID] - ERROR: ", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Se requiere el id de la variante" }, { status: 400 });
    }

    let result = false;

    if (body.action === 'toggleStatus') {
      result = await servicio.actualizarEstadoVariante(id);
      return NextResponse.json({ success: result }, { status: 200 });
    }

    if (body.action === 'adjustStock') {
      if (typeof body.cantidad !== 'number' || !Number.isFinite(body.cantidad) || body.cantidad === 0) {
        return NextResponse.json({ error: "La cantidad a ajustar debe ser un número distinto de cero" }, { status: 400 });
      }

      result = await servicio.ajustarStockVariante(id, body.cantidad);
      if (!result) {
        return NextResponse.json({ error: "No hay stock suficiente para restar esa cantidad" }, { status: 409 });
      }
      return NextResponse.json({ success: result }, { status: 200 });
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error: any) {
    console.error("PATCH VARIANTES[ID] - ERROR: ", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
