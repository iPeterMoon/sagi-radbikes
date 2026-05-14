import { redirect } from "next/navigation";

/**
 * Página raíz de la aplicación.
 * Redirige automáticamente a la página de login.
 */
export default function Page() {
  redirect("/login");
}
