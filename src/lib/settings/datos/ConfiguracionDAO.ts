import { PrismaClient, store_settings } from "@prisma/client";

/**
 * Data Access Object para la configuración general del sistema (fila única/singleton).
 */
export class ConfiguracionDAO {
  constructor(private prisma: PrismaClient) {}

  /**
   * Obtiene la fila de configuración. Si todavía no existe (primer arranque),
   * la crea con los valores default del schema y la retorna.
   * @returns {Promise<store_settings>} La configuración vigente.
   */
  async obtener(): Promise<store_settings> {
    const existente = await this.prisma.store_settings.findFirst();
    if (existente) return existente;
    return await this.prisma.store_settings.create({ data: {} });
  }

  /**
   * Actualiza el margen de ganancia sugerido, creando la fila si todavía no existe.
   * @param {number} margen - Nuevo multiplicador de margen.
   * @returns {Promise<store_settings>} La configuración actualizada.
   */
  async actualizarMargen(margen: number): Promise<store_settings> {
    const existente = await this.prisma.store_settings.findFirst();
    if (!existente) {
      return await this.prisma.store_settings.create({
        data: { suggested_margin: margen },
      });
    }
    return await this.prisma.store_settings.update({
      where: { id: existente.id },
      data: { suggested_margin: margen },
    });
  }
}
