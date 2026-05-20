import { Request, Response } from "express";
import { IServicioVenta } from "../negocio/interfaces/IServicioVenta";
import { ProductoCarritoDTO } from "../negocio/DTOsEntrada/ProductoCarritoDTO";
import { CrearVentaDTO } from "../negocio/DTOsEntrada/CrearVentaDTO";
import { ValidadorXML } from "../utils/ValidadorXML";
import { SerializadorXML } from "../utils/SerializadorXML";

/**
 * Controlador del Punto de Venta (POS).
 * Gestiona las peticiones HTTP entrantes y delega la lógica de negocio al ServicioVenta.
 * 
 * Nota: El endpoint /venta ahora recibe y retorna exclusivamente XML validado contra XSD.
 */
export class POSControlador {
  private servicio: IServicioVenta;
  private validador: ValidadorXML;
  private serializador: SerializadorXML;

  /**
   * Inicializa el controlador e inyecta el servicio de ventas.
   * Vincula el contexto (`this`) a los métodos para su uso en Express.
   * * @param {IServicioVenta} servicio - Interfaz del servicio de ventas.
   */
  constructor(servicio: IServicioVenta) {
    this.servicio = servicio;
    this.validador = new ValidadorXML();
    this.serializador = new SerializadorXML();
    this.buscarProductos = this.buscarProductos.bind(this);
    this.registrarVenta = this.registrarVenta.bind(this);
    this.agregarProductoCarrito = this.agregarProductoCarrito.bind(this);
    this.eliminarProductoCarrito = this.eliminarProductoCarrito.bind(this);
    this.limpiarCarrito = this.limpiarCarrito.bind(this);
    this.cambiarCantidad = this.cambiarCantidad.bind(this);
    this.obtenerCarrito = this.obtenerCarrito.bind(this);
  }

  private enviarXml(res: Response, status: number, xml: string): void {
    res.type("application/xml");
    res.status(status).send(xml);
  }

  private validarYParsearXml(xmlString: string, xsdFileName: string): any {
    const errorBienFormado = this.validador.validarXMLBienFormado(xmlString);
    if (errorBienFormado) {
      throw errorBienFormado;
    }

    const errorXsd = this.validador.validarContraXSD(xmlString, xsdFileName);
    if (errorXsd) {
      throw errorXsd;
    }

    return this.validador.parsearXML(xmlString);
  }

  /**
   * Maneja la petición para buscar productos en el catálogo.
   * Permite filtrar por un término de búsqueda opcional.
   */
  async buscarProductos(req: Request, res: Response): Promise<void> {
    try {
      const busqueda = req.query.busqueda as string | undefined;
      const productos = await this.servicio.buscarProductos(busqueda);
      this.enviarXml(res, 200, this.serializador.productosAXml(productos));
    } catch (error: any) {
      this.enviarXml(
        res,
        500,
        this.serializador.errorGenericoAXml(500, error.message || "Error al buscar productos"),
      );
    }
  }

  /**
   * Maneja la petición para registrar una nueva venta.
   * 
   * NUEVO FLUJO XML:
   * 1. Recibe el cuerpo como text/plain con MIME type application/xml
   * 2. Valida que el XML esté bien formado
   * 3. Parsea el XML y valida su estructura contra el esquema conceptual
   * 4. Convierte el XML a objeto CrearVentaDTO
   * 5. Procesa la venta mediante ServicioVenta
   * 6. Retorna XML de respuesta (éxito o error)
   */
  async registrarVenta(req: Request, res: Response): Promise<void> {
    try {
      const xmlString = req.body as string;
      if (!xmlString || xmlString.trim().length === 0) {
        this.enviarXml(res, 400, this.serializador.errorGenericoAXml(400, "Cuerpo de la solicitud vacío"));
        return;
      }

      const parsedXML = this.validarYParsearXml(xmlString, "venta.xsd");
      const dto: CrearVentaDTO = this.serializador.xmlACrearVentaDTO(parsedXML);
      const resumen = await this.servicio.registrarVenta(dto);
      this.enviarXml(res, 201, this.serializador.ventaResumenDTOAXml(resumen));
    } catch (error: any) {
      if (error.message === "STOCK_INSUFICIENTE") {
        this.enviarXml(res, 409, this.serializador.errorStockInsuficienteAXml(error.detalles));
        return;
      }
      const status = error.message?.includes("XSD") || error.message?.includes("XML") ? 400 : 500;
      this.enviarXml(res, status, this.serializador.errorGenericoAXml(status, error.message || "Error interno del servidor"));
    }
  }

