"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import { VarianteDTO } from "@/types/dtos";
import { ProductTag } from "@/types/inventory";
import { configuracionApi } from "@/lib/api/configuracion";
import {
  IconX,
  IconBarcode,
  IconBox,
  IconAlertTri,
} from "@/components/ui/Icons";

/** Datos que produce el formulario al guardar una variante. */
export interface VariantFormData {
  precio: number;
  costo: number;
  stock: number;
  /** `null` cuando las notificaciones de stock bajo están desactivadas para esta variante. */
  minStock: number | null;
  codigoDeBarras: string;
  activo: boolean;
  atributos: { nombre: string; valor: string }[];
}

/** Metadata de imágenes que acompaña a `VariantFormData` al guardar. */
export interface VariantImageMeta {
  mainImageIndex?: number;
  newMainImageId?: string;
  deletedImageIds?: string[];
}

interface VariantFormModalProps {
  /** Variante a editar, o `null` para crear una nueva. */
  variant: VarianteDTO | null;
  /** Precio de referencia del producto padre, usado para pre-llenar el formulario al agregar. */
  referencePrice: number;
  /** Costo de referencia del producto padre, usado para pre-llenar el costo al agregar. */
  referenceCost: number;
  /** Stock mínimo de referencia del producto padre, usado para pre-llenar el formulario al agregar. */
  referenceMinStock: number;
  onClose: () => void;
  onSave: (
    data: VariantFormData,
    newImageFiles: File[],
    imageMeta: VariantImageMeta,
  ) => void | Promise<void>;
}

const twField =
  "w-full py-[9px] px-3 border border-gray-200 rounded-lg text-[13px] text-gray-900 outline-none bg-white box-border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
const twLabel = "text-xs font-semibold text-gray-700 mb-1 block";

function FieldWithIcon({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 flex items-center pointer-events-none">
        {icon}
      </span>
      {children}
    </div>
  );
}

/**
 * Submodal para crear o editar una variante de producto (precio, stock, código
 * de barras y atributos clave-valor como color o talla). El SKU se autogenera
 * al crear y no es editable; solo se muestra como referencia al editar.
 */
