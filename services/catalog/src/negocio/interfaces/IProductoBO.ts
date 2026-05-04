import { CrearProductoDTO, ActualizarProductoDTO, FiltroProductoDTO } from "../DTOsEntrada/ProductoDTOs";
import { ProductoDTO } from "../DTOsSalida/ProductoDTOs";

export interface IProductoBO {
  obtenerTodos(filtro: FiltroProductoDTO): Promise<ProductoDTO[]>;
  obtenerPorId(id: string): Promise<ProductoDTO | null>;
  obtenerPorCategoria(idCategoria: string): Promise<ProductoDTO[]>;
  obtenerPorStockDebajoDe(umbral: number): Promise<ProductoDTO[]>;
  crear(producto: CrearProductoDTO): Promise<ProductoDTO>;
  actualizar(producto: ActualizarProductoDTO): Promise<ProductoDTO>;
  eliminar(id: string): Promise<boolean>;
  restarStock(id: string, cantidad: number): Promise<boolean>;
  agregarImagenes(idProducto: string, archivos: File[]): Promise<void>;
  eliminarImagen(idImagen: string): Promise<boolean>;
  establecerImagenPrincipal(idImagen: string): Promise<boolean>;
  actualizarEstado(id: string): Promise<boolean>;
}