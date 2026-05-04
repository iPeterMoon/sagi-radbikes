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