import { IAccesoDatos } from "../datos/IAccesoDatos";
import { IServicioInicioSesion } from "./IServicioInicioSesion";
import { UsuarioBO } from "./BOs/UsuarioBO";
import { LoginDTO } from "./DTOsEntrada/LoginDTO";
import { UsuarioDTO } from "./DTOsSalida/UsuarioDTO";
import { SesionDTO } from "./DTOsSalida/SesionDTO";

export class ServicioInicioSesion implements IServicioInicioSesion {
  private readonly usuarioBO: UsuarioBO;

  constructor(accesoDatos: IAccesoDatos) {
    this.usuarioBO = new UsuarioBO(accesoDatos);
  }

  async iniciarSesion(loginDTO: LoginDTO): Promise<SesionDTO> {
    return await this.usuarioBO.login(loginDTO);
  }

  async cerrarSesion(token: string): Promise<void> {
    return await this.usuarioBO.logout(token);
  }

  async validarToken(token: string): Promise<UsuarioDTO> {
    return await this.usuarioBO.validarToken(token);
  }
}