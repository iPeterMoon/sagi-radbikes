import { LoginDTO } from "./DTOsEntrada/LoginDTO";
import { UsuarioDTO } from "./DTOsSalida/UsuarioDTO";
import { SesionDTO } from "./DTOsSalida/SesionDTO";

/**
 * Interfaz que define las operaciones del servicio de inicio de sesión. Esta interfaz actúa como una fachada
 * que abstrae la lógica de negocio de autenticación y gestión de sesiones, delegando en los objetos de negocio (BOs) las operaciones específicas.
 * El servicio de inicio de sesión es responsable de manejar las solicitudes de autenticación, generación de tokens JWT y validación de sesiones.
 */
export interface IServicioInicioSesion {
  /**
   * Autentica un usuario con sus credenciales.
   * @param loginDTO - DTO con username y password
   * @returns Datos de sesión con token JWT y datos del usuario
   */
  iniciarSesion(loginDTO: LoginDTO): Promise<SesionDTO>;
  /**
   * Cierra la sesión de un usuario.
   * @param token - JWT activo a invalidar
   */
  cerrarSesion(token: string): Promise<void>;
  /**
  * Verifica la validez de un token JWT y retorna los datos del usuario.
  * @param token - JWT a validar
  * @returns UsuarioDTO del usuario propietario del token
  */
  validarToken(token: string): Promise<UsuarioDTO>;
}