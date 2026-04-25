"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import { Product, ProductTag, ProductFormModalProps } from "@/types/inventory";
import { inventarioApi } from "@/lib/api/inventario";
import AddAttributeModal, { AttributeType } from "./AddAttributeModal";

type CategoryOption = { idCategoria: string; nombre: string };
type BrandOption = { idMarca: string; nombre: string };
import {
  IconX,
  IconTag,
  IconBarcode,
  IconLayers,
  IconGrid,
  IconHash,
  IconBox,
  IconAlertTri,
  IconPlus,
  IconUpload,
} from "@/components/ui/Icons";

const twField =
  "w-full py-[9px] px-3 border border-gray-200 rounded-lg text-[13px] text-gray-900 outline-none bg-white box-border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
const twLabel = "text-xs font-semibold text-gray-700 mb-1 block";
const twSection = "bg-gray-50 border border-gray-200 rounded-[10px] p-4 mb-3";
const twAddBtn =
  "w-9 h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-blue-600 shrink-0 hover:bg-gray-50 hover:border-blue-300 transition-colors cursor-pointer";

function FieldWithIcon({
  icon,
  children,
  className = "",
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 flex items-center pointer-events-none">
        {icon}
      </span>
      {children}
    </div>
  );
}

export default function ProductFormModal({
  product,
  onClose,
  onSave,
}: ProductFormModalProps) {
  const isEdit = !!product;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Omit<Product, "id" | "hasSalesHistory">>(
    product
      ? { ...product }
      : {
          name: "",
          sku: "",
          barcode: "",
          brand: "",
          category: "",
          subcategory: "",
          price: 0,
          stock: 0,
          minStock: 5,
          description: "",
          tags: [],
          active: true,
          image: "",
        },
  );

  // IDs para mapear nombres a IDs
  const [brandId, setBrandId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [subcategoryId, setSubcategoryId] = useState<string>("");

  const [localBrands, setLocalBrands] = useState<BrandOption[]>([]);
  const [localCategories, setLocalCategories] = useState<CategoryOption[]>([]);
  const [localSubcategories, setLocalSubcategories] =
    useState<Record<string, string[]>>({});
  const [localSubcategoriesWithIds, setLocalSubcategoriesWithIds] =
    useState<Record<string, Array<{ id: string; nombre: string }>>>({});

  useEffect(() => {
    const loadAttributes = async () => {
      try {
        const [brands, categories, subcategories] = await Promise.all([
          inventarioApi.obtenerMarcas(),
          inventarioApi.obtenerCategorias(),
          inventarioApi.obtenerSubCategorias(),
        ]);

        const brandsList: BrandOption[] = brands.map((b) => ({
          idMarca: b.idMarca,
          nombre: b.nombre,
        }));

        const categoriesList: CategoryOption[] = categories.map((c) => ({
          idCategoria: c.idCategoria,
          nombre: c.nombre,
        }));

        const subcategoriesMap: Record<string, Array<{ id: string; nombre: string }>> = {};
        subcategories.forEach((sc) => {
          const categoryId = sc.idCategoria;
          if (!subcategoriesMap[categoryId]) {
            subcategoriesMap[categoryId] = [];
          }
          if (!subcategoriesMap[categoryId].some((s) => s.nombre === sc.nombre)) {
            subcategoriesMap[categoryId].push({ id: sc.idSubCategoria, nombre: sc.nombre });
          }
        });

        setLocalBrands(brandsList);
        setLocalCategories(categoriesList);
        setLocalSubcategoriesWithIds(subcategoriesMap);

        // Legacy map for backward compatibility
        const subcategoriesLegacy: Record<string, string[]> = {};
        subcategories.forEach((sc) => {
          const categoryName =
            categories.find((c) => c.idCategoria === sc.idCategoria)?.nombre ||
            sc.idCategoria;
          if (!subcategoriesLegacy[categoryName]) {
            subcategoriesLegacy[categoryName] = [];
          }
          if (!subcategoriesLegacy[categoryName].includes(sc.nombre)) {
            subcategoriesLegacy[categoryName].push(sc.nombre);
          }
        });
        setLocalSubcategories(subcategoriesLegacy);

        // Si estamos en modo edición, establecer los IDs
        if (product) {
          // Buscar ID de marca
          const brandMatch = brandsList.find((b) => b.nombre === product.brand);
          if (brandMatch) {
            setBrandId(brandMatch.idMarca);
          }

          // Buscar ID de categoría
          const categoryMatch = categoriesList.find((c) => c.nombre === product.category);
          if (categoryMatch) {
            setCategoryId(categoryMatch.idCategoria);
            
            // Buscar ID de subcategoría
            const subMatch = subcategoriesMap[categoryMatch.idCategoria]?.find(
              (s) => s.nombre === product.subcategory
            );
            if (subMatch) {
              setSubcategoryId(subMatch.id);
            }
          }
        }
      } catch (error) {
        console.error("Error loading product attributes:", error);
      }
    };

    loadAttributes();
  }, [product]);

  // Estado del nuevo Modal Externo
  const [activeSubModal, setActiveSubModal] = useState<AttributeType>(null);

  const [imagesList, setImagesList] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<{ src: string; file: File }[]>([]);
  const [originalImages] = useState<string[]>(
    form.image ? [form.image] : [],
  );

  const [tagName, setTagName] = useState("");
  const [tagValue, setTagValue] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof Product, string>>>(
    {},
  );

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const addTag = () => {
    if (!tagName.trim() || !tagValue.trim()) return;
    set("tags", [
      ...form.tags,
      { name: tagName.trim(), value: tagValue.trim() },
    ]);
    setTagName("");
    setTagValue("");
  };

  const removeTag = (index: number) =>
    set(
      "tags",
      form.tags.filter((_, i) => i !== index),
    );

  const handleSaveAttribute = async (value: string, parentCat?: string) => {
    if (!value.trim()) return;

    try {
      if (activeSubModal === "brand") {
        const created = await inventarioApi.crearMarca({ nombre: value.trim() });
        setLocalBrands((prev) => {
          if (prev.some((b) => b.nombre === created.nombre)) return prev;
          return [...prev, created];
        });
        setBrandId(created.idMarca);
        set("brand", created.nombre);
      } else if (activeSubModal === "category") {
        const created = await inventarioApi.crearCategoria({
          nombre: value.trim(),
          descripcion: "",
        });
        setLocalCategories((prev) => {
          if (prev.some((c) => c.nombre === created.nombre)) return prev;
          return [...prev, created];
        });
        setLocalSubcategories((prev) => ({
          ...prev,
          [created.nombre]: prev[created.nombre] ?? [],
        }));
        setLocalSubcategoriesWithIds((prev) => ({
          ...prev,
          [created.idCategoria]: prev[created.idCategoria] ?? [],
        }));
        setCategoryId(created.idCategoria);
        set("category", created.nombre);
        setSubcategoryId("");
        set("subcategory", "");
      } else if (activeSubModal === "subcategory" && parentCat) {
        let category = localCategories.find((c) => c.nombre === parentCat);

        if (!category) {
          const createdCategory = await inventarioApi.crearCategoria({
            nombre: parentCat,
            descripcion: "",
          });
          setLocalCategories((prev) => [...prev, createdCategory]);
          category = createdCategory;
        }

        if (!category) {
          throw new Error("No se pudo determinar la categoría para la subcategoría");
        }

        const created = await inventarioApi.crearSubCategoria({
          nombre: value.trim(),
          idCategoria: category.idCategoria,
        });

        setLocalSubcategories((prev) => {
          const existing = prev[parentCat] || [];
          if (existing.includes(created.nombre)) return prev;
          return { ...prev, [parentCat]: [...existing, created.nombre] };
        });

        setLocalSubcategoriesWithIds((prev) => {
          const existing = prev[category!.idCategoria] || [];
          if (existing.some((s) => s.nombre === created.nombre)) return prev;
          return {
            ...prev,
            [category!.idCategoria]: [...existing, { id: created.idSubCategoria, nombre: created.nombre }],
          };
        });

        setCategoryId(category.idCategoria);
        set("category", parentCat);
        setSubcategoryId(created.idSubCategoria);
        set("subcategory", created.nombre);
      }
    } catch (error) {
      console.error("Error saving attribute:", error);
    } finally {
      setActiveSubModal(null);
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const imageUrl = URL.createObjectURL(file);
      setImagesList((prev) => [...prev, imageUrl]);
      setSelectedFiles((prev) => [...prev, { src: imageUrl, file }]);
      if (!form.image) set("image", imageUrl);
      event.target.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const imageUrlToRemove = imagesList[indexToRemove];
    const newList = imagesList.filter((_, index) => index !== indexToRemove);
    setImagesList(newList);
    setSelectedFiles((prev) => prev.filter((item) => item.src !== imageUrlToRemove));
    if (form.image === imageUrlToRemove)
      set("image", newList.length > 0 ? newList[0] : "");
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "El nombre es requerido";
    if (!form.sku.trim()) e.sku = "El SKU es requerido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(
      {
        ...form,
        id: product?.id ?? Date.now(),
        hasSalesHistory: product?.hasSalesHistory ?? false,
        brand: form.brand, // nombre será actualizado por cambio de ID más arriba
        category: form.category,
        subcategory: form.subcategory,
      },
      selectedFiles.map((item) => item.file),
      {
        // Pasar también los IDs para el backend
        brandId,
        categoryId,
        subcategoryId,
      }
    );
  };



  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000 p-4"
      >
        <div
          id="product-modal"
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl w-[min(96vw,560px)] max-h-[90vh] overflow-hidden flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
        >
          <input
            id="image"
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp"
            hidden
          />

          <div className="px-6 py-5 pb-4 border-b border-gray-200 flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-base ${isEdit ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"}`}
            >
              {isEdit ? "✎" : "+"}
            </div>
            <h2 className="text-[17px] font-bold text-gray-900 m-0">
              {isEdit ? "Editar Producto" : "Agregar Nuevo Producto"}
            </h2>
            <button
              onClick={onClose}
              className="ml-auto bg-transparent border-none cursor-pointer text-gray-400 p-1 flex hover:text-gray-600 transition-colors"
            >
              <IconX />
            </button>
          </div>

          <div className="overflow-y-auto px-6 py-5 flex-1">
            <div className="mb-3">
              <label className={twLabel}>
                Nombre del producto <span className="text-red-500">*</span>
              </label>
              <FieldWithIcon icon={<IconTag />}>
                <input
                  id="nombreProducto"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Ej. Mountain Bike Pro X-2024"
                  className={`${twField} pl-8 ${errors.name ? "border-red-500" : ""}`}
                />
              </FieldWithIcon>
              {errors.name && (
                <p className="text-red-500 text-[11px] mt-1">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className={twLabel}>SKU</label>
                <FieldWithIcon icon={<IconTag />}>
                  <input
                    id="sku"
                    value={form.sku}
                    onChange={(e) => set("sku", e.target.value)}
                    placeholder="RAD-001"
                    className={`${twField} pl-8 ${errors.sku ? "border-red-500" : ""}`}
                  />
                </FieldWithIcon>
                {errors.sku && (
                  <p className="text-red-500 text-[11px] mt-1">{errors.sku}</p>
                )}
              </div>
              <div>
                <label className={twLabel}>Código de barras</label>
                <FieldWithIcon icon={<IconBarcode />}>
                  <input
                    id="codigoBarras"
                    value={form.barcode}
                    onChange={(e) => set("barcode", e.target.value)}
                    placeholder="7501000..."
                    className={`${twField} pl-8`}
                  />
                </FieldWithIcon>
              </div>
            </div>

            <div className="mb-3">
              <label className={twLabel}>Marca</label>
              <div className="flex gap-2">
                <FieldWithIcon icon={<IconLayers />} className="flex-1">
                  <select
                    id="marca"
                    value={brandId}
                    onChange={(e) => {
                      const selectedBrand = localBrands.find(
                        (b) => b.idMarca === e.target.value
                      );
                      if (selectedBrand) {
                        setBrandId(selectedBrand.idMarca);
                        set("brand", selectedBrand.nombre);
                      }
                    }}
                    className={`${twField} pl-8 appearance-none cursor-pointer`}
                  >
                    <option value="">Seleccionar...</option>
                    {localBrands.map((b) => (
                      <option key={b.idMarca} value={b.idMarca}>
                        {b.nombre}
                      </option>
                    ))}
                  </select>
                </FieldWithIcon>
                <button
                  type="button"
                  onClick={() => setActiveSubModal("brand")}
                  className={twAddBtn}
                  title="Agregar Marca"
                  id="marca"
                >
                  <IconPlus />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className={twLabel}>Categoría</label>
                <div className="flex gap-2">
                  <FieldWithIcon icon={<IconGrid />} className="flex-1">
                    <select
                      id="categoria"
                      value={categoryId}
                      onChange={(e) => {
                        const selectedCategory = localCategories.find(
                          (c) => c.idCategoria === e.target.value
                        );
                        if (selectedCategory) {
                          setCategoryId(selectedCategory.idCategoria);
                          set("category", selectedCategory.nombre);
                          setSubcategoryId("");
                          set("subcategory", "");
                        }
                      }}
                      className={`${twField} pl-8 appearance-none cursor-pointer`}
                    >
                      <option value="">Seleccionar...</option>
                      {localCategories.map((c) => (
                        <option key={c.idCategoria} value={c.idCategoria}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </FieldWithIcon>
                  <button
                    type="button"
                    onClick={() => setActiveSubModal("category")}
                    className={twAddBtn}
                    title="Agregar Categoría"
                    id="categoria"
                  >
                    <IconPlus />
                  </button>
                </div>
              </div>
              <div>
                <label className={twLabel}>Subcategoría</label>
                <div className="flex gap-2">
                  <FieldWithIcon icon={<IconHash />} className="flex-1">
                    <select
                      id="subcategoria"
                      value={subcategoryId}
                      onChange={(e) => {
                        const selectedSubcategory = (localSubcategoriesWithIds[categoryId] || []).find(
                          (s) => s.id === e.target.value
                        );
                        if (selectedSubcategory) {
                          setSubcategoryId(selectedSubcategory.id);
                          set("subcategory", selectedSubcategory.nombre);
                        }
                      }}
                      className={`${twField} pl-8 appearance-none cursor-pointer`}
                      disabled={!categoryId}
                    >
                      <option value="">Seleccionar...</option>
                      {(localSubcategoriesWithIds[categoryId] || []).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre}
                        </option>
                      ))}
                    </select>
                  </FieldWithIcon>
                  <button
                    type="button"
                    onClick={() => setActiveSubModal("subcategory")}
                    className={twAddBtn}
                    title="Agregar Subcategoría"
                    id="subcategoria"
                  >
                    <IconPlus />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className={twLabel}>Precio de venta</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[13px]">
                    $
                  </span>
                  <input
                    id="precio"
                    type="number"
                    min={0}
                    value={form.price || ""}
                    onChange={(e) => set("price", Number(e.target.value))}
                    className={`${twField} pl-6`}
                  />
                </div>
              </div>
              <div>
                <label className={twLabel}>
                  {isEdit ? "Stock actual" : "Stock inicial"}
                </label>
                <FieldWithIcon icon={<IconBox />}>
                  <input
                    id="stock"
                    type="number"
                    min={0}
                    value={form.stock || ""}
                    onChange={(e) => set("stock", Number(e.target.value))}
                    className={`${twField} pl-8`}
                  />
                </FieldWithIcon>
              </div>
              <div>
                <label className={twLabel}>Stock mín. aceptable</label>
                <FieldWithIcon icon={<IconAlertTri />}>
                  <input
                    id="stockMin"
                    type="number"
                    min={0}
                    value={form.minStock || ""}
                    onChange={(e) => set("minStock", Number(e.target.value))}
                    className={`${twField} pl-8`}
                  />
                </FieldWithIcon>
              </div>
            </div>

            <div className="mb-3">
              <label className={twLabel}>Descripción del producto</label>
              <textarea
                id="descripcion"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                placeholder="Detalles técnicos, materiales, año de fabricación..."
                className={`${twField} resize-y`}
              />
            </div>

            <div className={`${twSection} mb-3`}>
              <label className={`${twLabel} mb-2`}>Atributos</label>
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-3 items-end">
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 mb-1 block">
                    Atributo
                  </label>
                  <input
                    id="atributo"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    placeholder="Ej. Color, Talla"
                    className={`${twField} bg-white`}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 mb-1 block">
                    Valor
                  </label>
                  <input
                    id="valor"
                    value={tagValue}
                    onChange={(e) => setTagValue(e.target.value)}
                    placeholder="Ej. Negro Mate, XL"
                    className={`${twField} bg-white`}
                    onKeyDown={(e) => e.key === "Enter" && addTag()}
                  />
                </div>
                <button
                  id="agregar"
                  type="button"
                  onClick={addTag}
                  className="bg-blue-600 text-white border-none rounded-lg px-4 h-9.5 cursor-pointer text-[13px] font-semibold whitespace-nowrap hover:bg-blue-700 transition-colors shadow-sm"
                >
                  + Agregar
                </button>
              </div>

              {form.tags.length > 0 && (
                <>
                  <p className="text-[10px] font-bold text-gray-400 tracking-[0.08em] mb-2 uppercase">
                    Etiquetas agregadas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {form.tags.map((tag: ProductTag, i: number) => (
                      <span
                        key={i}
                        className="bg-white border border-gray-200 text-gray-500 text-xs px-2.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm"
                      >
                        {tag.name}:{" "}
                        <strong className="text-blue-600 font-bold">
                          {tag.value}
                        </strong>
                        <button
                          type="button"
                          onClick={() => removeTag(i)}
                          className="cursor-pointer text-gray-300 font-bold hover:text-red-500 ml-1 text-sm leading-none bg-transparent border-none p-0 h-auto"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="mb-1">
              <label className={twLabel}>Imágenes del producto</label>
              <div className="flex flex-wrap gap-3 items-start mt-2">
                {/* Imágenes originales (existentes) */}
                {originalImages.map((src, i) => {
                  const isSelected = form.image === src;
                  return (
                    <div key={`original-${i}`} className="relative group">
                      <div
                        onClick={() => set("image", src)}
                        className={`relative cursor-pointer rounded-lg border-2 transition-all duration-200 overflow-hidden ${isSelected ? "border-blue-600 shadow-md ring-2 ring-blue-100" : "border-transparent hover:border-gray-300"}`}
                      >
                        {isSelected && (
                          <div className="absolute top-1 left-1 z-10 bg-blue-600 rounded px-1.5 py-0.5 text-white text-[9px] font-bold leading-none shadow-sm">
                            PRINCIPAL
                          </div>
                        )}
                        <Image
                          src={src?.trim() ? src : "/placeholder.png"}
                          alt={`product-${i}`}
                          width={86}
                          height={86}
                          className="w-21.5 h-21.5 object-cover"
                          onError={(e) => {
                            // Si la imagen no carga, usar placeholder
                            const img = e.target as HTMLImageElement;
                            img.src = "/placeholder.png";
                          }}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Imágenes nuevas (cargadas en esta sesión) */}
                {imagesList.map((src, i) => {
                  const isSelected = form.image === src;
                  return (
                    <div key={`new-${i}`} className="relative group">
                      <div
                        onClick={() => set("image", src)}
                        className={`relative cursor-pointer rounded-lg border-2 transition-all duration-200 overflow-hidden ${isSelected ? "border-blue-600 shadow-md ring-2 ring-blue-100" : "border-transparent hover:border-gray-300"}`}
                      >
                        {isSelected && (
                          <div className="absolute top-1 left-1 z-10 bg-blue-600 rounded px-1.5 py-0.5 text-white text-[9px] font-bold leading-none shadow-sm">
                            PRINCIPAL
                          </div>
                        )}
                        <Image
                          src={src}
                          alt={`product-new-${i}`}
                          width={86}
                          height={86}
                          className="w-21.5 h-21.5 object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(i);
                        }}
                        title="Quitar imagen"
                        className="absolute -top-2 -right-2 z-20 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center border-2 border-white cursor-pointer shadow opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110"
                      >
                        <IconX size={12} />
                      </button>
                    </div>
                  );
                })}

                <div
                  id="subirImagen"
                  onClick={handleUploadClick}
                  className="w-22.5 h-22.5 border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg flex flex-col items-center justify-center cursor-pointer gap-1 text-gray-500 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-all"
                >
                  <IconUpload />
                  <span className="text-[10px] font-bold mt-1 uppercase">
                    Subir Foto
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-2.5">
                ⓘ Formatos sugeridos: JPG, PNG, WEBP (Máx. 5MB). Clic en la foto
                para establecer como principal.
              </p>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2.5 bg-gray-50">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg border border-gray-200 bg-white cursor-pointer text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-lg border-none bg-blue-600 text-white cursor-pointer text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              {isEdit ? "Guardar Cambios" : "Guardar Producto"}
            </button>
          </div>
        </div>
      </div>

      {activeSubModal && (
        <AddAttributeModal
          type={activeSubModal}
          categories={localCategories.map((c) => c.nombre)}
          initialParentCategory={form.category}
          onClose={() => setActiveSubModal(null)}
          onSave={handleSaveAttribute}
        />
      )}
    </>
  );
}
