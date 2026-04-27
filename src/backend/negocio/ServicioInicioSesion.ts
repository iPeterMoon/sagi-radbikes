import { IAccesoDatos } from "../datos/IAccesoDatos";
import { IServicioInicioSesion } from "./IServicioInicioSesion";
import { UsuarioBO } from "./BOs/UsuarioBO";
import { LoginDTO } from "./DTOsEntrada/LoginDTO";
import { UsuarioDTO } from "./DTOsSalida/UsuarioDTO";
import { SesionDTO } from "./DTOsSalida/SesionDTO";

/**
 * Servicio de inicio de sesión.
 * Actua como fachada delegando en {@link UsuarioBO} las operaciones de autenticación.
 */
export class ServicioInicioSesion implements IServicioInicioSesion {
  private readonly usuarioBO: UsuarioBO;

  constructor(accesoDatos: IAccesoDatos) {
    this.usuarioBO = new UsuarioBO(accesoDatos);
  }

  /**
   * Autentica un usuario con sus credenciales.
   * @param loginDTO - DTO con username y password
   * @returns Datos de sesión con token JWT y datos del usuario
   */
  async iniciarSesion(loginDTO: LoginDTO): Promise<SesionDTO> {
    return await this.usuarioBO.login(loginDTO);
  }

  /**
   * Cierra la sesión de un usuario.
   * @param token - JWT activo a invalidar
   */
  async cerrarSesion(token: string): Promise<void> {
    return await this.usuarioBO.logout(token);
  }

  /**
   * Verifica la validez de un token JWT y retorna los datos del usuario.
   * @param token - JWT a validar
   * @returns UsuarioDTO del usuario propietario del token
   */
  async validarToken(token: string): Promise<UsuarioDTO> {
    return await this.usuarioBO.validarToken(token);
  }
}