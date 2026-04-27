/** Datos de entrada para el proceso de autenticación. */
export interface LoginDTO {
  /** Nombre de usuario registrado en el sistema. */
  username: string;
  /** Contraseña en texto plano (se valida contra el hash almacenado). */
  password: string;
}