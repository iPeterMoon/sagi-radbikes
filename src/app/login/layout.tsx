import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesion - RAD Bikes",
  description: "Portal seguro de inicio de sesion para RAD Bikes",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
