import jwt from "jsonwebtoken";
import { AuthAccesoDatos } from "../../datos/AuthAccesoDatos";
import { LoginDTO } from "../DTOsEntrada/LoginDTO";
import { UsuarioDTO } from "../DTOsSalida/UsuarioDTO";
import { NuevoUsuarioDTO } from "../DTOsEntrada/NuevoUsuarioDTO";
import { SesionDTO } from "../DTOsSalida/SesionDTO";
import { UsuarioMapper } from "../mappers/UsuarioMapper";
import { PasswordEncoder } from "../PasswordEncoder";
import { IUsuarioBO } from "../interfaces/IUsuarioBO";

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
export class UsuarioBO implements IUsuarioBO {
  constructor(private accesoDatos: AuthAccesoDatos) { }

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
      throw new Error("Token inválido o expirado: " + error);
    }
  }

  /**
 * Recupera todos los usuarios registrados en el sistema.
 *
 * @returns Una promesa que resuelve a un arreglo con los DTOs de todos los usuarios.
 */
  async obtenerTodos(): Promise<UsuarioDTO[]> {
    const usuarios = await this.accesoDatos.usuarioDAO.getAll();
    return usuarios.map(UsuarioMapper.toDTO);
  }

  /**
   * Busca un usuario específico mediante su identificador único.
   *
   * @param id El identificador único del usuario en formato string.
   * @returns Una promesa que resuelve al DTO del usuario encontrado o nulo si no existe.
   */
  async obtenerPorId(id: string): Promise<UsuarioDTO | null> {
    const usuario = await this.accesoDatos.usuarioDAO.getById(BigInt(id));
    return usuario ? UsuarioMapper.toDTO(usuario) : null;
  }


  /**
   * Crea un nuevo usuario en el sistema con la contraseña proporcionada.
   * @param nuevoUsuario DTO con los datos del nuevo usuario a crear
   * @returns UsuarioDTO del usuario recién creado
   * @throws Error si el username o email ya existen en el sistema
   */
  async crear(nuevoUsuario: NuevoUsuarioDTO): Promise<UsuarioDTO> {
    try {
      const existente = await this.accesoDatos.usuarioDAO.getByUsername(nuevoUsuario.username);

      if (existente) {
        throw new Error("Ya existe un usuario con ese username");
      }

      const passwordHash = await PasswordEncoder.encode(nuevoUsuario.password);

      const usuario = await this.accesoDatos.usuarioDAO.create({
        username: nuevoUsuario.username,
        password: passwordHash,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        email: nuevoUsuario.email,
        is_active: nuevoUsuario.is_active ?? true,
      });

      for (const rol of nuevoUsuario.roles) {
        await this.accesoDatos.usuarioRolDAO.create({
          user_id: usuario.id,
          role_id: BigInt(rol.idRol),
        });
      }

      const usuarioConRoles = await this.accesoDatos.usuarioDAO.getByUsernameWithRoles(
        usuario.username!
      )

      return UsuarioMapper.toDTO(usuarioConRoles!);
    } catch (error) {
      throw new Error(`Error al crear un nuevo usuario: ${error}`);
    }
  }

  /**
   * Actualiza los datos de un usuario existente.
   * @param id Id del usuario a actualizar.
   * @param usuario DTO con los datos actualizados del usuario
   * @returns UsuarioDTO del usuario actualizado
   * @throws Error si el usuario no existe o si hay conflictos con username/email
   */
  async actualizar(id: number | bigint, usuario: UsuarioDTO): Promise<UsuarioDTO> {
    try {
      const existente = await this.accesoDatos.usuarioDAO.getById(id);
      if (!existente) {
        throw new Error("El usuario que desea editar no existe");
      }

      if (usuario.username !== existente.username) {
        const usuarioNombre = await this.accesoDatos.usuarioDAO.getByUsername(usuario.username);
        if (usuarioNombre) {
          throw new Error("Ya existe un usuario con este nombre");
        }
      }

      if (usuario.email !== existente.email) {
        const usuarioEmail = await this.accesoDatos.usuarioDAO.getByEmail(usuario.email);
        if (usuarioEmail) {
          throw new Error("Este correo ya está asociado con un usuario");
        }
      }

      if (usuario.telefono !== existente.telefono) {
        const usuarioTelefono = await this.accesoDatos.usuarioDAO.getByPhone(usuario.telefono);
        if (usuarioTelefono) {
          throw new Error("Este telefono ya está asociado con un usuario");
        }
      }

      const user_roles = await this.accesoDatos.usuarioRolDAO.getByUserId(BigInt(usuario.idUsuario));

      const rolesActuales = user_roles.map(ur => ur.role_id!.toString());
      const rolesNuevos = usuario.roles.map(r => r.idRol);

      const rolesAgregar = rolesNuevos.filter(id => !rolesActuales.includes(id));
      const rolesQuitar = rolesActuales.filter(id => !rolesNuevos.includes(id));

      for (const rolId of rolesAgregar) {
        await this.accesoDatos.usuarioRolDAO.create({
          user_id: BigInt(usuario.idUsuario),
          role_id: BigInt(rolId),
        });
      }

      for (const rolId of rolesQuitar) {
        const user_role = user_roles.find(ur => ur.role_id === BigInt(rolId))?.id;
        await this.accesoDatos.usuarioRolDAO.delete(
          user_role!
        )
      }

      const usuarioActualizado = await this.accesoDatos.usuarioDAO.update(id, {
        username: usuario.username,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        telefono: usuario.telefono,
        is_active: usuario.is_active
      });

      const usuarioConRoles = await this.accesoDatos.usuarioDAO.getByUsernameWithRoles(usuarioActualizado.username!);

      return UsuarioMapper.toDTO(usuarioConRoles!);

    } catch (error) {
      throw new Error(`Error al actualizar al usuario: ${error}`);
    }
  }

  /**
   * Elimina un usuario del sistema.
   * @param id Id del usuario a eliminar
   * @returns Promise<boolean> indicando si la operación fue exitosa
   */
  async eliminar(id: number | bigint): Promise<boolean> {
    try {
      const existente = this.accesoDatos.usuarioDAO.getById(id);
      if (!existente) {
        throw new Error("El usuario ya está eliminado o no existe");
      }

      await this.accesoDatos.usuarioDAO.delete(id)

      return true;
    } catch (error) {
      throw new Error(`Error al eliminar al usuario ${error}`);
    }
  }

  /**
   * Alterna el estado de actividad de un usuario (activo/inactivo).
   * @param id Id del usuario a alternar su estado de actividad
   * @returns true si se pudo alternar false si no
   */
  async alternarActivo(id: number | bigint): Promise<boolean> {
    try {
      const existente = this.accesoDatos.usuarioDAO.getById(id);
      if (!existente) {
        throw new Error("El usuario que desea actualizar no existe");
      }

      await this.accesoDatos.usuarioDAO.toggleActive(id);

      return true;
    } catch (error) {
      throw new Error(`Error al alternar el estado de actividad ${error}`);
    }
  }
}