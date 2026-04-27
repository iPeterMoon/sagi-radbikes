/** Estado de stock de un producto. */
export type StockStatus = "NORMAL" | "BAJO" | "CRÍTICO";

/**
 * Tipo discriminado para controlar qué modal se muestra en la página de catálogo.
 * `null` significa que ningún modal está visible.
 */
export type ModalType =
  | { type: "add" }
  | { type: "edit"; product: Product }
  | { type: "delete"; product: Product }
  | { type: "sales-error"; product: Product }
  | { type: "success-add" }
  | { type: "success-delete" }
  | null;

/** Atributo clave-valor de un producto (ej. color, talla). */
export interface ProductTag {
  name: string;
  value: string;
}

/** Modelo de producto usado en la capa de presentación del catálogo. */
export interface Product {
  id: number;
  name: string;
  sku: string;
  barcode: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  stock: number;
  /** Stock mínimo para alertas. */
  minStock: number;
  description: string;
  tags: ProductTag[];
  /** Indica si el producto está activo y visible en el catálogo. */
  active: boolean;
  /** URL de la imagen principal. */
  image: string;
  /** Indica si el producto tiene historial de ventas (bloquea eliminación). */
  hasSalesHistory: boolean;
}

/** Datos del formulario de producto (sin campos generados por el servidor). */
export interface ProductFormData extends Omit<
  Product,
  "id" | "hasSalesHistory" | "image"
> {
  id?: number;
}

/** Props del componente `Badge` de estado de stock. */
export interface BadgeProps {
  status: StockStatus;
}

/** Props del componente `Toggle`. */
export interface ToggleProps {
  checked: boolean;
  onChange: () => void;
}

/** Props del componente `Sidebar`. */
export interface SidebarProps {
  /** Identificador de la sección activa (ej. "catalogo", "pos"). */
  active: string;
  /** Si el sidebar está expandido. */
  open: boolean;
}

/** Props del componente `Topbar`. */
export interface TopbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

/** Props de la tabla de productos. */
export interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggle: (id: number) => void;
}

/** Props del modal de creación/edición de producto. */
export interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (
    data: Product,
    newImages: File[],
    attributeIds?: { brandId: string; categoryId: string; subcategoryId: string }
  ) => void;
}

/** Props del modal de confirmación de eliminación. */
export interface DeleteConfirmModalProps {
  product: Product;
  onClose: () => void;
  onConfirm: () => void;
}

/** Props del modal de error por historial de ventas. */
export interface SalesHistoryErrorModalProps {
  product: Product;
  onClose: () => void;
}

/** Props del modal de retroalimentación (alta o baja exitosa). */
export interface SuccessModalProps {
  type: "add" | "delete";
  onClose: () => void;
  onContinue?: () => void;
}
