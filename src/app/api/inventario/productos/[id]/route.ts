import { NextRequest, NextResponse } from "next/server";
import { createServicioCatalogo } from "@/lib/inventory/factory";
import { PrismaFactory } from "@/lib/PrismaFactory";
import { ActualizarProductoDTO } from "@/types/dtos";

const servicio = createServicioCatalogo();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const producto = await servicio.obtenerProductoPorId(id);

    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(producto, { status: 200 });
  } catch (error: any) {
    console.error("GET PRODUCTO[ID] - ERROR: ", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const dto: ActualizarProductoDTO = await req.json();
    const prisma = PrismaFactory.getCliente();

    if (dto.idMarca && isNaN(Number(dto.idMarca))) {
      const brand = await prisma.brands.findFirst({ where: { name: dto.idMarca } });
      if (!brand) throw new Error(`La ma
rca '${dto.idMarca}' no existe.`);
      dto.idMarca = brand.id.toString();
    }
    if (dto.idCategoria && isNaN(Number(dto.idCategoria))) {
      const category = await prisma.categories.findFirst({ where: { name: dto.idCategoria } });
      if (!category) throw new Error(`La categoría '${dto.idCategoria}' no existe.`);
      dto.idCategoria = category.id.toString();
    }
    if (dto.idSubCategoria && isNaN(Number(dto.idSubCategoria))) {
      const subcategory = await prisma.subcategory.findFirst({ where: { name: dto.idSubCategoria } });
      if (!subcategory) throw new Error(`La subcategoría '${dto.idSubCategoria}' no existe.`);
      dto.idSubCategoria = subcategory.id.toString();
    }

    dto.idProducto = id;

    const producto = await servicio.actualizarProducto(dto);
    return NextResponse.json(producto, { status: 200 });
  } catch (error: any) {
    console.error("PUT PRODUCTO[ID] - ERROR: ", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    await servicio.eliminarProducto(id);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("DELETE PRODUCTO[ID] - ERROR: ", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;

    const body = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Se requiere el id del producto" }, { status: 400 });
    }

    let result = false;

    if (body.action === 'toggleStatus') {
      result = await servicio.actualizarEstado(id);
      return NextResponse.json({ success: result }, { status: 200 });
    }

    if (body.action === 'adjustStock') {
      result = await servicio.ajustarStock(id, body.cantidad);
      return NextResponse.json({ success: result }, { status: 200 });
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error: any) {
    console.error("PATCH PRODUCTOS[ID] - ERROR: ", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
