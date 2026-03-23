export type StockStatus = "NORMAL" | "BAJO" | "CRÍTICO";

export type ModalType =
  | { type: "add" }
  | { type: "edit"; product: Product }
  | { type: "delete"; product: Product }
  | { type: "sales-error"; product: Product }
  | { type: "success-add" }
  | { type: "success-delete" }
  | null;

export interface ProductTag {
  name: string;
  value: string;
}

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
  minStock: number;
  description: string;
  tags: ProductTag[];
  active: boolean;
  image: string;
  hasSalesHistory: boolean;
}

export interface ProductFormData extends Omit<
  Product,
  "id" | "hasSalesHistory" | "image"
> {
  id?: number;
}

export interface BadgeProps {
  status: StockStatus;
}

export interface ToggleProps {
  checked: boolean;
  onChange: () => void;
}

export interface SidebarProps {
  active: string;
  open: boolean;
}

export interface TopbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggle: (id: number) => void;
}

export interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (
    data: Product,
    newImages: File[],
    attributeIds?: { brandId: string; categoryId: string; subcategoryId: string }
  ) => void;
}

export interface DeleteConfirmModalProps {
  product: Product;
  onClose: () => void;
  onConfirm: () => void;
}

export interface SalesHistoryErrorModalProps {
  product: Product;
  onClose: () => void;
}

export interface SuccessModalProps {
  type: "add" | "delete";
  onClose: () => void;
  onContinue?: () => void;
}
