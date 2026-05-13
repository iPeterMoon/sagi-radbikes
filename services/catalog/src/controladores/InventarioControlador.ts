import { Request, Response } from "express";
import { IServicioInventario } from "../negocio/interfaces/IServicioInventario";

/** Safely extracts a single string from an Express query param. */
function qs(val: unknown): string {
  if (Array.isArray(val)) return String(val[0] ?? "");
  return String(val ?? "");
}
import {
  CrearProductoDTO,
  ActualizarProductoDTO,
  FiltroProductoDTO,
} from "../negocio/DTOsEntrada/ProductoDTOs";
import {
  CategoriaDTO,
  MarcaDTO,
  SubCategoriaDTO,
} from "../negocio/DTOsSalida/ProductoDTOs";
import { PrismaFactory } from "../datos/PrismaFactory";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export class InventarioControlador {
  constructor(private servicio: IServicioInventario) {}

  async obtenerProductos(req: Request, res: Response): Promise<void> {
    try {
      const filtro: FiltroProductoDTO = {
        busqueda: qs(req.query.busqueda),
        idCategoria: qs(req.query.idCategoria),
        idMarca: qs(req.query.idMarca),
        estadoStock: qs(req.query.estadoStock),
        idSubCategoria: qs(req.query.idSubCategoria),
        precioMin: Number(qs(req.query.precioMin)) || 0,
        precioMax: Number(qs(req.query.precioMax)) || 0,
      };
      const productos = await this.servicio.obtenerProductos(filtro);
      res.json(productos);
    } catch (error: any) {
      console.error("[obtenerProductos] ERROR:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async obtenerPorId(req: Request, res: Response): Promise<void> {
    try {
      const id = qs(req.params.id);
      const producto = await this.servicio.obtenerProductoPorId(id);
      if (!producto) {
        res.status(404).json({ error: "Producto no encontrado" });
        return;
      }
      res.json(producto);
    } catch (error: any) {
      console.error("[obtenerPorId] ERROR:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async crearProducto(req: Request, res: Response): Promise<void> {
    try {
      const dto: CrearProductoDTO = req.body;
      const prisma = PrismaFactory.getCliente();

      if (dto.idMarca && isNaN(Number(dto.idMarca))) {
        const brand = await prisma.brands.findFirst({ where: { name: dto.idMarca } });
        if (!brand) throw new Error(`La marca '${dto.idMarca}' no existe.`);
        dto.idMarca = brand.id.toString();
      }
      if (dto.idCategoria && isNaN(Number(dto.idCategoria))) {
        const category = await prisma.categories.findFirst({ where: { name: dto.idCategoria } });
        if (!category) throw new Error(`La categoría '${dto.idCategoria}' no existe.`);
        dto.idCategoria = category.id.toString();
      }
      if (dto.idSubCategoria && isNaN(Number(dto.idSubCategoria))) {
        const subcategory = await prisma.subcategory.findFirst({ where: { name: dto.idSubCategoria } });
        if (!subcategory) throw new Error(`La subcategoría '${dto.idSubCategoria}' no existe.`);
        dto.idSubCategoria = subcategory.id.toString();
      }

      const producto = await this.servicio.crearProducto(dto);
      res.status(201).json(producto);
    } catch (error: any) {
      console.error("[crearProducto] ERROR:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async actualizarProducto(req: Request, res: Response): Promise<void> {
    try {
      const dto: ActualizarProductoDTO = req.body;
      const prisma = PrismaFactory.getCliente();

      if (dto.idMarca && isNaN(Number(dto.idMarca))) {
        const brand = await prisma.brands.findFirst({ where: { name: dto.idMarca } });
        if (!brand) throw new Error(`La marca '${dto.idMarca}' no existe.`);
        dto.idMarca = brand.id.toString();
      }
      if (dto.idCategoria && isNaN(Number(dto.idCategoria))) {
        const category = await prisma.categories.findFirst({ where: { name: dto.idCategoria } });
        if (!category) throw new Error(`La categoría '${dto.idCategoria}' no existe.`);
        dto.idCategoria = category.id.toString();
      }
      if (dto.idSubCategoria && isNaN(Number(dto.idSubCategoria))) {
        const subcategory = await prisma.subcategory.findFirst({ where: { name: dto.idSubCategoria } });
        if (!subcategory) throw new Error(`La subcategoría '${dto.idSubCategoria}' no existe.`);
        dto.idSubCategoria = subcategory.id.toString();
      }

      const producto = await this.servicio.actualizarProducto(dto);
      res.json(producto);
    } catch (error: any) {
      console.error("[actualizarProducto] ERROR:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async eliminarProducto(req: Request, res: Response): Promise<void> {
    try {
      const id = qs(req.params.id);
      const result = await this.servicio.eliminarProducto(id);
      res.json({ success: result });
    } catch (error: any) {
      if (error.code === "P2003" || error.message.includes("Restrict")) {
        res.status(400).json({ error: "No se puede eliminar este producto porque tiene compras asociadas." });
        return;
      }
      res.status(500).json({ error: error.message });
    }
  }

  async ajustarStock(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body;
      const id = payload.id as string;
      if (!id) { res.status(400).json({ error: "Se requiere el id del producto" }); return; }

      let result = false;
      if (typeof payload.cantidad === "number") {
        result = await this.servicio.ajustarStock(id, payload.cantidad);
      } else if (payload.toggleActive) {
        result = await this.servicio.actualizarEstado(id);
      } else {
        res.status(400).json({ error: "Payload inválido" }); return;
      }
      res.json({ success: result });
    } catch (error: any) {
      console.error("[ajustarStock] ERROR:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async obtenerCategorias(_req: Request, res: Response): Promise<void> {
    try {
      res.json(await this.servicio.obtenerCategorias());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async crearCategoria(req: Request, res: Response): Promise<void> {
    try {
      res.status(201).json(await this.servicio.crearCategoria(req.body as CategoriaDTO));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async obtenerMarcas(_req: Request, res: Response): Promise<void> {
    try {
      res.json(await this.servicio.obtenerMarcas());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async crearMarca(req: Request, res: Response): Promise<void> {
    try {
      res.status(201).json(await this.servicio.crearMarca(req.body as MarcaDTO));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async obtenerSubCategorias(req: Request, res: Response): Promise<void> {
    try {
      const idCategoria = qs(req.query.idCategoria);
      const result = idCategoria
        ? await this.servicio.obtenerSubCategoriasPorCategoria(idCategoria)
        : await this.servicio.obtenerSubCategorias();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async crearSubCategoria(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, idCategoria } = req.body;
      if (!nombre || !idCategoria) { res.status(400).json({ error: "Se requiere nombre e idCategoria" }); return; }
      const sub: SubCategoriaDTO = { idSubCategoria: "", nombre, idCategoria };
      res.status(201).json(await this.servicio.crearSubCategoria(sub));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async obtenerEtiquetas(req: Request, res: Response): Promise<void> {
    try {
        const productoId = qs(req.params.productoId);
      res.json(await this.servicio.obtenerEtiquetas(productoId));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async crearEtiqueta(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, valor, idProducto } = req.body;
      if (!nombre || !valor || !idProducto) {
        res.status(400).json({ error: "Se requieren nombre, valor e idProducto" });
        return;
      }
      const etiqueta = { nombre, valor, idProducto };
      res.status(201).json(await this.servicio.crearEtiqueta(etiqueta));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async eliminarEtiqueta(req: Request, res: Response): Promise<void> {
    try {
      const id = qs(req.params.id);
      res.json({ success: await this.servicio.eliminarEtiqueta(id) });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async agregarImagenes(req: Request, res: Response): Promise<void> {
    try {
      const productoId = qs(req.params.id);
      const archivos = (req.files ?? []) as Express.Multer.File[];
      if (!productoId) {
        res.status(400).json({ error: "El ID del producto es requerido" });
        return;
      }
      if (archivos.length === 0) {
        res.status(400).json({ error: "No se encontraron archivos de imagen" });
        return;
      }

      const mainImageIndex = req.body?.mainImageIndex
        ? Number(req.body.mainImageIndex)
        : undefined;

      await this.servicio.agregarImagenes(productoId, archivos, mainImageIndex);
      res.status(201).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async eliminarImagen(req: Request, res: Response): Promise<void> {
    try {
      const id = qs(req.params.id);
      res.json({ success: await this.servicio.eliminarImagen(id) });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async establecerImagenPrincipal(req: Request, res: Response): Promise<void> {
    try {
      const id = qs(req.params.id);
      res.json({ success: await this.servicio.establecerImagenPrincipal(id) });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}