import { redirect } from "next/navigation";

/**
 * Página raíz de la aplicación.
 * Redirige automáticamente al POS como pantalla de inicio por defecto.
 */
export default function HomePage() {
  redirect("/pos");
}
