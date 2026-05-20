import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { CrearVentaDTO } from "../negocio/DTOsEntrada/CrearVentaDTO";
import { ProductoCarritoDTO } from "../negocio/DTOsEntrada/ProductoCarritoDTO";
import { VentaResumenDTO } from "../negocio/DTOsSalida/VentaResumenDTO";
import { ProductoVentaDTO } from "../negocio/DTOsSalida/ProductoVentaDTO";

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
   * Convierte un XML parseado a un objeto CrearVentaDTO.
   * @param parsedXML - Objeto parseado desde XML
   */
  xmlACrearVentaDTO(parsedXML: any): CrearVentaDTO {
    const venta = parsedXML.crearVenta;
    let productos = venta.productos.producto;
    if (!Array.isArray(productos)) {
      productos = [productos];
    }

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
      porcentajeImpuesto: Number(venta.porcentajeImpuesto),
      productos: productosDTO,
    };
  }

  /**
   * Convierte un XML parseado a un ProductoCarritoDTO para acciones sobre el carrito.
   * @param parsedXML - Objeto parseado desde XML
   */
  xmlAProductoCarritoDTO(parsedXML: any): ProductoCarritoDTO {
    const producto = parsedXML.agregarProducto || parsedXML.producto || parsedXML.item;
    if (!producto) {
      throw new Error("XML de carrito inválido: raíz de producto no encontrada");
    }

    return {
      idProducto: String(producto.idProducto),
      nombre: String(producto.nombre),
      cantidad: Number(producto.cantidad),
      precioUnitario: Number(producto.precioUnitario),
      subtotal: Number(producto.subtotal),
    };
  }

  /**
   * Convierte un XML parseado a la cantidad esperada para la operación cambiarCantidad.
   * @param parsedXML - Objeto parseado desde XML
   */
  xmlACantidad(parsedXML: any): number {
    const cantidad = parsedXML.cambiarCantidad?.cantidad;
    if (cantidad === undefined || cantidad === null) {
      throw new Error("XML de cambiar cantidad inválido: etiqueta 'cantidad' no encontrada");
    }
    return Number(cantidad);
  }

  /**
   * Convierte una lista de productos de catálogo a XML.
   */
  productosAXml(productos: ProductoVentaDTO[]): string {
    const respuesta = {
      productos: {
        producto: productos.map((item) => ({
          idProducto: item.idProducto,
          nombre: item.nombre,
          precio: item.precio.toFixed(2),
          stock: item.stock,
          urlImagen: item.urlImagen || "",
          SKU: item.SKU,
          codigoBarras: item.codigoBarras || "",
          categoria: { nombre: item.categoria?.nombre || "" },
        })),
      },
    };

    return `<?xml version="1.0" encoding="UTF-8"?>\n${this.builder.build(respuesta)}`;
  }

  /**
   * Convierte el estado del carrito a XML.
   */
  carritoAXml(carrito: ProductoCarritoDTO[]): string {
    const respuesta: any = {
      carrito: {
        items: {
          item: carrito.map((producto) => ({
            idProducto: producto.idProducto,
            nombre: producto.nombre,
            cantidad: producto.cantidad,
            precioUnitario: producto.precioUnitario.toFixed(2),
            subtotal: producto.subtotal.toFixed(2),
          })),
        },
      },
    };

    if (carrito.length === 0) {
      respuesta.carrito.items = {};
    }

    return `<?xml version="1.0" encoding="UTF-8"?>\n${this.builder.build(respuesta)}`;
  }

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

  errorStockInsuficienteAXml(detalles: any): string {
    const respuesta = {
      respuestaVenta: {
        "@_estado": "error",
        "@_codigo": "409",
        mensaje: "Stock insuficiente para completar la venta",
        error: "STOCK_INSUFICIENTE",
        detalles,
      },
    };

    return `<?xml version="1.0" encoding="UTF-8"?>\n${this.builder.build(respuesta)}`;
  }

  errorGenericoAXml(codigo: number, mensaje: string, detalles?: any): string {
    const respuesta: any = {
      respuestaVenta: {
        "@_estado": "error",
        "@_codigo": codigo.toString(),
        mensaje,
      },
    };

    if (detalles) {
      respuesta.respuestaVenta.detalles = detalles;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>\n${this.builder.build(respuesta)}`;
  }
}
