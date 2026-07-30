import { NextRequest, NextResponse } from "next/server";
import { createServicioUsuarios } from "@/lib/auth/factory";

const servicio = createServicioUsuarios();

export async function GET(req: NextRequest, { params }: { params: Promise<{ usuarioId: string }> }) {
    try {
        const usuarioId = (await params).usuarioId;
        const usuario = await servicio.obtenerPorId(usuarioId);
        return NextResponse.json(usuario, { status: 200 });
    } catch (error: any) {
        console.error("Error al obtener usuario:", error);
        return NextResponse.json({ error: "Error al obtener usuario" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ usuarioId: string }> }) {
    try {
        const body = await req.json();
        const usuarioId = (await params).usuarioId;
        const usuarioActualizado = await servicio.actualizar(BigInt(usuarioId), body);
        return NextResponse.json(usuarioActualizado, { status: 200 });
    } catch (error: any) {
        console.error("Error al actualizar usuario:", error);
        return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ usuarioId: string }> }) {
    try {
        const usuarioId = (await params).usuarioId;
        const exito = await servicio.eliminar(BigInt(usuarioId));
        return NextResponse.json({ success: exito }, { status: 200 });
    } catch (error: any) {
        console.error("Error al eliminar usuario:", error);
        return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest,{ params}: { params: Promise<{ id: string}>}) {
    try {
        const { id } = await params;
        
        const exito = await servicio.alternarActivo(BigInt(id));
        return NextResponse.json({ success: exito }, { status: 200 });
    } catch (error: any) {
        console.error("Error al alternar estado de usuario:", error);
        return NextResponse.json({ error: "Error al alternar estado de usuario" }, { status: 500 });
    }
}