export default function VariantFormModal({
  variant,
  referencePrice,
  referenceCost,
  referenceMinStock,
  onClose,
  onSave,
}: VariantFormModalProps) {
  const isEdit = !!variant;
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imagesList, setImagesList] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<
    { src: string; file: File }[]
  >([]);
  const [originalImages, setOriginalImages] = useState<string[]>(
    (variant?.imagenes ?? []).map((img) => img.url),
  );
  const [variantImagesData] = useState<
    Array<{ id: string; url: string; esPrincipal: boolean }>
  >(
    (variant?.imagenes ?? []).map((img) => ({
      id: img.idImagen,
      url: img.url,
      esPrincipal: img.esPrincipal,
    })),
  );
  const [deletedOriginalImages, setDeletedOriginalImages] = useState<
    string[]
  >([]);
  const [originalMainImage] = useState<string>(
    variant?.imagenes?.find((img) => img.esPrincipal)?.url ??
      variant?.imagenes?.[0]?.url ??
      "",
  );
  const [imagenPrincipal, setImagenPrincipal] =
    useState<string>(originalMainImage);

  // Al crear, el precio arranca vacío para que se vea el placeholder con el precio
  // sugerido (costo × margen configurado); al editar, se muestra el precio real.
  const [precio, setPrecio] = useState<number | string>(
    variant ? variant.precio : "",
  );
  const [costo, setCosto] = useState<number | string>(
    variant?.costo ?? referenceCost,
  );
  const [margenConfigurado, setMargenConfigurado] = useState<number | null>(null);
  const [stock, setStock] = useState<number | string>(variant?.stock ?? 0);
  const [notificarStockBajo, setNotificarStockBajo] = useState(
    variant ? variant.minStock != null : true,
  );
  const [minStock, setMinStock] = useState<number | string>(
    variant?.minStock ?? referenceMinStock,
  );
  const [codigoDeBarras, setCodigoDeBarras] = useState(
    variant?.codigoDeBarras ?? "",
  );
  const [activo, setActivo] = useState(variant?.activo ?? true);
  const [atributos, setAtributos] = useState<ProductTag[]>(
    (variant?.atributos ?? []).map((a) => ({ name: a.nombre, value: a.valor })),
  );
  const [atributoName, setAtributoName] = useState("");
  const [atributoValue, setAtributoValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    configuracionApi
      .obtener()
      .then((dto) => setMargenConfigurado(dto.margenGananciaSugerido))
      .catch(() => setMargenConfigurado(null));
  }, []);

  const costoNumerico = costo === "" ? 0 : Number(costo);
  const precioSugerido =
    costoNumerico > 0 && margenConfigurado
      ? costoNumerico * margenConfigurado
      : referencePrice;

  const addAtributo = () => {
    if (!atributoName.trim() || !atributoValue.trim()) return;
    setAtributos((prev) => [
      ...prev,
      { name: atributoName.trim(), value: atributoValue.trim() },
    ]);
    setAtributoName("");
    setAtributoValue("");
  };

  const removeAtributo = (index: number) =>
    setAtributos((prev) => prev.filter((_, i) => i !== index));

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const imageUrl = URL.createObjectURL(file);
      setImagesList((prev) => [...prev, imageUrl]);
      setSelectedFiles((prev) => [...prev, { src: imageUrl, file }]);
      if (!imagenPrincipal) setImagenPrincipal(imageUrl);
      event.target.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const imageUrlToRemove = imagesList[indexToRemove];
    const newList = imagesList.filter((_, index) => index !== indexToRemove);
    setImagesList(newList);
    setSelectedFiles((prev) =>
      prev.filter((item) => item.src !== imageUrlToRemove),
    );
    if (imagenPrincipal === imageUrlToRemove)
      setImagenPrincipal(newList.length > 0 ? newList[0] : "");
  };

  const handleRemoveOriginalImage = (indexToRemove: number) => {
    const imageUrlToRemove = originalImages[indexToRemove];
    const imageIdToRemove = variantImagesData.find(
      (img) => img.url === imageUrlToRemove,
    )?.id;

    if (imageIdToRemove) {
      setDeletedOriginalImages((prev) => [...prev, imageIdToRemove]);
    }

    const newList = originalImages.filter(
      (_, index) => index !== indexToRemove,
    );
    setOriginalImages(newList);

    if (imagenPrincipal === imageUrlToRemove) {
      setImagenPrincipal(
        newList.length > 0
          ? newList[0]
          : imagesList.length > 0
            ? imagesList[0]
            : "",
      );
    }
  };

  const handleSave = async () => {
    if (precio === "" || Number.isNaN(Number(precio)) || Number(precio) < 0) {
      setError("El precio debe ser un número válido mayor o igual a 0");
      return;
    }
    if (costo !== "" && (Number.isNaN(Number(costo)) || Number(costo) < 0)) {
      setError("El costo debe ser un número válido mayor o igual a 0");
      return;
    }
    if (stock === "" || Number.isNaN(Number(stock)) || Number(stock) < 0) {
      setError("El stock debe ser un número válido mayor o igual a 0");
      return;
    }
    if (
      notificarStockBajo &&
      (minStock === "" || Number.isNaN(Number(minStock)) || Number(minStock) < 0)
    ) {
      setError("El stock mínimo debe ser un número válido mayor o igual a 0");
      return;
    }

    setIsLoading(true);
    try {
      let mainImageIndex: number | undefined;
      if (selectedFiles.length > 0 && imagenPrincipal) {
        const mainIndex = selectedFiles.findIndex(
          (item) => item.src === imagenPrincipal,
        );
        if (mainIndex >= 0) mainImageIndex = mainIndex;
      }

      let newMainImageId: string | undefined;
      if (
        isEdit &&
        imagenPrincipal &&
        imagenPrincipal !== originalMainImage
      ) {
        const newMainImageData = variantImagesData.find(
          (img) => img.url === imagenPrincipal,
        );
        if (newMainImageData) newMainImageId = newMainImageData.id;
      }

      await onSave(
        {
          precio: Number(precio),
          costo: costo === "" ? 0 : Number(costo),
          stock: Number(stock),
          minStock: notificarStockBajo ? Number(minStock) : null,
          codigoDeBarras: codigoDeBarras.trim(),
          activo,
          atributos: atributos.map((a) => ({ nombre: a.name, valor: a.value })),
        },
        selectedFiles.map((item) => item.file),
        {
          mainImageIndex,
          newMainImageId,
          deletedImageIds: deletedOriginalImages,
        },
      );
    } catch (err: any) {
      setError(err?.message || "No se pudo guardar la variante");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-1010 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl w-full max-w-110 overflow-hidden shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col"
      >
        <input
          id="variant-image"
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
          hidden
        />

        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900 text-[15px] m-0">
            {isEdit ? "Editar Variante" : "Agregar Variante"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none p-1"
          >
            <IconX size={16} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {isEdit && (
            <div className="mb-3">
              <label className={twLabel}>SKU</label>
              <p className="text-[13px] text-gray-500 font-mono">
                {variant.sku}
              </p>
            </div>
          )}

          <div className="mb-3">
            <label className={twLabel}>Código de barras</label>
            <FieldWithIcon icon={<IconBarcode />}>
              <input
                value={codigoDeBarras}
                onChange={(e) => setCodigoDeBarras(e.target.value)}
                placeholder="7501000..."
                className={`${twField} pl-8`}
              />
            </FieldWithIcon>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className={twLabel}>Costo</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[13px]">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  value={costo}
                  onChange={(e) =>
                    setCosto(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className={`${twField} pl-6`}
                />
              </div>
            </div>
            <div>
              <label className={twLabel}>Precio</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[13px]">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  value={precio}
                  onChange={(e) =>
                    setPrecio(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder={
                    precioSugerido > 0
                      ? `Sugerido: $${precioSugerido.toFixed(2)}`
                      : "0.00"
                  }
                  className={`${twField} pl-6`}
                />
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className={twLabel}>Stock</label>
            <FieldWithIcon icon={<IconBox />}>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) =>
                  setStock(e.target.value === "" ? "" : Number(e.target.value))
                }
                className={`${twField} pl-8`}
              />
            </FieldWithIcon>
          </div>

          <div className="mb-3">
            <label className="flex items-center gap-2 mb-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notificarStockBajo}
                onChange={(e) => setNotificarStockBajo(e.target.checked)}
                className="cursor-pointer"
              />
              <span className="text-[13px] text-gray-700">
                Notificar cuando el stock esté por agotarse
              </span>
            </label>
            {notificarStockBajo && (
              <div>
                <label className={twLabel}>Stock mín.</label>
                <FieldWithIcon icon={<IconAlertTri />}>
                  <input
                    type="number"
                    min={0}
                    value={minStock}
                    onChange={(e) =>
                      setMinStock(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className={`${twField} pl-8`}
                  />
                </FieldWithIcon>
              </div>
            )}
          </div>

          {isEdit && (
            <label className="flex items-center gap-2 mb-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
                className="cursor-pointer"
              />
              <span className="text-[13px] text-gray-700">
                Variante activa
              </span>
            </label>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-[10px] p-4">
            <label className={`${twLabel} mb-2`}>Atributos</label>
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-3 items-end">
              <div>
                <label className="text-[11px] font-semibold text-gray-500 mb-1 block">
                  Atributo
                </label>
                <input
                  value={atributoName}
                  onChange={(e) => setAtributoName(e.target.value)}
                  placeholder="Ej. Color"
                  className={`${twField} bg-white`}
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 mb-1 block">
                  Valor
                </label>
                <input
                  value={atributoValue}
                  onChange={(e) => setAtributoValue(e.target.value)}
                  placeholder="Ej. Negro Mate"
                  className={`${twField} bg-white`}
                  onKeyDown={(e) => e.key === "Enter" && addAtributo()}
                />
              </div>
              <button
                type="button"
                onClick={addAtributo}
                className="bg-blue-600 text-white border-none rounded-lg px-4 h-9.5 cursor-pointer text-[13px] font-semibold whitespace-nowrap hover:bg-blue-700 transition-colors shadow-sm"
              >
                + Agregar
              </button>
            </div>

            {atributos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {atributos.map((a, i) => (
                  <span
                    key={i}
                    className="bg-white border border-gray-200 text-gray-500 text-xs px-2.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm"
                  >
                    {a.name}:{" "}
                    <strong className="text-blue-600 font-bold">
                      {a.value}
                    </strong>
                    <button
                      type="button"
                      onClick={() => removeAtributo(i)}
                      className="cursor-pointer text-gray-300 font-bold hover:text-red-500 ml-1 text-sm leading-none bg-transparent border-none p-0 h-auto"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <label className={`${twLabel} mb-0`}>Fotos de la variante</label>
              <button
                type="button"
                onClick={handleUploadClick}
                className="bg-blue-600 text-white border-none rounded-lg px-3 py-1.5 cursor-pointer text-[12px] font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                + Subir foto
              </button>
            </div>

            {originalImages.length === 0 && imagesList.length === 0 && (
              <p className="text-[12px] text-gray-500">
                Esta variante todavía no tiene fotos propias. Si no agregás
                ninguna, se usará la foto general del producto.
              </p>
            )}

            <div className="flex flex-wrap gap-3 items-start mt-2">
              {originalImages.map((src, i) => {
                const isSelected = imagenPrincipal === src;
                return (
                  <div key={`original-${i}`} className="relative group">
                    <div
                      onClick={() => setImagenPrincipal(src)}
                      className={`relative cursor-pointer rounded-lg border-2 transition-all duration-200 overflow-hidden ${isSelected ? "border-blue-600 shadow-md ring-2 ring-blue-100" : "border-transparent hover:border-gray-300"}`}
                    >
                      {isSelected && (
                        <div className="absolute top-1 left-1 z-10 bg-blue-600 rounded px-1.5 py-0.5 text-white text-[9px] font-bold leading-none shadow-sm">
                          PRINCIPAL
                        </div>
                      )}
                      <Image
                        src={src?.trim() ? src : "/placeholder.png"}
                        alt={`variant-${i}`}
                        width={72}
                        height={72}
                        className="w-18 h-18 object-cover"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = "/placeholder.png";
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveOriginalImage(i);
                      }}
                      title="Quitar imagen"
                      className="absolute -top-2 -right-2 z-20 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center border-2 border-white cursor-pointer shadow opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110"
                    >
                      <IconX size={12} />
                    </button>
                  </div>
                );
              })}

              {imagesList.map((src, i) => {
                const isSelected = imagenPrincipal === src;
                return (
                  <div key={`new-${i}`} className="relative group">
                    <div
                      onClick={() => setImagenPrincipal(src)}
                      className={`relative cursor-pointer rounded-lg border-2 transition-all duration-200 overflow-hidden ${isSelected ? "border-blue-600 shadow-md ring-2 ring-blue-100" : "border-transparent hover:border-gray-300"}`}
                    >
                      {isSelected && (
                        <div className="absolute top-1 left-1 z-10 bg-blue-600 rounded px-1.5 py-0.5 text-white text-[9px] font-bold leading-none shadow-sm">
                          PRINCIPAL
                        </div>
                      )}
                      <Image
                        src={src}
                        alt={`variant-new-${i}`}
                        width={72}
                        height={72}
                        className="w-18 h-18 object-cover"
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
            </div>
          </div>

          {error && <p className="text-red-500 text-[11px] mt-3">{error}</p>}
        </div>

        <div className="px-5 py-3.5 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-1.5 rounded-lg border border-gray-200 bg-white cursor-pointer text-[13px] font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-1.5 rounded-lg border-none bg-blue-600 text-white cursor-pointer text-[13px] font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
