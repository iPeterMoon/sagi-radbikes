/**
 * Datos mínimos de un usuario activo, usados para elegir con quién cambiar
 * de vendedor en el Punto de Venta (sin exponer roles ni otros datos).
 */
export interface VendedorActivoDTO {
  idUsuario: string;
  nombre: string;
  apellido: string;
  username: string;
}
