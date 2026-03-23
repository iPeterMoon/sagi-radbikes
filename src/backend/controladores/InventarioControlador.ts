import { NextRequest, NextResponse } from "next/server";
import { IServicioInventario } from "../negocio/interfaces/IServicioInventario";
import { ServicioInventario } from "../negocio/ServicioInventario";
import { AccesoDatos } from "../datos/AccesoDatos";
import { CrearProductoDTO, ActualizarProductoDTO, FiltroProductoDTO } from "../negocio/DTOsEntrada/ProductoDTOs";

const accesoDatos: IServicioInventario = new ServicioInventario(new AccesoDatos());

export async function obtenerProductos(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filtro: FiltroProductoDTO = {
      busqueda: searchParams.get("busqueda") || "",
      idCategoria: searchParams.get("idCategoria") || "",
      idMarca: searchParams.get("idMarca") || "",
      estadoStock: searchParams.get("estadoStock") || "",
      idSubCategoria: searchParams.get("idSubCategoria") || "",
      precioMin: Number(searchParams.get("precioMin")) || 0,
      precioMax: Number(searchParams.get("precioMax")) || 0,
    };
    const productos = await accesoDatos.obtenerProductos(filtro);
    return NextResponse.json(productos);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function obtenerPorId(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const producto = await accesoDatos.obtenerProductoPorId(params.id);
    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }
    return NextResponse.json(producto);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function crearProducto(req: NextRequest) {
  try {
    const dto: CrearProductoDTO = await req.json();
    const producto = await accesoDatos.crearProducto(dto);
    return NextResponse.json(producto, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function actualizarProducto(req: NextRequest) {
  try {
    const dto: ActualizarProductoDTO = await req.json();
    const producto = await accesoDatos.actualizarProducto(dto);
    return NextResponse.json(producto);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function eliminarProducto(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await accesoDatos.eliminarProducto(params.id);
    return NextResponse.json({ success: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function ajustarStock(req: NextRequest) {
  try {
    const { id, cantidad } = await req.json();
    const result = await accesoDatos.ajustarStock(id, cantidad);
    return NextResponse.json({ success: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function obtenerCategorias() {
  try {
    const categorias = await accesoDatos.obtenerCategorias();
    return NextResponse.json(categorias);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function obtenerMarcas() {
  try {
    const marcas = await accesoDatos.obtenerMarcas();
    return NextResponse.json(marcas);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function obtenerSubCategorias(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idCategoria = searchParams.get("idCategoria");
    const subCategorias = idCategoria
      ? await accesoDatos.obtenerSubCategoriasPorCategoria(idCategoria)
      : await accesoDatos.obtenerSubCategorias();
    return NextResponse.json(subCategorias);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function agregarImagenes(req: NextRequest) {
  try {
    const { idProducto, archivos } = await req.json();
    await accesoDatos.agregarImagenes(idProducto, archivos);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function eliminarImagen(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await accesoDatos.eliminarImagen(params.id);
    return NextResponse.json({ success: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function obtenerEtiquetas(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const etiquetas = await accesoDatos.obtenerEtiquetas(params.id);
    return NextResponse.json(etiquetas);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function crearEtiqueta(req: NextRequest) {
  try {
    const { etiqueta, idProducto } = await req.json();
    const nuevaEtiqueta = await accesoDatos.crearEtiqueta(etiqueta, idProducto);
    return NextResponse.json(nuevaEtiqueta, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function eliminarEtiqueta(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await accesoDatos.eliminarEtiqueta(params.id);
    return NextResponse.json({ success: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}