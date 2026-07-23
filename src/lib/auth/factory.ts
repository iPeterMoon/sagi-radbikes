import { IServicioInicioSesion } from "./negocio/interfaces/IServicioInicioSesion";
import { IAuthAccesoDatos } from "./datos/IAuthAccesoDatos";
import { ServicioInicioSesion } from "./negocio/ServicioInicioSesion";
import { AuthAccesoDatos } from "./datos/AuthAccesoDatos";
import { IServicioUsuarios } from "./negocio/interfaces/IServicioUsuarios";
import { ServicioUsuarios } from "./negocio/ServicioUsuarios";
import { IServicioRoles } from "./negocio/interfaces/IServicioRoles";
import { ServicioRoles } from "./negocio/ServicioRoles";

export function createServicioInicioSesion(
): IServicioInicioSesion {
    return new ServicioInicioSesion(createAccesoDatos());
}

export function createServicioUsuarios(
): IServicioUsuarios {
    return new ServicioUsuarios(createAccesoDatos());
}

export function createServicioRoles(): IServicioRoles {
    return new ServicioRoles(createAccesoDatos());
}

const createAccesoDatos = (): IAuthAccesoDatos => {
    return new AuthAccesoDatos();
}
