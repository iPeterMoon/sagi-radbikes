import { NextRequest, NextResponse } from "next/server";
import { createServicioCatalogo } from "@/lib/inventory/factory";

const servicio = createServicioCatalogo();

export async function GET(req: NextRequest, { params }: { params: Promise<{ productoId: string }> }) {
  try {
    const productoId = (await params).productoId;
    const etiquetas = await servicio.obtenerEtiquetas(productoId);
    return NextResponse.json(etiquetas, { status: 200 });
  } catch (error: any) {
    console.error("GET ETIQUETAS[PRODUCTOID] - ERROR: ",error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// La eliminación vive en `/etiquetas/etiqueta/{idEtiqueta}` para no confundir
// el ID de producto de este GET con el ID de la etiqueta a borrar.
