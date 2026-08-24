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
  | { type: "sales-history-error"; title: string; subtitle: string; infoText: string; suggestionText: string }
  | { type: "success-add"; productImage?: string }
  | { type: "success-edit"; productImage?: string }
  | { type: "success-delete" }
  | null;

/** Atributo clave-valor de un producto o variante (ej. color, talla). */
export interface ProductTag {
  name: string;
  value: string;
}

/** Variante vendible de un producto (SKU, precio y stock autoritativos). */
export interface ProductVariant {
  id: number;
  sku: string;
  barcode: string;
  price: number;
  cost: number;
  stock: number;
  /** `null` cuando las notificaciones de stock bajo están desactivadas para esta variante. */
  minStock: number | null;
  active: boolean;
  /** URL de la imagen principal de la variante (si no tiene, usar la imagen general del producto). */
  image: string;
  attributes: ProductTag[];
}

/** Modelo de producto usado en la capa de presentación del catálogo. */
export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  /** Precio de referencia/plantilla, usado para pre-llenar el precio al crear una variante. */
  referencePrice: number;
  /** Costo de referencia/plantilla, usado para pre-llenar el costo al crear una variante. */
  referenceCost: number;
  /** Stock mínimo de referencia/plantilla, usado para pre-llenar el stock mínimo al crear una variante. */
  referenceMinStock: number;
  description: string;
  tags: ProductTag[];
  /** Indica si el producto está activo y visible en el catálogo. */
  active: boolean;
  /** URL de la imagen principal. */
  image: string;
  /** Variantes vendibles del producto (SKU, precio y stock autoritativos). */
  variants: ProductVariant[];
}

/** Datos del formulario de producto (sin campos generados por el servidor). */
export interface ProductFormData extends Omit<
  Product,
  "id" | "image"
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
  onLogout?: () => void;
}

/** Props del componente `Topbar`. */
export interface TopbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

/** Campo por el cual se puede ordenar la tabla de productos. */
export type ProductSortKey = "nombre" | "precio" | "stock" | "estado";

/** Dirección de ordenamiento de la tabla de productos. */
export type SortDirection = "asc" | "desc";

/** Props de la tabla de productos. */
export interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggle: (id: number) => void;
  sortKey: ProductSortKey;
  sortDirection: SortDirection;
  onSort: (key: ProductSortKey) => void;
}

/** Props del modal de creación/edición de producto. */
export interface ProductFormModalProps {
  product: Product | null;
  existingProducts: Product[];
  onClose: () => void;
  onSave: (
    data: Product,
    newImages: File[],
    attributeIds?: {
      brandId: string;
      categoryId: string;
      subcategoryId: string;
      mainImageIndex?: number;
      newMainImageId?: string; // ID of the new main image (when changing from original images)
      deletedImageIds?: string[];
    },
  ) => void;
}

/** Props del modal de confirmación de eliminación. */
export interface DeleteConfirmModalProps {
  product: Product;
  onClose: () => void;
  onConfirm: () => void;
}

/** Props del modal de retroalimentación (alta o baja exitosa). */
export interface SuccessModalProps {
  type: "add" | "delete";
  onClose: () => void;
  onContinue?: () => void;
}
