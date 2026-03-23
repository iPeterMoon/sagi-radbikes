import { NextRequest, NextResponse } from "next/server";
import {
  obtenerProductos,
  obtenerPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  ajustarStock,
  obtenerCategorias,
  obtenerMarcas,
  obtenerSubCategorias,
  agregarImagenes,
  eliminarImagen,
  obtenerEtiquetas,
  crearEtiqueta,
  eliminarEtiqueta,
} from "@/backend/controladores/InventarioControlador";

export const GET = obtenerProductos;
export const POST = crearProducto;
export const PUT = actualizarProducto;
export const PATCH = ajustarStock;
