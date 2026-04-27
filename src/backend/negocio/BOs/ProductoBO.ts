import { IAccesoDatos } from "../../datos/IAccesoDatos";
import { IProductoBO } from "../interfaces/IProductoBO";
import { CrearProductoDTO, ActualizarProductoDTO, FiltroProductoDTO } from "../DTOsEntrada/ProductoDTOs";
import { ProductoDTO } from "../DTOsSalida/ProductoDTOs";
import { ProductoMapper } from "../mappers/ProductoMapper";

/**
 * Business Object de producto.
 * Encapsula toda la lógica de negocio relacionada con el catálogo de productos:
 * consulta, creación, actualización, eliminación, imágenes y stock.
 */
export class ProductoBO implements IProductoBO {
  constructor(private accesoDatos: IAccesoDatos) {}

  /**
   * Obtiene todos los productos aplicando filtros opcionales.
   * @param filtro - Criterios de búsqueda (texto, categoría, marca, rango de precios)
   */
  async obtenerTodos(filtro: FiltroProductoDTO): Promise<ProductoDTO[]> {
    const categoriaId = filtro.idCategoria ? BigInt(filtro.idCategoria) : null;
    const marcaId = filtro.idMarca ? BigInt(filtro.idMarca) : null;
    const productos = await this.accesoDatos.productDAO.getByFilter(
      filtro.busqueda || "",
      categoriaId,
      marcaId,
      filtro.precioMin || null,
      filtro.precioMax || null
    );
    return productos.map((p) => ProductoMapper.toDTO(p as any));
  }

  /**
   * Obtiene un producto por su identificador, incluyendo imágenes y relaciones.
   * @param id - ID del producto como string
   */
  async obtenerPorId(id: string): Promise<ProductoDTO | null> {
    const producto = await this.accesoDatos.productDAO.getById(BigInt(id), {
      include: { product_images: true, subcategory: { include: { categories: true } }, brand: true, product_physical: true },
    });
    return producto ? ProductoMapper.toDTO(producto as any) : null;
  }

  async obtenerPorCategoria(idCategoria: string): Promise<ProductoDTO[]> {
    const productos = await this.accesoDatos.productDAO.getByCategory(BigInt(idCategoria));
    return productos.map((p) => ProductoMapper.toDTO(p as any));
  }

  async obtenerPorStockDebajoDe(umbral: number): Promise<ProductoDTO[]> {
    const productos = await this.accesoDatos.productDAO.getBelowStock(umbral);
    return productos.map((p) => ProductoMapper.toDTO(p as any));
  }

  /**
   * Crea un nuevo producto generando un SKU único automáticamente.
   * Si el DTO incluye etiquetas, las asocia al producto creado.
   * @param dto - Datos del nuevo producto
   */
  async crear(dto: CrearProductoDTO): Promise<ProductoDTO> {
    const sku = `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const entity = {
      name: dto.nombre,
      price: dto.precio,
      stock: dto.stock,
      description: dto.descripcion,
      SKU: sku,
      brand_id: BigInt(dto.idMarca),
      subcategory_id: BigInt(dto.idSubCategoria),
      is_active: true,
    };
    const created = await this.accesoDatos.productDAO.create(entity);

    if (dto.etiquetas) {
      for (const etiqueta of dto.etiquetas) {
        await this.accesoDatos.labelDAO.create({
          name: etiqueta.name,
          value: etiqueta.value,
          product_id: created.id,
        });
      }
    }

    return ProductoMapper.toDTO(created as any);
  }

  /**
   * Actualiza los datos de un producto existente.
   * Reemplaza completamente las etiquetas si se proveen en el DTO.
   * @param dto - Datos actualizados del producto, incluyendo su ID
   */
  async actualizar(dto: ActualizarProductoDTO): Promise<ProductoDTO> {
    const entity = {
      name: dto.nombre,
      price: dto.precio,
      stock: dto.stock,
      description: dto.descripcion,
      brand_id: BigInt(dto.idMarca),
      subcategory_id: BigInt(dto.idSubCategoria),
    };
    const updated = await this.accesoDatos.productDAO.update(BigInt(dto.idProducto), entity);

    if (dto.etiquetas) {
      await this.accesoDatos.labelDAO.deleteByProduct(BigInt(dto.idProducto));
      for (const etiqueta of dto.etiquetas) {
        await this.accesoDatos.labelDAO.create({
          name: etiqueta.name,
          value: etiqueta.value,
          product_id: updated.id,
        });
      }
    }

    return ProductoMapper.toDTO(updated as any);
  }

  /**
   * Elimina un producto y todas sus imágenes asociadas.
   * @param id - ID del producto a eliminar
   */
  async eliminar(id: string): Promise<boolean> {
    await this.accesoDatos.productImageDAO.deleteByProduct(BigInt(id));
    await this.accesoDatos.productDAO.delete(BigInt(id));
    return true;
  }

  async restarStock(id: string, cantidad: number): Promise<boolean> {
    return await this.accesoDatos.productDAO.decreaseStock(BigInt(id), cantidad);
  }

  /**
   * Sube y asocia nuevas imágenes a un producto en Supabase Storage.
   * @param idProducto - ID del producto destino
   * @param archivos - Archivos de imagen a subir
   */
  async agregarImagenes(idProducto: string, archivos: File[]): Promise<void> {
    for (const archivo of archivos) {
      await this.accesoDatos.productImageDAO.create(archivo, BigInt(idProducto));
    }
  }

  async eliminarImagen(idImagen: string): Promise<boolean> {
    await this.accesoDatos.productImageDAO.delete(BigInt(idImagen));
    return true;
  }

  async establecerImagenPrincipal(idImagen: string): Promise<boolean> {
    return await this.accesoDatos.productImageDAO.setMain(BigInt(idImagen));
  }

  async actualizarEstado(id: string): Promise<boolean> {
    const producto = await this.accesoDatos.productDAO.getById(BigInt(id));
    if (!producto) return false;
    await this.accesoDatos.productDAO.update(BigInt(id), { is_active: !producto.is_active } as any);
    return true;
  }
}