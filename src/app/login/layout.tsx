import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesion - RAD Bikes",
  description: "Portal seguro de inicio de sesion para RAD Bikes",
};

/**
 * Layout para la página de login.
 * Componente servidor que declara metadatos.
 * @param children - Contenido del componente de login
 */
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
