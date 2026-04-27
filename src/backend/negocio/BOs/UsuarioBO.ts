import jwt from "jsonwebtoken";
import { IAccesoDatos } from "../../datos/IAccesoDatos";
import { IUsuarioDAO } from "../../datos/daos/interfaces/IUsuarioDAO";
import { IUsuarioRolDAO } from "../../datos/daos/interfaces/IUsuarioRolDAO";
import { LoginDTO } from "../DTOsEntrada/LoginDTO";
import { UsuarioDTO } from "../DTOsSalida/UsuarioDTO";
import { SesionDTO } from "../DTOsSalida/SesionDTO";
import { UsuarioMapper } from "../mappers/UsuarioMapper";
import { PasswordEncoder } from "../PasswordEncoder";

/** Clave secreta para firmar y verificar JWT. Configurable via JWT_SECRET. */
const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key";
/** Duración de sesión leída de SESSION_TIMEOUT_HOURS. Valor crudo puede ser inválido. */
const SESSION_TIMEOUT_HOURS = Number(process.env.SESSION_TIMEOUT_HOURS || "24");
/** Duración de sesión validada: mínimo 1 hora, default 24 h. */
const SAFE_SESSION_TIMEOUT_HOURS =
  Number.isFinite(SESSION_TIMEOUT_HOURS) && SESSION_TIMEOUT_HOURS > 0
    ? SESSION_TIMEOUT_HOURS
    : 24;
/** Expiración del JWT en segundos, alineada con el timeout de cookie. */
const TOKEN_EXPIRATION_SECONDS = SAFE_SESSION_TIMEOUT_HOURS * 60 * 60;

/**
 * Business Object de usuario.
 * Maneja autenticación, generación de JWT y validación de tokens.
 */
export class UsuarioBO {
  constructor(private accesoDatos: IAccesoDatos) {}

  /**
   * Autentica un usuario y genera un JWT de sesión.
   * @param loginDTO - Credenciales de acceso (username, password)
   * @returns Objeto de sesión con token JWT, datos del usuario y fecha de expiración
   * @throws Error si el usuario no existe o la contraseña no coincide
   */
  async login(loginDTO: LoginDTO): Promise<SesionDTO> {
    const usuario = await this.accesoDatos.usuarioDAO.getByUsernameWithRoles(
      loginDTO.username
    );

    if (!usuario) {
      throw new Error("Usuario o contraseña incorrectos");
    }

    if (!usuario.password) {
      throw new Error("Usuario sin contraseña configurada");
    }

    const passwordMatch = await PasswordEncoder.matches(
      loginDTO.password,
      usuario.password
    );

    if (!passwordMatch) {
      throw new Error("Usuario o contraseña incorrectos");
    }

    const usuarioDTO = UsuarioMapper.toDTO(usuario);

    const token = jwt.sign(
      {
        idUsuario: usuarioDTO.idUsuario,
        username: usuarioDTO.username,
        roles: usuarioDTO.roles.map((r) => r.nombre),
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRATION_SECONDS }
    );

    const fechaExpiracion = new Date();
    fechaExpiracion.setHours(fechaExpiracion.getHours() + SAFE_SESSION_TIMEOUT_HOURS);

    return {
      token,
      usuario: usuarioDTO,
      fechaExpiracion,
    };
  }

  /**
   * Placeholder de cierre de sesión.
   * En una implementación completa debería invalidar el token en una blacklist.
   * Por ahora el cliente es responsable de descartar el token.
   * @param token - JWT de la sesión activa
   */
  async logout(token: string): Promise<void> {
    // TODO: Agregar token a blacklist o tabla de tokens invalidados
  }

  /**
   * Verifica que un JWT sea válido y retorna los datos del usuario asociado.
   * @param token - JWT a verificar
   * @returns UsuarioDTO del usuario propietario del token
   * @throws Error si el token es inválido, expirado o el usuario no existe
   */
  async validarToken(token: string): Promise<UsuarioDTO> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      const usuario =
        await this.accesoDatos.usuarioDAO.getByUsernameWithRoles(
          decoded.username
        );

      if (!usuario) {
        throw new Error("Usuario no encontrado");
      }

      return UsuarioMapper.toDTO(usuario);
    } catch (error) {
      throw new Error("Token inválido o expirado");
    }
  }
}