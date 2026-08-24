import { ConfiguracionDAO } from "../datos/ConfiguracionDAO";
import { ConfiguracionDTO } from "./DTOsSalida/ConfiguracionDTO";
import { ActualizarConfiguracionDTO } from "./DTOsEntrada/ActualizarConfiguracionDTO";

/**
 * Orquesta la lectura y actualización de la configuración general del sistema.
 */
export class ServicioConfiguracion {
  constructor(private dao: ConfiguracionDAO) {}

  /**
   * Obtiene la configuración vigente.
   * @returns {Promise<ConfiguracionDTO>} La configuración actual.
   */
  async obtener(): Promise<ConfiguracionDTO> {
    const config = await this.dao.obtener();
    return { margenGananciaSugerido: config.suggested_margin };
  }

  /**
   * Actualiza el margen de ganancia sugerido.
   * @param {ActualizarConfiguracionDTO} dto - Nuevo valor de margen.
   * @returns {Promise<ConfiguracionDTO>} La configuración actualizada.
   * @throws {Error} Si el margen no es un número mayor a 0.
   */
  async actualizar(dto: ActualizarConfiguracionDTO): Promise<ConfiguracionDTO> {
    if (!dto.margenGananciaSugerido || dto.margenGananciaSugerido <= 0) {
      throw new Error("El margen de ganancia sugerido debe ser mayor a 0");
    }
    const config = await this.dao.actualizarMargen(dto.margenGananciaSugerido);
    return { margenGananciaSugerido: config.suggested_margin };
  }
}
