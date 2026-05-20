import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { CrearVentaDTO } from "../negocio/DTOsEntrada/CrearVentaDTO";
import { ProductoCarritoDTO } from "../negocio/DTOsEntrada/ProductoCarritoDTO";
import { VentaResumenDTO } from "../negocio/DTOsSalida/VentaResumenDTO";

/**
 * Serializador bidireccional para convertir entre XML y objetos DTO.
 * Maneja la serialización de respuestas exitosas y de error en formato XML.
 */
export class SerializadorXML {
  private parser: XMLParser;
  private builder: XMLBuilder;

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      parseAttributeValue: true,
      parseTagValue: true,
      processEntities: true,
    });

    this.builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      format: true,
      indentBy: "  ",
      processEntities: true,
    });
  }

  /**
   * Convierte un XML string a un objeto CrearVentaDTO.
   * Extrae el elemento raíz 'crearVenta' y mapea sus propiedades.
   * 
   * @param xmlString - XML parseado que contiene la venta
   * @returns {CrearVentaDTO} Objeto DTO con los datos de la venta
   */
  xmlACrearVentaDTO(parsedXML: any): CrearVentaDTO {
    const venta = parsedXML.crearVenta;

    // Normalizar productos (puede ser un único objeto o array)
    let productos = venta.productos.producto;
    if (!Array.isArray(productos)) {
      productos = [productos];
    }

    // Mapear productos a ProductoCarritoDTO
    const productosDTO: ProductoCarritoDTO[] = productos.map((prod: any) => ({
      idProducto: String(prod.idProducto),
      nombre: String(prod.nombre),
      cantidad: Number(prod.cantidad),
      precioUnitario: Number(prod.precioUnitario),
      subtotal: Number(prod.subtotal),
    }));

    return {
      idUsuario: String(venta.idUsuario),
      metodoPago: String(venta.metodoPago),
      productos: productosDTO,
      porcentajeImpuesto: Number(venta.porcentajeImpuesto),
    };
  }

  /**
   * Serializa un VentaResumenDTO a XML con estructura de respuesta exitosa.
   * Retorna un documento XML bien formado con la cabecera apropiada.
   * 
   * @param resumen - DTO con los datos de la venta registrada
   * @returns {string} Documento XML serializado
   */
  ventaResumenDTOAXml(resumen: VentaResumenDTO): string {
    const respuesta = {
      respuestaVenta: {
        "@_estado": "exito",
        "@_codigo": "201",
        idVenta: resumen.idVenta,
        folio: resumen.folio,
        mensaje: resumen.mensaje,
        estado: resumen.estado,
        fecha: resumen.fecha.toISOString(),
        subtotal: Number(resumen.subtotal).toFixed(2),
        importeIVA: Number(resumen.importeIVA).toFixed(2),
        porcentajeImpuesto: Number(resumen.porcentajeImpuesto).toFixed(2),
        total: Number(resumen.total).toFixed(2),
        pago: {
          idPago: resumen.pago.idPago,
          metodoPago: resumen.pago.metodoPago,
          monto: Number(resumen.pago.monto).toFixed(2),
          fechaHora: resumen.pago.fechaHora.toISOString(),
        },
      },
    };

    return `<?xml version="1.0" encoding="UTF-8"?>\n${this.builder.build(respuesta)}`;
  }

  /**
   * Serializa un error de validación XML a formato XML estructurado.
   * Usado cuando el XML entrante no cumple con el esquema.
   * 
   * @param erroresValidacion - Array de mensajes de error
   * @returns {string} Documento XML de error
   */
  erroresValidacionAXml(erroresValidacion: string[]): string {
    const respuesta = {
      respuestaVenta: {
        "@_estado": "error",
        "@_codigo": "400",
        mensaje: "Validación de XML fallida",
        errores: {
          error: erroresValidacion.length === 1 ? erroresValidacion[0] : erroresValidacion,
        },
      },
    };

    return `<?xml version="1.0" encoding="UTF-8"?>\n${this.builder.build(respuesta)}`;
  }

  /**
   * Serializa un error de stock insuficiente a formato XML estructurado.
   * Usado cuando no hay stock disponible para los productos solicitados.
   * 
   * @param detalles - Información sobre el stock insuficiente
   * @returns {string} Documento XML de error
   */
  errorStockInsuficienteAXml(detalles: any): string {
    const respuesta = {
      respuestaVenta: {
        "@_estado": "error",
        "@_codigo": "409",
        mensaje: "Stock insuficiente para completar la venta",
        error: "STOCK_INSUFICIENTE",
        detalles: detalles,
      },
    };

    return `<?xml version="1.0" encoding="UTF-8"?>\n${this.builder.build(respuesta)}`;
  }

  /**
   * Serializa un error genérico a formato XML estructurado.
   * 
   * @param codigo - Código de estado HTTP
   * @param mensaje - Mensaje de error
   * @param detalles - Información adicional del error (opcional)
   * @returns {string} Documento XML de error
   */
  errorGenericoAXml(codigo: number, mensaje: string, detalles?: any): string {
    const respuesta: any = {
      respuestaVenta: {
        "@_estado": "error",
        "@_codigo": codigo.toString(),
        mensaje: mensaje,
      },
    };

    if (detalles) {
      respuesta.respuestaVenta.detalles = detalles;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>\n${this.builder.build(respuesta)}`;
  }
}
