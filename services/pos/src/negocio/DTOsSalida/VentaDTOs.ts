export interface CategoriaDTO {
  idCategoria: string;
  nombre: string;
}

export interface ProductoVentaDTO {
  idProducto: string;
  nombre: string;
  precio: number;
  stock: number;
  descripcion: string;
  SKU: string;
  codigoBarras: string;
  urlImagen: string;
  categoria: CategoriaDTO;
}

export interface PagoDTO {
  idPago: string;
  metodoPago: string;
  monto: number;
  fechaHora: Date;
  idVenta: string;
}

export interface VentaResumenDTO {
  idVenta: string;
  total: number;
  mensaje: string;
  estado: string;
  fecha: Date;
  folio: string;
  subtotal: number;
  importeIVA: number;
  porcentajeImpuesto: number;
  pago: PagoDTO;
}
