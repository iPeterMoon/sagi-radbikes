import { NextRequest, NextResponse } from "next/server";
import { createServicioCatalogo } from "@/lib/inventory/factory";
import {
  FiltroProductoDTO,
  CrearProductoDTO
} from "@/types/dtos";
import { PrismaFactory } from "@/lib/PrismaFactory";

const servicio = createServicioCatalogo();

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const filtro: FiltroProductoDTO = {
      busqueda: searchParams.get("busqueda") ?? "",
      idCategoria: searchParams.get("idCategoria") ?? "",
      idMarca: searchParams.get("idMarca") || "",
      estadoStock: searchParams.get("estadoStock") ?? "",
      idSubCategoria: searchParams.get("idSubCategoria") ?? "",
      precioMin: Number(searchParams.get("precioMin")) || 0,
      precioMax: Number(searchParams.get("precioMax")) || 0,
    };

    const productos = await servicio.obtenerProductos(filtro);
    return NextResponse.json(productos, { status: 200 });
  } catch (error: any) {
    console.error("GET PRODUCTOS - ERROR: ", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const dto: CrearProductoDTO = await req.json();
    const prisma = PrismaFactory.getCliente();
    if (dto.idMarca && isNaN(Number(dto.idMarca))) {
      const brand = await prisma.brands.findFirst({ where: { name: dto.idMarca } });
      if (!brand) throw new Error(`La marca '${dto.idMarca}' no existe.`);
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

    const producto = await servicio.crearProducto(dto);
    return NextResponse.json(producto, { status: 201 });
  } catch (error: any) {
    console.error("POST PRODUCTOS - ERROR: ", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
