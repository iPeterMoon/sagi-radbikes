import type { Metadata } from "next";
import POSLayoutClient from "./components/POSLayoutClient";
 
export const metadata: Metadata = {
  title: "POS - RAD Bikes",
  description: "Punto de venta para RAD Bikes",
};
 
/**
 * Layout del módulo POS (Punto de Venta).
 * Componente servidor que define los metadatos de la sección
 * y delega el render del shell interactivo a {@link POSLayoutClient}.
 */
export default function POSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <POSLayoutClient>{children}</POSLayoutClient>;
}
 