import bcrypt from "bcrypt";

/**
 * Utilidad para codificación y verificación de contraseñas con bcrypt.
 * Todos los métodos son estáticos; no se necesita instanciar la clase.
 */
export class PasswordEncoder {
  /** Número de rondas de sal usadas por bcrypt. */
  private static readonly SALT_ROUNDS = 10;

  /**
   * Genera el hash bcrypt de una contraseña en texto plano.
   * @param password - Contraseña a hashear
   * @returns Hash bcrypt listo para almacenar
   */
  static async encode(password: string): Promise<string> {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Compara una contraseña en texto plano con su hash almacenado.
   * @param password - Contraseña candidata
   * @param hash - Hash almacenado en base de datos
   * @returns `true` si la contraseña coincide con el hash
   */
  static async matches(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}