  /**
   * Maneja la petición para agregar un producto al carrito en memoria.
   */
  agregarProductoCarrito(req: Request, res: Response): void {
    try {
      const xmlString = req.body as string;
      if (!xmlString || xmlString.trim().length === 0) {
        this.enviarXml(res, 400, this.serializador.errorGenericoAXml(400, "Cuerpo de la solicitud vacío"));
        return;
      }

      const parsedXML = this.validarYParsearXml(xmlString, "carrito.xsd");
      const producto = this.serializador.xmlAProductoCarritoDTO(parsedXML);
      this.servicio.agregarProductoCarrito(producto);
      this.enviarXml(res, 200, this.serializador.carritoAXml(this.servicio.obtenerCarrito()));
    } catch (error: any) {
      const status = error.message?.includes("XSD") || error.message?.includes("XML") ? 400 : 500;
      this.enviarXml(res, status, this.serializador.errorGenericoAXml(status, error.message || "Error al agregar producto al carrito"));
    }
  }

  /**
   * Maneja la petición para eliminar un producto específico del carrito.
   */
  eliminarProductoCarrito(req: Request, res: Response): void {
    try {
      const idProducto = req.params.idProducto as string;
      this.servicio.eliminarProductoCarrito(idProducto);
      this.enviarXml(res, 200, this.serializador.carritoAXml(this.servicio.obtenerCarrito()));
    } catch (error: any) {
      this.enviarXml(res, 500, this.serializador.errorGenericoAXml(500, error.message || "Error al eliminar producto del carrito"));
    }
  }

  /**
   * Maneja la petición para vaciar completamente el carrito.
   */
  limpiarCarrito(_req: Request, res: Response): void {
    try {
      this.servicio.limpiarCarrito();
      this.enviarXml(res, 200, this.serializador.carritoAXml(this.servicio.obtenerCarrito()));
    } catch (error: any) {
      this.enviarXml(res, 500, this.serializador.errorGenericoAXml(500, error.message || "Error al limpiar el carrito"));
    }
  }

  /**
   * Maneja la petición para actualizar la cantidad de un producto existente en el carrito.
   */
  cambiarCantidad(req: Request, res: Response): void {
    try {
      const xmlString = req.body as string;
      if (!xmlString || xmlString.trim().length === 0) {
        this.enviarXml(res, 400, this.serializador.errorGenericoAXml(400, "Cuerpo de la solicitud vacío"));
        return;
      }

      const parsedXML = this.validarYParsearXml(xmlString, "carrito.xsd");
      const cantidad = this.serializador.xmlACantidad(parsedXML);
      const idProducto = req.params.idProducto as string;
      this.servicio.cambiarCantidad(idProducto, cantidad);
      this.enviarXml(res, 200, this.serializador.carritoAXml(this.servicio.obtenerCarrito()));
    } catch (error: any) {
      const status = error.message?.includes("XSD") || error.message?.includes("XML") ? 400 : 500;
      this.enviarXml(res, status, this.serializador.errorGenericoAXml(status, error.message || "Error al cambiar cantidad"));
    }
  }

  /**
   * Maneja la petición para obtener el estado actual del carrito.
   */
  obtenerCarrito(_req: Request, res: Response): void {
    try {
      this.enviarXml(res, 200, this.serializador.carritoAXml(this.servicio.obtenerCarrito()));
    } catch (error: any) {
      this.enviarXml(res, 500, this.serializador.errorGenericoAXml(500, error.message || "Error al obtener el carrito"));
    }
  }
}