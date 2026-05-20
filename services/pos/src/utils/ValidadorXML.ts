import * as fs from "fs";
import * as path from "path";
import { XMLParser, XMLValidator } from "fast-xml-parser";

/**
 * Servicio encargado de validar documentos XML contra un esquema XSD.
 * Utiliza fast-xml-parser para una validación estructural rápida.
 * 
 * NOTA: Para validación completa contra XSD, considere usar libxmljs2 en futuras versiones.
 */
export class ValidadorXML {
  private xsdPath: string;

  constructor(xsdFileName: string = "venta.xsd") {
    // Resolver la ruta del esquema XSD relativa a este archivo
    this.xsdPath = path.join(__dirname, "..", "..", "xml", xsdFileName);
  }

  /**
   * Valida que el XML sea bien formado (well-formed).
   * Retorna error si no cumple con la estructura XML básica.
   * 
   * @param xmlString - Contenido XML a validar
   * @returns {Error | null} Error si es inválido, null si es válido
   */
  validarXMLBienFormado(xmlString: string): Error | null {
    try {
      const validacion = XMLValidator.validate(xmlString);
      if (validacion !== true) {
        return new Error(`XML mal formado: ${JSON.stringify(validacion)}`);
      }
      return null;
    } catch (error: any) {
      return new Error(`Error al validar XML: ${error.message}`);
    }
  }

  /**
   * Parsea el XML string a un objeto JavaScript.
   * Requiere que el XML esté bien formado.
   * 
   * @param xmlString - Contenido XML a parsear
   * @returns {any} Objeto JavaScript parseado
   * @throws {Error} Si el XML no puede ser parseado
   */
  parsearXML(xmlString: string): any {
    try {
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        parseAttributeValue: true,
        parseTagValue: true,
        processEntities: true,
      });

      const resultado = parser.parse(xmlString);
      return resultado;
    } catch (error: any) {
      throw new Error(`Error al parsear XML: ${error.message}`);
    }
  }

  /**
   * Valida la estructura básica esperada para CrearVentaDTO.
   * Realiza validaciones de estructura contra el esquema conceptual.
   * 
   * @param parsedXML - Objeto parseado desde XML
   * @returns {string[]} Array de errores encontrados (vacío si no hay errores)
   */
  validarEstructuraCrearVenta(parsedXML: any): string[] {
    const errores: string[] = [];
    const venta = parsedXML.crearVenta;

    if (!venta) {
      errores.push("Elemento raíz 'crearVenta' no encontrado en el XML");
      return errores;
    }

    // Validar campos obligatorios
    if (!venta.idUsuario) errores.push("Campo 'idUsuario' es requerido");
    if (!venta.metodoPago) errores.push("Campo 'metodoPago' es requerido");
    if (!venta.porcentajeImpuesto && venta.porcentajeImpuesto !== 0) {
      errores.push("Campo 'porcentajeImpuesto' es requerido");
    }
    if (!venta.productos) {
      errores.push("Campo 'productos' es requerido");
      return errores;
    }

    // Validar métodoPago
    const metodosPagosValidos = ["efectivo", "tarjeta_credito", "tarjeta_debito", "transferencia"];
    if (!metodosPagosValidos.includes(venta.metodoPago)) {
      errores.push(`metodoPago inválido. Permitidos: ${metodosPagosValidos.join(", ")}`);
    }

    // Validar porcentajeImpuesto
    const porcentaje = Number(venta.porcentajeImpuesto);
    if (isNaN(porcentaje) || porcentaje < 0 || porcentaje > 100) {
      errores.push("porcentajeImpuesto debe estar entre 0 y 100");
    }

    // Validar productos array
    let productos = venta.productos.producto;
    if (!Array.isArray(productos)) {
      productos = [productos];
    }

    if (productos.length === 0) {
      errores.push("Debe haber al menos un producto");
    }

    // Validar cada producto
    productos.forEach((producto: any, index: number) => {
      if (!producto.idProducto) {
        errores.push(`Producto ${index}: 'idProducto' es requerido`);
      }
      if (!producto.nombre) {
        errores.push(`Producto ${index}: 'nombre' es requerido`);
      }
      const cantidad = Number(producto.cantidad);
      if (isNaN(cantidad) || cantidad < 1) {
        errores.push(`Producto ${index}: 'cantidad' debe ser >= 1`);
      }
      const precio = Number(producto.precioUnitario);
      if (isNaN(precio) || precio < 0) {
        errores.push(`Producto ${index}: 'precioUnitario' inválido`);
      }
    });

    return errores;
  }
}
