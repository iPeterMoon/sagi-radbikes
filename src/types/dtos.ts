export type {
  LoginDTO,
  NuevoRolDTO,
  NuevoUsuarioDTO,
  ActualizarUsuarioDTO,
} from "@/lib/auth/negocio/DTOsEntrada";
export type {
  RolDTO,
  SesionDTO,
  UsuarioDTO,
} from "@/lib/auth/negocio/DTOsSalida";
export { EstadoStock } from "@/lib/inventory/negocio/enums/EstadoStock";
export type {
  CategoriaDTO,
  MarcaDTO,
  SubCategoriaDTO,
  ImagenProductoDTO,
  EtiquetaDTO,
  AtributoVarianteDTO,
  VarianteDTO,
  ProductoDTO,
} from "@/lib/inventory/negocio/DTOsSalida";
export type {
  CrearProductoDTO,
  ActualizarProductoDTO,
  FiltroProductoDTO,
  CrearEtiquetaDTO,
  CrearVarianteDTO,
  ActualizarVarianteDTO,
  CrearAtributoVarianteDTO,
} from "@/lib/inventory/negocio/DTOsEntrada";
export type {
  CrearVentaDTO,
  ProductoCarritoDTO,
} from "@/lib/pos/negocio/DTOsEntrada";
export type {
  DetalleStockDTO,
  PagoDTO,
  ProductoVentaDTO,
  VentaResumenDTO,
} from "@/lib/pos/negocio/DTOsSalida"
