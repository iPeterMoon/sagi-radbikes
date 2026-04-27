import { CrearProductoDTO, ActualizarProductoDTO, FiltroProductoDTO } from "../DTOsEntrada/ProductoDTOs";
import { ProductoDTO, CategoriaDTO, MarcaDTO, SubCategoriaDTO, EtiquetaDTO } from "../DTOsSalida/ProductoDTOs";

export interface IServicioInventario {
  obtenerProductos(filtro: FiltroProductoDTO): Promise<ProductoDTO[]>;
  obtenerProductoPorId(id: string): Promise<ProductoDTO | null>;
  crearProducto(producto: CrearProductoDTO): Promise<ProductoDTO>;
  actualizarProducto(producto: ActualizarProductoDTO): Promise<ProductoDTO>;
  eliminarProducto(id: string): Promise<boolean>;
  ajustarStock(id: string, cantidad: number): Promise<boolean>;
  actualizarEstado(id: string): Promise<boolean>;
  obtenerCategorias(): Promise<CategoriaDTO[]>;
  obtenerMarcas(): Promise<MarcaDTO[]>;
  obtenerSubCategorias(): Promise<SubCategoriaDTO[]>;
  obtenerSubCategoriasPorCategoria(idCategoria: string): Promise<SubCategoriaDTO[]>;

  crearCategoria(categoria: CategoriaDTO): Promise<CategoriaDTO>;
  crearMarca(marca: MarcaDTO): Promise<MarcaDTO>;
  crearSubCategoria(subCategoria: SubCategoriaDTO): Promise<SubCategoriaDTO>;

  agregarImagenes(idProducto: string, archivos: File[]): Promise<void>;
  eliminarImagen(idImagen: string): Promise<boolean>;
  obtenerEtiquetas(idProducto: string): Promise<EtiquetaDTO[]>;
  crearEtiqueta(etiqueta: EtiquetaDTO, idProducto: string): Promise<EtiquetaDTO>;
  eliminarEtiqueta(idEtiqueta: string): Promise<boolean>;
}