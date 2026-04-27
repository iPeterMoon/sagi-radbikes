import type { Metadata } from "next";
import CatalogoLayoutClient from "./components/CatalogoLayoutClient";

export const metadata: Metadata = {
  title: "Catalogo - RAD Bikes",
  description: "Gestion de catalogo e inventario para RAD Bikes",
};

/**
 * Layout del módulo de catálogo.
 * Componente servidor que define los metadatos de la sección
 * y delega el render del shell interactivo a {@link CatalogoLayoutClient}.
 */
export default function CatalogoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CatalogoLayoutClient>{children}</CatalogoLayoutClient>;
}
