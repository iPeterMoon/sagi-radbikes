import { IVentaBO } from "./interfaces/IVentaBO";
import { ICarritoBO } from "./interfaces/ICarritoBO";
import { IProductoBO } from "./interfaces/IProductoBO";
import { IPOSAccesoDatos } from "../datos/daos/interfaces/IPOSAccesoDatos";
import { ProductoCarritoDTO } from "./DTOsEntrada/ProductoCarritoDTO";
import { CrearVentaDTO } from "./DTOsEntrada/CrearVentaDTO";
import { VentaResumenDTO } from "./DTOsSalida/VentaResumenDTO";
import { ProductoVentaDTO } from "./DTOsSalida/ProductoVentaDTO";
import { CarritoBO } from "./BOs/CarritoBO";
import { ProductoBO } from "./BOs/ProductoBO";
import { VentaBO } from "./BOs/VentaBO";
import { IServicioVenta } from "./interfaces/IServicioVenta";

/**
 * Servicio central del Punto de Venta.
 * Actúa como fachada (Facade) orquestando las operaciones entre los Objetos de Negocio (BOs)
 * de Venta, Carrito y Producto.
 */
export class ServicioVenta implements IServicioVenta {
  private ventaBO: IVentaBO;
  private carritoBO: ICarritoBO;
  private productoBO: IProductoBO;

  /**
   * Inicializa el servicio instanciando los objetos de negocio.
   * * @param {IPOSAccesoDatos} accesoDatos - Interfaz de la capa de acceso a datos.
   */
  constructor(accesoDatos: IPOSAccesoDatos) {
    this.ventaBO = new VentaBO(accesoDatos);
    this.carritoBO = new CarritoBO();
    this.productoBO = new ProductoBO(accesoDatos);
  }

  /**
   * Filtra y busca productos en el catálogo disponible.
   * * @param {string} [busqueda] - Término opcional para filtrar por nombre o SKU.
   * @returns {Promise<ProductoVentaDTO[]>} Lista de productos encontrados.
   */
  async buscarProductos(busqueda?: string): Promise<ProductoVentaDTO[]> {
    return this.productoBO.filtrarCatalogo(busqueda);
  }

  /**
   * Agrega un producto al carrito en memoria.
   * * @param {ProductoCarritoDTO} producto - Producto a agregar al carrito.
   */
  agregarProductoCarrito(producto: ProductoCarritoDTO): void {
    this.carritoBO.agregar(producto);
  }

  /**
   * Elimina un producto específico del carrito.
   * * @param {string} idProducto - ID del producto a eliminar.
   */
  eliminarProductoCarrito(idProducto: string): void {
    this.carritoBO.eliminar(idProducto);
  }

  /**
   * Vacía completamente el carrito.
   */
  limpiarCarrito(): void {
    this.carritoBO.limpiar();
  }

  /**
   * Actualiza la cantidad de un producto existente en el carrito.
   * * @param {string} idProducto - ID del producto a actualizar.
   * @param {number} cantidad - Nueva cantidad del producto.
   */
  cambiarCantidad(idProducto: string, cantidad: number): void {
    this.carritoBO.cambiarCantidad(idProducto, cantidad);
  }

  /**
   * Obtiene el estado actual del carrito.
   * @returns {ProductoCarritoDTO[]} Lista de productos actualmente en el carrito.
   */
  obtenerCarrito(): ProductoCarritoDTO[] {
    return this.carritoBO.obtenerItems();
  }

  /**
   * Registra una transacción de venta en el sistema.
   * Realiza validaciones estructurales, verificación de stock y persiste la venta.
   * Al finalizar, publica un evento en la cola para actualizar el inventario.
   * @param {CrearVentaDTO} dto - Objeto con los datos necesarios para crear la venta.
   * @returns {Promise<VentaResumenDTO>} Resumen de la venta completada.
   * @throws {Error} Si hay fallos de validación o si el stock es insuficiente.
   */
  async registrarVenta(dto: CrearVentaDTO): Promise<VentaResumenDTO> {
    const erroresValidacion = this.ventaBO.validarVenta(dto);
    if (erroresValidacion.length > 0) {
      throw new Error(`Validación fallida: ${erroresValidacion.join(", ")}`);
    }

    const erroresStock = await this.ventaBO.verificarStock(dto.productos);
    if (erroresStock.length > 0) {
      const error: any = new Error("STOCK_INSUFICIENTE");
      error.detalles = erroresStock;
      throw error;
    }

    const resumen = await this.ventaBO.registrarVenta(dto);

    return resumen;
  }
}