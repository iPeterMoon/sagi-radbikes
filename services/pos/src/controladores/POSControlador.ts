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
    this.validador = new ValidadorXML("venta.xsd");
    this.serializador = new SerializadorXML();
    this.buscarProductos = this.buscarProductos.bind(this);
    this.registrarVenta = this.registrarVenta.bind(this);
    this.agregarProductoCarrito = this.agregarProductoCarrito.bind(this);
    this.eliminarProductoCarrito = this.eliminarProductoCarrito.bind(this);
    this.limpiarCarrito = this.limpiarCarrito.bind(this);
    this.cambiarCantidad = this.cambiarCantidad.bind(this);
    this.obtenerCarrito = this.obtenerCarrito.bind(this);
  }

  /**
   * Maneja la petición para buscar productos en el catálogo.
   * Permite filtrar por un término de búsqueda opcional.
   */
  async buscarProductos(req: Request, res: Response): Promise<void> {
    try {
      const busqueda = req.query.busqueda as string | undefined;
      const productos = await this.servicio.buscarProductos(busqueda);
      res.json(productos);
    } catch (error) {
      res.status(500).json({ error: "Error al buscar productos" });
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
      // req.body es un string XML cuando viene del middleware express.text()
      const xmlString = req.body as string;

      if (!xmlString || xmlString.trim().length === 0) {
        res.setHeader("Content-Type", "application/xml");
        res.status(400).send(
          this.serializador.errorGenericoAXml(400, "Cuerpo de la solicitud vacío")
        );
        return;
      }

      // 1. Validar que el XML esté bien formado
      const errorBienFormado = this.validador.validarXMLBienFormado(xmlString);
      if (errorBienFormado) {
        res.setHeader("Content-Type", "application/xml");
        res.status(400).send(
          this.serializador.errorGenericoAXml(400, errorBienFormado.message)
        );
        return;
      }

      // 2. Parsear el XML
      let parsedXML: any;
      try {
        parsedXML = this.validador.parsearXML(xmlString);
      } catch (error: any) {
        res.setHeader("Content-Type", "application/xml");
        res.status(400).send(
          this.serializador.errorGenericoAXml(400, error.message)
        );
        return;
      }

      // 3. Validar estructura contra esquema conceptual
      const erroresEstructura = this.validador.validarEstructuraCrearVenta(parsedXML);
      if (erroresEstructura.length > 0) {
        res.setHeader("Content-Type", "application/xml");
        res.status(400).send(
          this.serializador.erroresValidacionAXml(erroresEstructura)
        );
        return;
      }

      // 4. Convertir XML a DTO
      const dto: CrearVentaDTO = this.serializador.xmlACrearVentaDTO(parsedXML);

      // 5. Procesar la venta
      const resumen = await this.servicio.registrarVenta(dto);

      // 6. Retornar XML de éxito
      res.setHeader("Content-Type", "application/xml");
      res.status(201).send(this.serializador.ventaResumenDTOAXml(resumen));
    } catch (error: any) {
      // Manejo de errores controlados de negocio
      if (error.message === "STOCK_INSUFICIENTE") {
        res.setHeader("Content-Type", "application/xml");
        res.status(409).send(
          this.serializador.errorStockInsuficienteAXml(error.detalles)
        );
        return;
      }

      // Otros errores
      const status = error.message?.startsWith("Validación") ? 400 : 500;
      res.setHeader("Content-Type", "application/xml");
      res.status(status).send(
        this.serializador.errorGenericoAXml(status, error.message || "Error interno del servidor")
      );
    }
  }

  /**
   * Maneja la petición para agregar un producto al carrito en memoria.
   */
  agregarProductoCarrito(req: Request, res: Response): void {
    try {
      const producto: ProductoCarritoDTO = req.body;
      this.servicio.agregarProductoCarrito(producto);
      res.json({ carrito: this.servicio.obtenerCarrito() });
    } catch (error) {
      res.status(500).json({ error: "Error al agregar producto al carrito" });
    }
  }

  /**
   * Maneja la petición para eliminar un producto específico del carrito.
   */
  eliminarProductoCarrito(req: Request, res: Response): void {
    try {
      const idProducto = req.params.idProducto as string;
      this.servicio.eliminarProductoCarrito(idProducto);
      res.json({ carrito: this.servicio.obtenerCarrito() });
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar producto del carrito" });
    }
  }

  /**
   * Maneja la petición para vaciar completamente el carrito.
   */
  limpiarCarrito(_req: Request, res: Response): void {
    try {
      this.servicio.limpiarCarrito();
      res.json({ carrito: [] });
    } catch (error) {
      res.status(500).json({ error: "Error al limpiar el carrito" });
    }
  }

  /**
   * Maneja la petición para actualizar la cantidad de un producto existente en el carrito.
   */
  cambiarCantidad(req: Request, res: Response): void {
    try {
      const idProducto = req.params.idProducto as string;
      const { cantidad } = req.body;
      this.servicio.cambiarCantidad(idProducto, Number(cantidad));
      res.json({ carrito: this.servicio.obtenerCarrito() });
    } catch (error) {
      res.status(500).json({ error: "Error al cambiar cantidad" });
    }
  }

  /**
   * Maneja la petición para obtener el estado actual del carrito.
   */
  obtenerCarrito(_req: Request, res: Response): void {
    res.json({ carrito: this.servicio.obtenerCarrito() });
  }
}