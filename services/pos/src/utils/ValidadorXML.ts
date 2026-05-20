import * as fs from "fs";
import * as path from "path";
import libxmljs from "libxmljs2";
import { XMLParser } from "fast-xml-parser";

/**
 * Servicio encargado de validar documentos XML contra esquemas XSD.
 * Utiliza libxmljs2 para validación completa y fast-xml-parser para parseo a DTO.
 */
export class ValidadorXML {
  private readonly xsdDirectory: string;

  constructor() {
    this.xsdDirectory = path.join(__dirname, "..", "..", "xml");
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
      libxmljs.parseXml(xmlString);
      return null;
    } catch (error: any) {
      return new Error(`XML mal formado: ${error.message}`);
    }
  }

  /**
   * Valida un XML contra un esquema XSD específico.
   *
   * @param xmlString - Contenido XML a validar
   * @param xsdFileName - Nombre del archivo XSD dentro de la carpeta xml/
   * @returns {Error | null} Error si no coincide con el esquema, null si es válido
   */
  validarContraXSD(xmlString: string, xsdFileName: string): Error | null {
    try {
      const xsdPath = path.join(this.xsdDirectory, xsdFileName);
      const xsdContent = fs.readFileSync(xsdPath, "utf8");
      const xmlDoc = libxmljs.parseXml(xmlString);
      const xsdDoc = libxmljs.parseXml(xsdContent);

      const valido = xmlDoc.validate(xsdDoc);
      if (!valido) {
        const mensajes = xmlDoc.validationErrors
          .map((error) => error.message.trim())
          .join("; ");
        return new Error(`XML inválido según XSD: ${mensajes}`);
      }

      return null;
    } catch (error: any) {
      return new Error(`Error de validación XSD: ${error.message}`);
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

      return parser.parse(xmlString);
    } catch (error: any) {
      throw new Error(`Error al parsear XML: ${error.message}`);
    }
  }
}
