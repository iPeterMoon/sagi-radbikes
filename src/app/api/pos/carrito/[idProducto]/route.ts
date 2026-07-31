import { NextRequest, NextResponse } from "next/server";
import { createServicioVenta } from "@/lib/pos/factory";

type Params = { params: Promise<{ idProducto: string }> };

const servicio = createServicioVenta();

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { idProducto } = await params;
    const body = await req.json();
    await servicio.cambiarCantidad(idProducto, body.cantidad);
    const carrito = servicio.obtenerCarrito();
    return NextResponse.json(carrito, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { idProducto } = await params;
    servicio.eliminarProductoCarrito(idProducto);
    const carrito = servicio.obtenerCarrito();
    return NextResponse.json(carrito, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
