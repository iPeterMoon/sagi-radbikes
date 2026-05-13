import { Request, Response } from "express";
import { IServicioVenta } from "../negocio/interfaces/IServicioVenta";
import { ProductoCarritoDTO } from "../negocio/DTOsEntrada/ProductoCarritoDTO";
import { CrearVentaDTO } from "../negocio/DTOsEntrada/CrearVentaDTO";

/**
 * Controlador del Punto de Venta (POS).
 * Gestiona las peticiones HTTP entrantes y delega la lógica de negocio al ServicioVenta.
 */
export class POSControlador {
  private servicio: IServicioVenta;

  /**
   * Inicializa el controlador e inyecta el servicio de ventas.
   * Vincula el contexto (`this`) a los métodos para su uso en Express.
   * * @param {IServicioVenta} servicio - Interfaz del servicio de ventas.
   */
  constructor(servicio: IServicioVenta) {
    this.servicio = servicio;
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
   * Valida stock, procesa la transacción y maneja errores de negocio (ej. STOCK_INSUFICIENTE).
   */
  async registrarVenta(req: Request, res: Response): Promise<void> {
    try {
      const dto: CrearVentaDTO = req.body;
      const resumen = await this.servicio.registrarVenta(dto);
      res.status(201).json(resumen);
    } catch (error: any) {
      if (error.message === "STOCK_INSUFICIENTE") {
        res.status(409).json({
          error: "STOCK_INSUFICIENTE",
          detalles: error.detalles
        });
        return;
      }

      const status = error.message?.startsWith("Validación") ? 400 : 500;
      res.status(status).json({ error: error.message });
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