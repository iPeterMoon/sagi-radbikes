import { RolDTO } from "./RolDTO";

export interface UsuarioDTO {
  idUsuario: string;
  username: string;
  roles: RolDTO[];
}