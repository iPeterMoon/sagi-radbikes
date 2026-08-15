import { ICatalogoAccesoDatos } from "../../datos/daos/interfaces/ICatalogoAccesoDatos";
import { IProductoBO } from "../interfaces/IProductoBO";
import {
  CrearProductoDTO,
  ActualizarProductoDTO,
  FiltroProductoDTO,
} from "../DTOsEntrada";
import { ProductoDTO } from "../DTOsSalida";
import { ProductoMapper } from "../mappers/ProductoMapper";

/**
 * Business Object de producto.
 * Encapsula toda la lógica de negocio relacionada con el catálogo de productos:
 * consulta, creación, actualización, eliminación, imágenes y stock.
 */
export class ProductoBO implements IProductoBO {
  /**
   * Constructor de la clase ProductoBO.
   *
   * @param accesoDatos Objeto centralizado que provee acceso a los distintos DAOs del catálogo.
   */
  constructor(private accesoDatos: ICatalogoAccesoDatos) {}

  /**
   * Obtiene todos los productos aplicando filtros opcionales.
   *
   * @param filtro Criterios de búsqueda (texto, categoría, marca, rango de precios).
   * @returns Un arreglo que contiene los DTOs de los productos que coinciden con los filtros.
   */
  async obtenerTodos(filtro: FiltroProductoDTO): Promise<ProductoDTO[]> {
    const categoriaId = filtro.idCategoria ? BigInt(filtro.idCategoria) : null;
    const marcaId = filtro.idMarca ? BigInt(filtro.idMarca) : null;
    const productos = await this.accesoDatos.productDAO.getByFilter(
      filtro.busqueda || "",
      categoriaId,
      marcaId,
      filtro.precioMin || null,
      filtro.precioMax || null,
    );
    return productos.map((p) => ProductoMapper.toDTO(p as any));
  }

  /**
   * Obtiene un producto por su identificador, incluyendo imágenes y relaciones.
   *
   * @param id ID del producto como string.
   * @returns El DTO del producto encontrado o nulo si no existe.
   */
  async obtenerPorId(id: string): Promise<ProductoDTO | null> {
    const producto = await this.accesoDatos.productDAO.getById(BigInt(id), {
      product_images: true,
      subcategory: { include: { categories: true } },
      brands: true,
      product_physical: true,
      product_variants: {
        include: { product_variant_attributes: true, product_images: true },
      },
    });
    return producto ? ProductoMapper.toDTO(producto as any) : null;
  }

  /**
   * Recupera todos los productos que pertenecen a una categoría específica.
   *
   * @param idCategoria El identificador único de la categoría en formato string.
   * @returns Un arreglo con los DTOs de los productos de dicha categoría.
   */
  async obtenerPorCategoria(idCategoria: string): Promise<ProductoDTO[]> {
    const productos = await this.accesoDatos.productDAO.getByCategory(
      BigInt(idCategoria),
    );
    return productos.map((p) => ProductoMapper.toDTO(p as any));
  }

  /**
   * Obtiene una lista de productos cuyo stock actual es menor al umbral especificado.
   *
   * @param umbral Cantidad mínima de stock de referencia.
   * @returns Un arreglo de DTOs de productos con bajo inventario.
   */
  async obtenerPorStockDebajoDe(umbral: number): Promise<ProductoDTO[]> {
    const productos = await this.accesoDatos.productDAO.getBelowStock(umbral);
    return productos.map((p) => ProductoMapper.toDTO(p as any));
  }

