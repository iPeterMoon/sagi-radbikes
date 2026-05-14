/**
 * Realiza una serialización y deserialización segura de objetos, permitiendo
 * el manejo de tipos de datos no soportados nativamente por el estándar JSON,
 * como los valores de tipo BigInt.
 *
 * @param valor El objeto o valor de tipo desconocido que se desea procesar.
 * @returns Una copia del objeto procesado donde los BigInt han sido convertidos a string,
 *          o null si el resultado de la serialización es indefinido.
 */
export function serializarJsonSeguro(valor: unknown): unknown {
  /**
   * Convierte el valor a una cadena JSON.
   * Se utiliza un "replacer" para interceptar valores de tipo bigint y
   * transformarlos en su representación de texto, evitando errores de tipo.
   */
  const json = JSON.stringify(valor, (_clave, actual) => {
    if (typeof actual === "bigint") {
      return actual.toString();
    }
    return actual;
  });

  /**
   * Manejo de casos donde JSON.stringify devuelve undefined (ej. funciones o valores undefined).
   */
  if (json === undefined) {
    return null;
  }

  /**
   * Retorna el objeto nuevamente parseado para asegurar que la estructura final
   * sea compatible con transportes de datos que no aceptan BigInt.
   */
  return JSON.parse(json);
}
