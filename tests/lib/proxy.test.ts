import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
import proxy from "@/proxy";
import { fakeResponse } from "../helpers/mocks";

 

function makeRequest(
  pathname: string,
  opts: { token?: string; authorization?: string } = {},
): NextRequest {
  return {
    nextUrl: { pathname },
    url: `http://localhost:3000${pathname}`,
    cookies: {
      get: (name: string) =>
        name === "token" && opts.token ? { value: opts.token } : undefined,
    },
    headers: {
      get: (name: string) =>
        name.toLowerCase() === "authorization" ? opts.authorization ?? null : null,
    },
  } as unknown as NextRequest;
}

const isNext = (res: Response) => res.headers.get("x-middleware-next") === "1";
const locationOf = (res: Response) => res.headers.get("location");

describe("proxy (middleware de autenticación)", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("deja pasar los archivos estáticos sin validar", async () => {
    const res = await proxy(makeRequest("/logo-radbikes.png"));
    expect(isNext(res)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("deja pasar siempre las rutas /api/auth/*", async () => {
    const res = await proxy(makeRequest("/api/auth/login"));
    expect(isNext(res)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("en /login sin token deja ver el formulario", async () => {
    const res = await proxy(makeRequest("/login"));
    expect(isNext(res)).toBe(true);
  });

  it("en /login con token válido redirige al catálogo", async () => {
    fetchMock.mockResolvedValue(
      fakeResponse({ json: () => Promise.resolve({ modulosPermitidos: ["catalogo"] }) }),
    );
    const res = await proxy(makeRequest("/login", { token: "t" }));
    expect(res.status).toBe(307);
    expect(locationOf(res)).toContain("/catalogo");
  });

  it("en /login con token inválido limpia la cookie", async () => {
    fetchMock.mockResolvedValue(fakeResponse({ ok: false, status: 401 }));
    const res = await proxy(makeRequest("/login", { token: "malo" }));
    expect(isNext(res)).toBe(true);
    expect(res.headers.get("set-cookie")).toContain("token=");
  });

  it("redirige a /login en rutas de página sin token", async () => {
    const res = await proxy(makeRequest("/catalogo"));
    expect(res.status).toBe(307);
    expect(locationOf(res)).toContain("/login");
  });

  it("responde 401 en rutas de API sin token", async () => {
    const res = await proxy(makeRequest("/api/inventario/productos"));
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("con token inválido redirige a /login y limpia la cookie", async () => {
    fetchMock.mockResolvedValue(fakeResponse({ ok: false, status: 401 }));
    const res = await proxy(makeRequest("/catalogo", { token: "malo" }));
    expect(res.status).toBe(307);
    expect(locationOf(res)).toContain("/login");
    expect(res.headers.get("set-cookie")).toContain("token=");
  });

  it("con token inválido responde 401 en API y limpia la cookie", async () => {
    fetchMock.mockResolvedValue(fakeResponse({ ok: false, status: 401 }));
    const res = await proxy(makeRequest("/api/inventario/productos", { token: "malo" }));
    expect(res.status).toBe(401);
    expect(res.headers.get("set-cookie")).toContain("token=");
  });

  it("redirige a /pos cuando el módulo no está permitido (página)", async () => {
    fetchMock.mockResolvedValue(
      fakeResponse({ json: () => Promise.resolve({ modulosPermitidos: ["pos"] }) }),
    );
    const res = await proxy(makeRequest("/reportes", { token: "t" }));
    expect(res.status).toBe(307);
    expect(locationOf(res)).toContain("/pos");
  });

  it("responde 403 cuando el módulo no está permitido (API)", async () => {
    fetchMock.mockResolvedValue(
      fakeResponse({ json: () => Promise.resolve({ modulosPermitidos: ["pos"] }) }),
    );
    const res = await proxy(makeRequest("/api/reportes/ventas", { token: "t" }));
    expect(res.status).toBe(403);
  });

  it("deja pasar cuando el módulo está permitido", async () => {
    fetchMock.mockResolvedValue(
      fakeResponse({ json: () => Promise.resolve({ modulosPermitidos: ["catalogo"] }) }),
    );
    const res = await proxy(makeRequest("/catalogo", { token: "t" }));
    expect(isNext(res)).toBe(true);
  });

  it("acepta el token por cabecera Authorization Bearer", async () => {
    fetchMock.mockResolvedValue(
      fakeResponse({ json: () => Promise.resolve({ modulosPermitidos: ["catalogo"] }) }),
    );
    const res = await proxy(
      makeRequest("/catalogo", { authorization: "Bearer abc.def.ghi" }),
    );
    expect(isNext(res)).toBe(true);
    expect(fetchMock).toHaveBeenCalled();
  });

  it("trata como inválido un token cuando la validación lanza", async () => {
    fetchMock.mockRejectedValue(new Error("red caída"));
    const res = await proxy(makeRequest("/catalogo", { token: "t" }));
    expect(res.status).toBe(307);
    expect(locationOf(res)).toContain("/login");
  });
});
