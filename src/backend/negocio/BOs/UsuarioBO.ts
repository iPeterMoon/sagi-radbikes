import jwt from "jsonwebtoken";
import { IAccesoDatos } from "../../datos/IAccesoDatos";
import { IUsuarioDAO } from "../../datos/daos/interfaces/IUsuarioDAO";
import { IUsuarioRolDAO } from "../../datos/daos/interfaces/IUsuarioRolDAO";
import { LoginDTO } from "../DTOsEntrada/LoginDTO";
import { UsuarioDTO } from "../DTOsSalida/UsuarioDTO";
import { SesionDTO } from "../DTOsSalida/SesionDTO";
import { UsuarioMapper } from "../mappers/UsuarioMapper";
import { PasswordEncoder } from "../PasswordEncoder";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key";
const TOKEN_EXPIRATION = "24h";

export class UsuarioBO {
  constructor(private accesoDatos: IAccesoDatos) {}

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
      { expiresIn: TOKEN_EXPIRATION }
    );

    const fechaExpiracion = new Date();
    fechaExpiracion.setHours(fechaExpiracion.getHours() + 24);

    return {
      token,
      usuario: usuarioDTO,
      fechaExpiracion,
    };
  }

  async logout(token: string): Promise<void> {
    // In a real implementation, you might want to:
    // - Add the token to a blacklist
    // - Store it in a database with an expiration
    // - Or use a refresh token strategy
    // For now, this is a placeholder for the logout functionality
    // The client should simply discard the token
  }

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