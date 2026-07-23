import { NextRequest, NextResponse } from "next/server";
import { createServicioVenta } from "@/lib/pos/factory";

const servicio = createServicioVenta();

export async function GET() {
  try {
    const carrito = servicio.obtenerCarrito();
    return NextResponse.json(carrito, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    servicio.limpiarCarrito();
    return NextResponse.json({ message: "Carrito limpiado" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    servicio.agregarProductoCarrito(body);
    const carrito = servicio.obtenerCarrito();
    return NextResponse.json(carrito, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
