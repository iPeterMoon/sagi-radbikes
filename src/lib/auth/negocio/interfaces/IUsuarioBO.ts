import { LoginDTO } from "../DTOsEntrada/LoginDTO";
import { UsuarioDTO } from "../DTOsSalida/UsuarioDTO";
import { NuevoUsuarioDTO } from "../DTOsEntrada/NuevoUsuarioDTO";
import { ActualizarUsuarioDTO } from "../DTOsEntrada/ActualizarUsuarioDTO";
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

  /**
   * Recupera todos los usuarios registrados en el sistema.
   *
   * @returns Una promesa que resuelve a un arreglo con los DTOs de todos los usuarios.
   */
  obtenerTodos(): Promise<UsuarioDTO[]>;

  /**
   * Busca un usuario específico mediante su identificador único.
   *
   * @param id El identificador único del usuario en formato string.
   * @returns Una promesa que resuelve al DTO del usuario encontrado o nulo si no existe.
   */
  obtenerPorId(id: string): Promise<UsuarioDTO | null>;

  /**
   * Crea un nuevo usuario en el sistema con la contraseña proporcionada.
   * @param nuevoUsuario DTO con los datos del nuevo usuario a crear
   * @returns UsuarioDTO del usuario recién creado
   * @throws Error si el username o email ya existen en el sistema
   */
  crear(nuevoUsuario: NuevoUsuarioDTO): Promise<UsuarioDTO>;

  /**
   * Actualiza los datos de un usuario existente.
   * @param id Id del usuario a actualizar.
   * @param usuario DTO con los datos actualizados del usuario
   * @returns UsuarioDTO del usuario actualizado
   * @throws Error si el usuario no existe o si hay conflictos con username/email
   */
  actualizar(id: number | bigint, usuario: ActualizarUsuarioDTO): Promise<UsuarioDTO>;

  /**
   * Elimina un usuario del sistema.
   * @param id id del usuario a eliminar
   * @returns Promise<boolean> indicando si la operación fue exitosa
   */
  eliminar(id: number | bigint): Promise<boolean>;

  /**
   * Alterna el estado de actividad de un usuario (activo/inactivo).
   * @param id Id del usuario a alternar su estado de actividad
   * @returns true si se pudo alternar false si no
   */
  alternarActivo(id: number | bigint): Promise<boolean>;

}
