/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { IServicioInventario } from "../negocio/interfaces/IServicioInventario";
import { ServicioInventario } from "../negocio/ServicioInventario";
import { AccesoDatos } from "../datos/AccesoDatos";
import {
  CrearProductoDTO,
  ActualizarProductoDTO,
  FiltroProductoDTO,
} from "../negocio/DTOsEntrada/ProductoDTOs";
import {
  CategoriaDTO,
  MarcaDTO,
  SubCategoriaDTO,
} from "../negocio/DTOsSalida/ProductoDTOs";
import { PrismaFactory } from "../datos/PrismaFactory";

const accesoDatos: IServicioInventario = new ServicioInventario(
  new AccesoDatos(),
);

// Parche global para serializar BigInt a JSON sin que Next.js lance error
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

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

export async function obtenerPorId(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const producto = await accesoDatos.obtenerProductoPorId(params.id);
    if (!producto) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 },
      );
    }
    return NextResponse.json(producto);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function crearProducto(req: NextRequest) {
  try {
    const dto: CrearProductoDTO = await req.json();
    const prisma = PrismaFactory.getCliente();

    // Convertir nombre de marca a ID
    if (dto.idMarca && isNaN(Number(dto.idMarca))) {
      const brand = await prisma.brands.findFirst({
        where: { name: dto.idMarca },
      });
      if (!brand) {
        throw new Error(`La marca '${dto.idMarca}' no existe.`);
      }
      dto.idMarca = brand.id.toString();
    }

    // Convertir nombre de categoría a ID
    if (dto.idCategoria && isNaN(Number(dto.idCategoria))) {
      const category = await prisma.categories.findFirst({
        where: { name: dto.idCategoria },
      });
      if (!category) {
        throw new Error(`La categoría '${dto.idCategoria}' no existe.`);
      }
      dto.idCategoria = category.id.toString();
    }

    // Convertir nombre de subcategoría a ID
    if (dto.idSubCategoria && isNaN(Number(dto.idSubCategoria))) {
      const subcategory = await prisma.subcategory.findFirst({
        where: { name: dto.idSubCategoria },
      });
      if (!subcategory) {
        throw new Error(`La subcategoría '${dto.idSubCategoria}' no existe.`);
      }
      dto.idSubCategoria = subcategory.id.toString();
    }

    const producto = await accesoDatos.crearProducto(dto);
    return NextResponse.json(producto, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function actualizarProducto(req: NextRequest) {
  try {
    const dto: ActualizarProductoDTO = await req.json();
    const prisma = PrismaFactory.getCliente();

    // Convertir nombre de marca a ID
    if (dto.idMarca && isNaN(Number(dto.idMarca))) {
      const brand = await prisma.brands.findFirst({
        where: { name: dto.idMarca },
      });
      if (!brand) {
        throw new Error(`La marca '${dto.idMarca}' no existe.`);
      }
      dto.idMarca = brand.id.toString();
    }

    // Convertir nombre de categoría a ID
    if (dto.idCategoria && isNaN(Number(dto.idCategoria))) {
      const category = await prisma.categories.findFirst({
        where: { name: dto.idCategoria },
      });
      if (!category) {
        throw new Error(`La categoría '${dto.idCategoria}' no existe.`);
      }
      dto.idCategoria = category.id.toString();
    }

    // Convertir nombre de subcategoría a ID
    if (dto.idSubCategoria && isNaN(Number(dto.idSubCategoria))) {
      const subcategory = await prisma.subcategory.findFirst({
        where: { name: dto.idSubCategoria },
      });
      if (!subcategory) {
        throw new Error(`La subcategoría '${dto.idSubCategoria}' no existe.`);
      }
      dto.idSubCategoria = subcategory.id.toString();
    }

    const producto = await accesoDatos.actualizarProducto(dto);
    return NextResponse.json(producto);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function eliminarProducto(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const result = await accesoDatos.eliminarProducto(params.id);
    return NextResponse.json({ success: result });
  } catch (error: any) {
    // Verificar si es un error de restricción de clave foránea por compras
    if (error.code === "P2014" || error.message.includes("Restrict")) {
      return NextResponse.json(
        { error: "No se puede eliminar este producto porque tiene compras asociadas. Elimina primero las compras relacionadas." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function ajustarStock(req: NextRequest) {
  try {
    const payload = await req.json();
    const id = payload.id as string;

    if (!id) {
      return NextResponse.json({ error: "Se requiere el id del producto" }, { status: 400 });
    }

    let result = false;

    if (typeof payload.cantidad === "number") {
      result = await accesoDatos.ajustarStock(id, payload.cantidad);
    } else if (payload.toggleActive) {
      result = await accesoDatos.actualizarEstado(id);
    } else {
      return NextResponse.json(
        { error: "Payload inválido para la operación PATCH" },
        { status: 400 },
      );
    }

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

export async function crearCategoria(req: NextRequest) {
  try {
    const categoria: CategoriaDTO = await req.json();
    const created = await accesoDatos.crearCategoria(categoria);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function crearMarca(req: NextRequest) {
  try {
    const marca: MarcaDTO = await req.json();
    const created = await accesoDatos.crearMarca(marca);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function crearSubCategoria(req: NextRequest) {
  try {
    const payload: { nombre: string; idCategoria: string } = await req.json();
    if (!payload.nombre || !payload.idCategoria) {
      return NextResponse.json(
        { error: "Se requiere nombre e idCategoria" },
        { status: 400 },
      );
    }
    const subCategoria: SubCategoriaDTO = {
      idSubCategoria: "",
      nombre: payload.nombre,
      idCategoria: payload.idCategoria,
    };
    const created = await accesoDatos.crearSubCategoria(subCategoria);
    return NextResponse.json(created, { status: 201 });
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

export async function agregarImagenes(
  req: NextRequest,
  { params }: { params?: { idProducto?: string } } = {},
) {
  try {
    let idProducto = params?.idProducto || "";
    let archivos: File[] = [];

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const idFromBody = formData.get("idProducto");
      if (typeof idFromBody === "string" && idFromBody.trim()) {
        idProducto = idFromBody;
      }
      const archivoEntries = formData.getAll("archivos");
      archivos = archivoEntries.filter((item): item is File => item instanceof File);
    } else {
      const body = await req.json();
      if (!idProducto && body?.idProducto) {
        idProducto = body.idProducto;
      }
      archivos = body?.archivos || [];
    }

    if (!idProducto) {
      throw new Error("idProducto es requerido");
    }
    if (!archivos || archivos.length === 0) {
      throw new Error("No se encontraron archivos para subir");
    }

    await accesoDatos.agregarImagenes(idProducto, archivos);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function eliminarImagen(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const result = await accesoDatos.eliminarImagen(params.id);
    return NextResponse.json({ success: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function obtenerEtiquetas(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
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

export async function eliminarEtiqueta(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const result = await accesoDatos.eliminarEtiqueta(params.id);
    return NextResponse.json({ success: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
