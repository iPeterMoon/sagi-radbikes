"use client";

import React from "react";
import Image from "next/image";
import {
  DeleteConfirmModalProps,
  SalesHistoryErrorModalProps,
} from "@/types/inventory";
import { IconDeleteBig, IconWarning } from "@/components/ui/Icons";

/**
 * Envoltorio de overlay semi-transparente compartido por los modales de esta sección.
 * Cierra el modal al hacer clic fuera del contenido.
 */
function Overlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000 p-4"
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

/**
 * Modal de confirmación para eliminar un producto.
 * Muestra los datos del producto y solicita confirmación antes de proceder.
 */
export function DeleteConfirmationModal({
  product,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <Overlay onClose={onClose}>
      <div className="bg-white rounded-2xl w-[min(96vw,400px)] px-7 py-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 text-red-500">
          <IconDeleteBig />
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          ¿Eliminar Producto?
        </h2>
        <p className="text-[13px] text-gray-500 mb-4 leading-relaxed">
          Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar
          el producto <strong>&apos;{product.name}&apos;</strong> del catálogo?
        </p>

        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3.5 mb-6 text-left">
          <Image
            src={product.image || "/placeholder.png"}
            alt={product.name}
            width={44}
            height={44}
            className="w-11 h-11 rounded-lg object-cover"
          />
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {product.name}
            </div>
            <div className="text-xs text-gray-400">{product.sku}</div>
          </div>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 p-2.5 rounded-lg border border-gray-200 bg-white cursor-pointer text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 p-2.5 rounded-lg border-none bg-red-500 text-white cursor-pointer text-sm font-semibold hover:bg-red-600 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </Overlay>
  );
}

export function SalesHistoryErrorModal({
  product,
  onClose,
}: SalesHistoryErrorModalProps) {
  return (
    <Overlay onClose={onClose}>
      <div className="bg-white rounded-2xl w-[min(96vw,380px)] px-7 py-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 text-red-500">
          <IconWarning />
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-2">
          No se puede eliminar
        </h2>
        <p className="text-[13px] text-gray-500 leading-relaxed mb-5">
          El producto <strong>&apos;{product.name}&apos;</strong> tiene un
          historial de ventas asociado y no puede ser eliminado.
          <br />
          <br />
          Te sugerimos usar el interruptor <strong>Activo</strong> para
          desactivarlo del catálogo.
        </p>

        <button
          onClick={onClose}
          className="w-full p-2.5 rounded-lg border-none bg-blue-600 text-white cursor-pointer text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Entendido
        </button>
      </div>
    </Overlay>
  );
}
