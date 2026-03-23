import { RolDTO } from "./RolDTO";

export interface UsuarioDTO {
  idUsuario: bigint;
  username: string;
  roles: RolDTO[];
}