import { IAccesoDatos } from "../../datos/IAccesoDatos";
import { IProductoBO } from "../interfaces/IProductoBO";
import {
  CrearProductoDTO,
  ActualizarProductoDTO,
  FiltroProductoDTO,
} from "../DTOsEntrada/ProductoDTOs";
import { ProductoDTO } from "../DTOsSalida/ProductoDTOs";
import { ProductoMapper } from "../mappers/ProductoMapper";

export class ProductoBO implements IProductoBO {
  constructor(private accesoDatos: IAccesoDatos) {}

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

  async obtenerPorId(id: string): Promise<ProductoDTO | null> {
    const producto = await this.accesoDatos.productDAO.getById(BigInt(id), {
      product_images: true,
      subcategory: { include: { categories: true } },
      brands: true,
      product_physical: true,
    });
    return producto ? ProductoMapper.toDTO(producto as any) : null;
  }

  async obtenerPorCategoria(idCategoria: string): Promise<ProductoDTO[]> {
    const productos = await this.accesoDatos.productDAO.getByCategory(
      BigInt(idCategoria),
    );
    return productos.map((p) => ProductoMapper.toDTO(p as any));
  }

  async obtenerPorStockDebajoDe(umbral: number): Promise<ProductoDTO[]> {
    const productos = await this.accesoDatos.productDAO.getBelowStock(umbral);
    return productos.map((p) => ProductoMapper.toDTO(p as any));
  }

  async crear(dto: CrearProductoDTO): Promise<ProductoDTO> {
    const sku = `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const entity = {
      name: dto.nombre,
      price: dto.precio,
      stock: dto.stock,
      barcode_upc: dto.codigoDeBarras || null,
      min_stock: dto.minStock ?? 0,
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

  async actualizar(dto: ActualizarProductoDTO): Promise<ProductoDTO> {
    const entity = {
      name: dto.nombre,
      price: dto.precio,
      stock: dto.stock,
      barcode_upc: dto.codigoDeBarras || null,
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

    return ProductoMapper.toDTO(updated as any);
  }

  async eliminar(id: string): Promise<boolean> {
    await this.accesoDatos.productImageDAO.deleteByProduct(BigInt(id));
    await this.accesoDatos.productDAO.delete(BigInt(id));
    return true;
  }

  async restarStock(id: string, cantidad: number): Promise<boolean> {
    return await this.accesoDatos.productDAO.decreaseStock(
      BigInt(id),
      cantidad,
    );
  }

  async agregarImagenes(
    idProducto: string,
    archivos: File[],
    mainImageIndex?: number,
  ): Promise<void> {
    for (let i = 0; i < archivos.length; i++) {
      const isMain = mainImageIndex !== undefined && i === mainImageIndex;
      await this.accesoDatos.productImageDAO.create(
        archivos[i],
        BigInt(idProducto),
        isMain,
      );
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
    await this.accesoDatos.productDAO.update(BigInt(id), {
      is_active: !producto.is_active,
    } as any);
    return true;
  }
}
