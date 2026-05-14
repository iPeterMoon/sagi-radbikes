import { LoginDTO } from "../DTOsEntrada/LoginDTO";
import { UsuarioDTO } from "../DTOsSalida/UsuarioDTO";
import { SesionDTO } from "../DTOsSalida/SesionDTO";

/**
 * Interfaz que define las operaciones de lógica de negocio para la gestión de usuarios.
 * Maneja autenticación, generación de JWT y validación de tokens.
 */
export interface IUsuarioBO {
  /**
   * Autentica un usuario y genera un JWT de sesión.
   * @param loginDTO - Credenciales de acceso (username, password)
   * @returns Objeto de sesión con token JWT, datos del usuario y fecha de expiración
   * @throws Error si el usuario no existe o la contraseña no coincide
   */
  login(loginDTO: LoginDTO): Promise<SesionDTO>;

  /**
   * Cierra la sesión de un usuario.
   * En una implementación completa debería invalidar el token en una blacklist.
   * Por ahora el cliente es responsable de descartar el token.
   * @param token - JWT de la sesión activa
   */
  logout(token: string): Promise<void>;

  /**
   * Verifica que un JWT sea válido y retorna los datos del usuario asociado.
   * @param token - JWT a verificar
   * @returns UsuarioDTO del usuario propietario del token
   * @throws Error si el token es inválido, expirado o el usuario no existe
   */
  validarToken(token: string): Promise<UsuarioDTO>;
}