  /**
   * Crea un nuevo producto y, en la misma operación, su primera variante vendible
   * con un SKU generado automáticamente. Los valores de precio/stock/código de barras/stock
   * mínimo del DTO se usan como los de esa variante inicial; el producto solo conserva
   * `precio` y `minStock` como valores de referencia/plantilla.
   * Si el DTO incluye etiquetas, las asocia al producto creado.
   *
   * @param dto Datos del nuevo producto.
   * @returns El DTO del producto recién creado y registrado.
   */
  async crear(dto: CrearProductoDTO): Promise<ProductoDTO> {
    const entity = {
      name: dto.nombre,
      price: dto.precio,
      min_stock: dto.minStock ?? 0,
      description: dto.descripcion,
      brand_id: BigInt(dto.idMarca),
      subcategory_id: BigInt(dto.idSubCategoria),
      is_active: true,
    };
    const created = await this.accesoDatos.productDAO.create(entity);

    const sku = `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await this.accesoDatos.variantDAO.create({
      product_id: created.id,
      SKU: sku,
      barcode_upc: dto.codigoDeBarras || null,
      price: dto.precio,
      stock: dto.stock,
      min_stock: dto.minStock ?? 0,
      is_active: true,
    });

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
   * Actualiza los datos de referencia de un producto existente (nombre, precio y stock
   * mínimo de plantilla, descripción, marca y subcategoría). Ya no modifica stock, SKU
   * ni código de barras, que ahora viven exclusivamente en sus variantes.
   * Reemplaza completamente las etiquetas si se proveen en el DTO.
   *
   * @param dto Datos actualizados del producto, incluyendo su ID.
   * @returns El DTO del producto con su información actualizada.
   */
  async actualizar(dto: ActualizarProductoDTO): Promise<ProductoDTO> {
    const entity = {
      name: dto.nombre,
      price: dto.precio,
      min_stock: dto.minStock ?? 0,
      description: dto.descripcion,
      brand_id: BigInt(dto.idMarca),
      subcategory_id: BigInt(dto.idSubCategoria),
    };
    const updated = await this.accesoDatos.productDAO.update(
      BigInt(dto.idProducto),
      entity,
    );

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

    if (dto.imagenesEliminar && dto.imagenesEliminar.length > 0) {
      for (const idImagen of dto.imagenesEliminar) {
        await this.eliminarImagen(idImagen);
      }
    }

    return ProductoMapper.toDTO(updated as any);
  }

  /**
   * Elimina un producto y todas sus imágenes asociadas.
   *
   * @param id ID del producto a eliminar en formato string.
   * @returns Un valor booleano confirmando la eliminación exitosa.
   */
  async eliminar(id: string): Promise<boolean> {
    await this.accesoDatos.productDAO.delete(BigInt(id));
    // TODO: fix temporal, deberia eliminarse automáticamente por la relación en cascada
    await this.accesoDatos.productImageDAO.deleteByProduct(BigInt(id));
    return true;
  }

  /**
   * Sube y asocia nuevas imágenes a un producto en Supabase Storage. Si se indica
   * `idVariante`, las imágenes quedan asociadas a esa variante en particular.
   *
   * @param idProducto ID del producto destino.
   * @param archivos Archivos de imagen a subir provenientes de Multer.
   * @param mainImageIndex Índice opcional que indica cuál de los archivos es la imagen principal.
   * @param idVariante Identificador opcional de la variante a la que pertenecen las imágenes.
   * @returns Promesa vacía que se resuelve al terminar la subida y asociación de imágenes.
   */
  async agregarImagenes(
    idProducto: string,
    archivos: File[],
    mainImageIndex?: number,
    idVariante?: string,
  ): Promise<void> {
    for (let i = 0; i < archivos.length; i++) {
      const isMain = mainImageIndex !== undefined && i === mainImageIndex;
      await this.accesoDatos.productImageDAO.create(
        archivos[i],
        BigInt(idProducto),
        isMain,
        idVariante ? BigInt(idVariante) : undefined,
      );
    }
  }

  /**
   * Elimina una imagen específica del producto, tanto de la base de datos como del Storage.
   *
   * @param idImagen El identificador único de la imagen a eliminar.
   * @returns Un valor booleano indicando que la eliminación fue exitosa.
   */
  async eliminarImagen(idImagen: string): Promise<boolean> {
    await this.accesoDatos.productImageDAO.delete(BigInt(idImagen));
    return true;
  }

  /**
   * Establece una imagen existente como la imagen principal representativa del producto.
   *
   * @param idImagen El identificador único de la imagen que será la principal.
   * @returns Un valor booleano indicando que la actualización fue exitosa.
   */
  async establecerImagenPrincipal(idImagen: string): Promise<boolean> {
    return await this.accesoDatos.productImageDAO.setMain(BigInt(idImagen));
  }

  /**
   * Alterna el estado de activación de un producto (de activo a inactivo o viceversa).
   *
   * @param id El identificador único del producto.
   * @returns Un valor booleano confirmando si la actualización de estado fue exitosa.
   */
  async actualizarEstado(id: string): Promise<boolean> {
    const producto = await this.accesoDatos.productDAO.getById(BigInt(id));
    if (!producto) return false;
    await this.accesoDatos.productDAO.update(BigInt(id), {
      is_active: !producto.is_active,
    } as any);
    return true;
  }
}
