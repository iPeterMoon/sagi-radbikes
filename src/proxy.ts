import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Ruta de la página de inicio de sesión. */
const LOGIN_PATH = "/login";

/**
 * Expresión regular para detectar rutas de archivos estáticos (con extensión).
 * Se usa para omitir la validación de sesión en recursos como imágenes o fuentes.
 */
const PUBLIC_FILE_REGEX = /\.[^/]+$/;

/**
 * Verifica si un token JWT es válido consultando el endpoint interno de validación.
 * @param request - Request original (se usa para construir la URL base)
 * @param token - JWT a validar
 * @returns `true` si el servidor responde 200 OK
 */
async function isTokenValid(request: NextRequest, token: string): Promise<boolean> {
  try {
    const validateUrl = new URL("/api/auth/validate", request.url);
    const response = await fetch(validateUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
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
 *    - Token válido → pasa.
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

    const valid = await isTokenValid(request, token);
    if (valid) {
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

  const valid = await isTokenValid(request, token);
  if (!valid) {
    if (pathname.startsWith("/api/")) {
      const unauthorizedResponse = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      unauthorizedResponse.cookies.delete("token");
      return unauthorizedResponse;
    }

    const redirectResponse = NextResponse.redirect(new URL(LOGIN_PATH, request.url));
    redirectResponse.cookies.delete("token");
    return redirectResponse;
  }

  return NextResponse.next();
}

export const config = {
  /** Excluye archivos estáticos de Next.js y favicon del middleware. */
  matcher: ["/((?!_next/static|_next/image|placeholder.png|favicon.ico).*)"],
};
