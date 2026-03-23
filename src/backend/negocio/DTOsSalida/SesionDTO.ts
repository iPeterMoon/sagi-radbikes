import { UsuarioDTO } from "./UsuarioDTO";

export interface SesionDTO {
  token: string;
  usuario: UsuarioDTO;
  fechaExpiracion: Date;
}