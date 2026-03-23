import { IAccesoDatos } from "../datos/IAccesoDatos";
import { IServicioInventario } from "./interfaces/IServicioInventario";
import { CrearProductoDTO, ActualizarProductoDTO, FiltroProductoDTO } from "./DTOsEntrada/ProductoDTOs";
import { ProductoDTO, CategoriaDTO, MarcaDTO, SubCategoriaDTO, EtiquetaDTO } from "./DTOsSalida/ProductoDTOs";
import { ProductoBO } from "./BOs/ProductoBO";
import { CategoriaBO } from "./BOs/CategoriaBO";
import { MarcaBO } from "./BOs/MarcaBO";
import { SubCategoriaBO } from "./BOs/SubCategoriaBO";
import { EtiquetaBO } from "./BOs/EtiquetaBO";

export class ServicioInventario implements IServicioInventario {
  private productoBO: ProductoBO;
  private categoriaBO: CategoriaBO;
  private marcaBO: MarcaBO;
  private subCategoriaBO: SubCategoriaBO;
  private etiquetaBO: EtiquetaBO;

  constructor(private accesoDatos: IAccesoDatos) {
    this.productoBO = new ProductoBO(accesoDatos);
    this.categoriaBO = new CategoriaBO(accesoDatos);
    this.marcaBO = new MarcaBO(accesoDatos);
    this.subCategoriaBO = new SubCategoriaBO(accesoDatos);
    this.etiquetaBO = new EtiquetaBO(accesoDatos);
  }

  async obtenerProductos(filtro: FiltroProductoDTO): Promise<ProductoDTO[]> {
    return this.productoBO.obtenerTodos(filtro);
  }

  async obtenerProductoPorId(id: string): Promise<ProductoDTO | null> {
    return this.productoBO.obtenerPorId(id);
  }

  async crearProducto(producto: CrearProductoDTO): Promise<ProductoDTO> {
    return this.productoBO.crear(producto);
  }

  async actualizarProducto(producto: ActualizarProductoDTO): Promise<ProductoDTO> {
    return this.productoBO.actualizar(producto);
  }

  async eliminarProducto(id: string): Promise<boolean> {
    return this.productoBO.eliminar(id);
  }

  async ajustarStock(id: string, cantidad: number): Promise<boolean> {
    return this.productoBO.restarStock(id, cantidad);
  }

  async obtenerCategorias(): Promise<CategoriaDTO[]> {
    return this.categoriaBO.obtenerTodas();
  }

  async obtenerMarcas(): Promise<MarcaDTO[]> {
    return this.marcaBO.obtenerTodas();
  }

  async obtenerSubCategorias(): Promise<SubCategoriaDTO[]> {
    return this.subCategoriaBO.obtenerTodas();
  }

  async obtenerSubCategoriasPorCategoria(idCategoria: string): Promise<SubCategoriaDTO[]> {
    return this.subCategoriaBO.obtenerPorCategoria(idCategoria);
  }

  async agregarImagenes(idProducto: string, archivos: File[]): Promise<void> {
    return this.productoBO.agregarImagenes(idProducto, archivos);
  }

  async eliminarImagen(idImagen: string): Promise<boolean> {
    return this.productoBO.eliminarImagen(idImagen);
  }

  async obtenerEtiquetas(idProducto: string): Promise<EtiquetaDTO[]> {
    return this.etiquetaBO.obtenerPorProducto(idProducto);
  }

  async crearEtiqueta(etiqueta: EtiquetaDTO, idProducto: string): Promise<EtiquetaDTO> {
    const entity = { ...etiqueta, product_id: BigInt(idProducto) };
    return this.etiquetaBO.crear(entity as any);
  }

  async eliminarEtiqueta(idEtiqueta: string): Promise<boolean> {
    return this.etiquetaBO.eliminar(idEtiqueta);
  }
}