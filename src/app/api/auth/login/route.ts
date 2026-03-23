import { NextRequest } from "next/server";
import { AccesoDatos } from "../../../../backend/datos/AccesoDatos";
import { ServicioInicioSesion } from "../../../../backend/negocio/ServicioInicioSesion";
import { SesionControlador } from "../../../../backend/controladores/SesionControlador";

const accesoDatos = new AccesoDatos();
const servicio = new ServicioInicioSesion(accesoDatos);
const controlador = new SesionControlador(servicio);

export async function POST(req: NextRequest) {
  return await controlador.iniciarSesion(req);
}
