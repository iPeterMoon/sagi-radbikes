import { IServicioInicioSesion } from "../negocio/IServicioInicioSesion";
import { LoginDTO } from "../negocio/DTOsEntrada/LoginDTO";
import { NextRequest, NextResponse } from "next/server";

export class SesionControlador {
  private servicio: IServicioInicioSesion;

  constructor(servicio: IServicioInicioSesion) {
    this.servicio = servicio;
  }

  async iniciarSesion(req: NextRequest): Promise<NextResponse> {
    try {
      const dto: LoginDTO = await req.json();
      const sesion = await this.servicio.iniciarSesion(dto);
      return NextResponse.json(sesion);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
  }

  async cerrarSesion(req: NextRequest): Promise<NextResponse> {
    try {
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        await this.servicio.cerrarSesion(token);
      }
      return NextResponse.json({ message: "Logout exitoso" });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  async validar(req: NextRequest): Promise<NextResponse> {
    try {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return NextResponse.json({ error: "No token provided" }, { status: 401 });
      }
      const token = authHeader.replace("Bearer ", "");
      const usuario = await this.servicio.validarToken(token);
      return NextResponse.json(usuario);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
  }
}