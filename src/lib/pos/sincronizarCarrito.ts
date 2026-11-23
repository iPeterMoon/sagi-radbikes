import type { ProductoCarritoDTO } from "@/types/dtos";
import type { CartItem, POSProduct } from "@/types/pos";
import { redondearMonto, TASA_IVA } from "./impuestos";

/**
 * Convierte un ítem del carrito del servidor al modelo usado por el POS.
 *
 * Carritos creados antes de la refactorización pueden no traer
 * `precioIncluyeIVA`: en ese caso se infiere de un porcentaje 0 (antes
 * significaba "precio final").
 */
export function mapCarritoItem(item: ProductoCarritoDTO): CartItem {
  const precioIncluyeIVA =
    item.precioIncluyeIVA ?? ((item.porcentajeImpuesto ?? TASA_IVA) === 0);

  return {
    product: {
      id: Number(item.idVariante),
      name: item.nombre,
      category: "Sin categoría",
      price: item.precioUnitario,
      calcularIVA: !precioIncluyeIVA,
      stock: 0,
      image: item.urlImagen || "/placeholder.png",
      sku: "",
      barcodeUpc: "",
    },
    qty: item.cantidad,
  };
}

/**
 * Rehidrata el carrito con el precio y la regla de IVA vigentes en el
 * catálogo. La regla y el precio se capturan al agregar el producto, así que
 * sin esto un cambio en el catálogo no se refleja en lo que el cliente ve ni
 * en lo que se cobra.
 *
 * Si la variante ya no está en el catálogo se conserva el snapshot original
 * (producto dado de baja entre que se agregó y se sincronizó).
 */
export function sincronizarCarrito(
  cart: CartItem[],
  catalogo: POSProduct[],
): CartItem[] {
  const productos = new Map(catalogo.map((p) => [p.id, p]));

  return cart.map((item) => {
    const vigente = productos.get(item.product.id);
    if (!vigente) return item;

    return {
      ...item,
      product: {
        ...item.product,
        name: vigente.name,
        category: vigente.category,
        price: vigente.price,
        calcularIVA: vigente.calcularIVA,
        stock: vigente.stock,
        image: vigente.image,
        sku: vigente.sku,
        barcodeUpc: vigente.barcodeUpc,
        ...(vigente.variantAttributes
          ? { variantAttributes: vigente.variantAttributes }
          : {}),
        ...(vigente.parentProductId !== undefined
          ? { parentProductId: vigente.parentProductId }
          : {}),
      },
    };
  });
}

/**
 * Arma las líneas del DTO de venta tomando precio y regla del catálogo
 * vigente, en lugar de los valores guardados al agregar al carrito.
 */
export function prepararProductosVenta(
  cart: CartItem[],
  catalogo: POSProduct[],
): ProductoCarritoDTO[] {
  const productos = new Map(catalogo.map((p) => [p.id, p]));

  return cart.map((item) => {
    const vigente = productos.get(item.product.id);
    const price = vigente?.price ?? item.product.price;
    const calcularIVA = vigente?.calcularIVA ?? item.product.calcularIVA;

    return {
      idVariante: String(item.product.id),
      nombre: vigente?.name ?? item.product.name,
      cantidad: item.qty,
      precioUnitario: price,
      subtotal: redondearMonto(price * item.qty),
      urlImagen: vigente?.image ?? item.product.image,
      porcentajeImpuesto: TASA_IVA,
      precioIncluyeIVA: !calcularIVA,
    };
  });
}
