/**
 * Función para serializar un valor a JSON de forma segura, manejando tipos de datos que no son compatibles con JSON, como BigInt.
 * Esta función convierte los BigInt a string durante la serialización y luego los vuelve a convertir a su tipo original al parsear el JSON.
 * Si el valor no se puede serializar, devuelve null en lugar de lanzar un error.
 */
export function serializarJsonSeguro(valor: unknown): unknown {
  const json = JSON.stringify(valor, (_clave, actual) => {
    if (typeof actual === "bigint") {
      return actual.toString();
    }
    return actual;
  });

  if (json === undefined) {
    return null;
  }

  return JSON.parse(json);
}