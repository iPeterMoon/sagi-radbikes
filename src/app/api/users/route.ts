import { NextRequest, NextResponse } from "next/server";
import { createServicioUsuarios } from "@/lib/auth/factory";

const servicio = createServicioUsuarios();

export async function GET(req: NextRequest) {
    try {
        const usuarios = await servicio.obtenerTodos();
        return NextResponse.json(usuarios, { status: 200 });
    } catch (error: any) {
        console.error("Error al obtener usuarios:", error);
        return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const usuario = await servicio.crear(body);
        return NextResponse.json(usuario, { status: 201 });
    } catch (error: any) {
        console.error("Error al crear usuario:", error);
        return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 });
    }
}