import { NextRequest, NextResponse } from "next/server";
import { createServicioRoles } from "@/lib/auth/factory";

const servicio = createServicioRoles();

export async function GET(req: NextRequest) {
    try {
        const rol = await servicio.obtenerPorId(req.nextUrl.pathname.split("/").pop()!);
        if (!rol) {
            return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 });
        }
        return NextResponse.json(rol, { status: 200 });
    } catch (error: any) {
        console.error("Error al obtener rol:", error);
        return NextResponse.json({ error: "Error al obtener rol" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const id = req.nextUrl.pathname.split("/").pop()!;
        const body = await req.json();
        const rol = await servicio.actualizar(id, body);
        return NextResponse.json(rol, { status: 200 });
    } catch (error: any) {
        console.error("Error al actualizar rol:", error);
        return NextResponse.json({ error: "Error al actualizar rol" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const id = req.nextUrl.pathname.split("/").pop()!;
        const resultado = await servicio.eliminar(id);
        if (!resultado) {
            return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 });
        }
        return NextResponse.json({ message: "Rol eliminado exitosamente" }, { status: 200 });
    } catch (error: any) {
        console.error("Error al eliminar rol:", error);
        return NextResponse.json({ error: "Error al eliminar rol" }, { status: 500 });
    }
    
}