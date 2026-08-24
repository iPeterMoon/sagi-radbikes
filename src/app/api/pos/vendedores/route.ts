import { NextResponse } from "next/server";
import { createServicioUsuarios } from "@/lib/auth/factory";
import { VendedorActivoDTO } from "@/types/dtos";

const servicio = createServicioUsuarios();

/**
 * Lista liviana de usuarios activos, para el selector de "cambio rápido de
 * usuario" del Punto de Venta. Vive bajo /api/pos (no /api/users) a propósito:
 * cae bajo el módulo "pos", que todo usuario logueado tiene sin importar sus
 * roles, así que cualquiera puede ver con quién cambiar sin necesitar acceso
 * al módulo de Usuarios.
 */
export async function GET() {
  try {
    const usuarios = await servicio.obtenerTodos();
    const activos: VendedorActivoDTO[] = usuarios
      .filter((u) => u.is_active)
      .map((u) => ({
        idUsuario: u.idUsuario,
        nombre: u.nombre,
        apellido: u.apellido,
        username: u.username,
      }));
    return NextResponse.json(activos, { status: 200 });
  } catch (error: any) {
    console.error("GET VENDEDORES ACTIVOS - ERROR: ", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
