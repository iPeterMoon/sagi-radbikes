import { LoginDTO } from "./DTOsEntrada/LoginDTO";
import { UsuarioDTO } from "./DTOsSalida/UsuarioDTO";
import { SesionDTO } from "./DTOsSalida/SesionDTO";

export interface IServicioInicioSesion {
  iniciarSesion(loginDTO: LoginDTO): Promise<SesionDTO>;
  cerrarSesion(token: string): Promise<void>;
  validarToken(token: string): Promise<UsuarioDTO>;
}