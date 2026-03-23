import bcrypt from "bcrypt";

export class PasswordEncoder {
  private static readonly SALT_ROUNDS = 10;

  static async encode(password: string): Promise<string> {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async matches(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}