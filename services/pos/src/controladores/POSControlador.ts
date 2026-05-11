import { Request, Response } from "express";
import { IServicioVenta } from "../negocio/interfaces/IServicioVenta";
import { ProductoCarritoDTO } from "../negocio/DTOsEntrada/ProductoCarritoDTO";
import { CrearVentaDTO } from "../negocio/DTOsEntrada/CrearVentaDTO";

export class POSControlador {
  private servicio: IServicioVenta;

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

  async buscarProductos(req: Request, res: Response): Promise<void> {
    try {
      const busqueda = req.query.busqueda as string | undefined;
      const productos = await this.servicio.buscarProductos(busqueda);
      res.json(productos);
    } catch (error) {
      res.status(500).json({ error: "Error al buscar productos" });
    }
  }

  async registrarVenta(req: Request, res: Response): Promise<void> {
    try {
      const dto: CrearVentaDTO = req.body;
      const resumen = await this.servicio.registrarVenta(dto);
      res.status(201).json(resumen);
    } catch (error: any) {
      const status = error.message?.startsWith("Validación") ? 400 : 500;
      res.status(status).json({ error: error.message });
    }
  }

  agregarProductoCarrito(req: Request, res: Response): void {
    try {
      const producto: ProductoCarritoDTO = req.body;
      this.servicio.agregarProductoCarrito(producto);
      res.json({ carrito: this.servicio.obtenerCarrito() });
    } catch (error) {
      res.status(500).json({ error: "Error al agregar producto al carrito" });
    }
  }

  eliminarProductoCarrito(req: Request, res: Response): void {
    try {
      const idProducto = req.params.idProducto as string;
      this.servicio.eliminarProductoCarrito(idProducto);
      res.json({ carrito: this.servicio.obtenerCarrito() });
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar producto del carrito" });
    }
  }

  limpiarCarrito(_req: Request, res: Response): void {
    try {
      this.servicio.limpiarCarrito();
      res.json({ carrito: [] });
    } catch (error) {
      res.status(500).json({ error: "Error al limpiar el carrito" });
    }
  }

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

  obtenerCarrito(_req: Request, res: Response): void {
    res.json({ carrito: this.servicio.obtenerCarrito() });
  }
}