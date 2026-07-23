import { NextRequest, NextResponse } from "next/server";
import { createServicioRoles } from "@/lib/auth/factory";

const servicio = createServicioRoles();

export async function GET(req: NextRequest) {
    try {
        if (req.nextUrl.searchParams.has("nombre")) {
            const nombre = req.nextUrl.searchParams.get("nombre");
            const rol = await servicio.obtenerPorNombre(nombre!);
            if (!rol) {
                return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 });
            }
            return NextResponse.json(rol, { status: 200 });
        }
        const roles = await servicio.obtenerTodos();
        return NextResponse.json(roles, { status: 200 });
    } catch (error: any) {
        console.error("Error al obtener roles:", error);
        return NextResponse.json({ error: "Error al obtener roles" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const rol = await servicio.crear(body);
        return NextResponse.json(rol, { status: 201 });
    } catch (error: any) {
        console.error("Error al crear rol:", error);
        return NextResponse.json({ error: "Error al crear rol" }, { status: 500 });
    }
}