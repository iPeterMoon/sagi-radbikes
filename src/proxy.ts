import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { obtenerModuloDeRuta } from "@/lib/modulos";

/** Ruta de la página de inicio de sesión. */
const LOGIN_PATH = "/login";

/**
 * Expresión regular para detectar rutas de archivos estáticos (con extensión).
 * Se usa para omitir la validación de sesión en recursos como imágenes o fuentes.
 */
const PUBLIC_FILE_REGEX = /\.[^/]+$/;

/** Resultado de validar un token: si es válido, y a qué módulos da acceso el usuario. */
interface ResultadoValidacion {
  valido: boolean;
  modulosPermitidos: string[];
}

/**
 * Verifica si un token JWT es válido consultando el endpoint interno de validación,
 * y de paso recupera los módulos a los que tiene acceso el usuario del token.
 * @param request - Request original (se usa para construir la URL base)
 * @param token - JWT a validar
 * @returns Si el token es válido y los módulos permitidos (vacío si no es válido)
 */
async function validarToken(request: NextRequest, token: string): Promise<ResultadoValidacion> {
  try {
    const validateUrl = new URL("/api/auth/validate", request.url);
    const response = await fetch(validateUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) {
      return { valido: false, modulosPermitidos: [] };
    }
    const usuario = await response.json();
    return { valido: true, modulosPermitidos: usuario.modulosPermitidos ?? [] };
  } catch {
    return { valido: false, modulosPermitidos: [] };
  }
}

/**
 * Middleware de autenticación global de Next.js.
 *
 * Flujo de decisión:
 * 1. Archivos estáticos (extensión detectada) → pasa sin validación.
 * 2. Rutas `/api/auth/*` → pasa siempre (son públicas por diseño).
 * 3. Ruta `/login`:
 *    - Sin token → pasa (muestra el formulario).
 *    - Con token válido → redirige a `/catalogo`.
 *    - Con token inválido → limpia la cookie y pasa.
 * 4. Resto de rutas:
 *    - Sin token → redirige a `/login` (o 401 si es API).
 *    - Token inválido → redirige a `/login` limpiando cookie (o 401 si es API).
 *    - Token válido pero el módulo de la ruta no está entre los permitidos del
 *      usuario → redirige a `/pos` (o 403 si es API). "pos" siempre está
 *      permitido, así que este redirect nunca vuelve a rebotar.
 *    - Token válido y módulo permitido → pasa.
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthApi = pathname.startsWith("/api/auth/");
  const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "");

  // Allow public assets (e.g. /logo-radbikes.png) to be served without auth redirects.
  if (PUBLIC_FILE_REGEX.test(pathname)) {
    return NextResponse.next();
  }

  if (isAuthApi) {
    return NextResponse.next();
  }

  if (pathname === LOGIN_PATH) {
    if (!token) {
      return NextResponse.next();
    }

    const { valido } = await validarToken(request, token);
    if (valido) {
      return NextResponse.redirect(new URL("/catalogo", request.url));
    }

    const response = NextResponse.next();
    response.cookies.delete("token");
    return response;
  }

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  const { valido, modulosPermitidos } = await validarToken(request, token);
  if (!valido) {
    if (pathname.startsWith("/api/")) {
      const unauthorizedResponse = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      unauthorizedResponse.cookies.delete("token");
      return unauthorizedResponse;
    }

    const redirectResponse = NextResponse.redirect(new URL(LOGIN_PATH, request.url));
    redirectResponse.cookies.delete("token");
    return redirectResponse;
  }

  const modulo = obtenerModuloDeRuta(pathname);
  if (modulo && !modulosPermitidos.includes(modulo)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "No autorizado para este módulo" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/pos", request.url));
  }

  return NextResponse.next();
}

export const config = {
  /** Excluye archivos estáticos de Next.js y favicon del middleware. */
  matcher: ["/((?!_next/static|_next/image|placeholder.png|favicon.ico).*)"],
};
