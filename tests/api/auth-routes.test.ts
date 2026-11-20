import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const m = vi.hoisted(() => ({
  auth: {
    iniciarSesion: vi.fn(),
    cerrarSesion: vi.fn(),
    validarToken: vi.fn(),
  },
  usuarios: {
    obtenerTodos: vi.fn(),
    obtenerPorId: vi.fn(),
    crear: vi.fn(),
    actualizar: vi.fn(),
    eliminar: vi.fn(),
    alternarActivo: vi.fn(),
  },
  roles: {
    obtenerTodos: vi.fn(),
    obtenerPorNombre: vi.fn(),
    obtenerPorId: vi.fn(),
    crear: vi.fn(),
    actualizar: vi.fn(),
    eliminar: vi.fn(),
  },
}));

vi.mock("@/lib/auth/factory", () => ({
  createServicioInicioSesion: () => m.auth,
  createServicioUsuarios: () => m.usuarios,
  createServicioRoles: () => m.roles,
}));

import { POST as loginPOST } from "@/app/api/auth/login/route";
import { POST as logoutPOST } from "@/app/api/auth/logout/route";
import { GET as validateGET } from "@/app/api/auth/validate/route";
import { GET as usersGET, POST as usersPOST } from "@/app/api/users/route";
import {
  GET as userGET,
  PUT as userPUT,
  DELETE as userDELETE,
  PATCH as userPATCH,
} from "@/app/api/users/[usuarioId]/route";
import { GET as rolesGET, POST as rolesPOST } from "@/app/api/roles/route";
import {
  GET as roleGET,
  PUT as rolePUT,
  DELETE as roleDELETE,
} from "@/app/api/roles/[id]/route";
import { GET as vendedoresGET } from "@/app/api/pos/vendedores/route";

/* eslint-disable @typescript-eslint/no-explicit-any */

const jsonReq = (url: string, method = "GET", body?: unknown, headers: Record<string, string> = {}) =>
  new NextRequest(`http://localhost:3000${url}`, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: { "content-type": "application/json", ...headers },
  });

const params = <T extends Record<string, string>>(value: T) => ({ params: Promise.resolve(value) });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/auth/login", () => {
  it("responde 200 y setea la cookie del token", async () => {
    m.auth.iniciarSesion.mockResolvedValue({ token: "jwt-123", usuario: { idUsuario: "1" } });
    const res = await loginPOST(jsonReq("/api/auth/login", "POST", { username: "a", password: "b" }));
    expect(res.status).toBe(200);
    expect(res.cookies.get("token")?.value).toBe("jwt-123");
    await expect(res.json()).resolves.toMatchObject({ token: "jwt-123" });
  });

  it("no setea cookie si no hay token", async () => {
    m.auth.iniciarSesion.mockResolvedValue({ usuario: { idUsuario: "1" } });
    const res = await loginPOST(jsonReq("/api/auth/login", "POST", {}));
    expect(res.cookies.get("token")).toBeUndefined();
  });

  it("responde 401 con el mensaje de error", async () => {
    m.auth.iniciarSesion.mockRejectedValue(new Error("Usuario o contraseña incorrectos"));
    const res = await loginPOST(jsonReq("/api/auth/login", "POST", {}));
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "Usuario o contraseña incorrectos" });
  });
});

describe("POST /api/auth/logout", () => {
  it("cierra la sesión y limpia la cookie", async () => {
    m.auth.cerrarSesion.mockResolvedValue(undefined);
    const res = await logoutPOST(
      jsonReq("/api/auth/logout", "POST", undefined, { cookie: "token=abc" }),
    );
    expect(res.status).toBe(200);
    expect(m.auth.cerrarSesion).toHaveBeenCalledWith("abc");
    expect(res.headers.get("set-cookie")).toContain("token=");
  });

  it("responde 500 si el cierre falla", async () => {
    m.auth.cerrarSesion.mockRejectedValue(new Error("boom"));
    const res = await logoutPOST(jsonReq("/api/auth/logout", "POST", undefined, { cookie: "token=abc" }));
    expect(res.status).toBe(500);
  });
});

describe("GET /api/auth/validate", () => {
  it("responde 401 sin token", async () => {
    const res = await validateGET(jsonReq("/api/auth/validate"));
    expect(res.status).toBe(401);
    expect(m.auth.validarToken).not.toHaveBeenCalled();
  });

  it("responde 200 con el usuario cuando el token es válido", async () => {
    m.auth.validarToken.mockResolvedValue({ idUsuario: "1" });
    const res = await validateGET(
      jsonReq("/api/auth/validate", "GET", undefined, { cookie: "token=abc" }),
    );
    expect(res.status).toBe(200);
    expect(m.auth.validarToken).toHaveBeenCalledWith("abc");
  });

  it("responde 401 cuando la validación lanza", async () => {
    m.auth.validarToken.mockRejectedValue(new Error("Token inválido"));
    const res = await validateGET(
      jsonReq("/api/auth/validate", "GET", undefined, { cookie: "token=abc" }),
    );
    expect(res.status).toBe(401);
  });
});

describe("/api/users", () => {
  it("GET lista usuarios", async () => {
    m.usuarios.obtenerTodos.mockResolvedValue([{ idUsuario: "1" }]);
    const res = await usersGET(jsonReq("/api/users"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual([{ idUsuario: "1" }]);
  });

  it("GET responde 500 si falla", async () => {
    m.usuarios.obtenerTodos.mockRejectedValue(new Error("boom"));
    const res = await usersGET(jsonReq("/api/users"));
    expect(res.status).toBe(500);
  });

  it("POST crea un usuario y responde 201", async () => {
    m.usuarios.crear.mockResolvedValue({ idUsuario: "9" });
    const res = await usersPOST(jsonReq("/api/users", "POST", { username: "ana" }));
    expect(res.status).toBe(201);
    expect(m.usuarios.crear).toHaveBeenCalledWith({ username: "ana" });
  });
});

describe("/api/users/[usuarioId]", () => {
  it("GET responde el usuario", async () => {
    m.usuarios.obtenerPorId.mockResolvedValue({ idUsuario: "5" });
    const res = await userGET(jsonReq("/api/users/5"), params({ usuarioId: "5" }));
    expect(res.status).toBe(200);
    expect(m.usuarios.obtenerPorId).toHaveBeenCalledWith("5");
  });

  it("PUT actualiza con bigint", async () => {
    m.usuarios.actualizar.mockResolvedValue({ idUsuario: "5" });
    const res = await userPUT(jsonReq("/api/users/5", "PUT", { username: "x" }), params({ usuarioId: "5" }));
    expect(res.status).toBe(200);
    expect(m.usuarios.actualizar).toHaveBeenCalledWith(5n, { username: "x" });
  });

  it("PUT responde 400 con el mensaje de error", async () => {
    m.usuarios.actualizar.mockRejectedValue(new Error("Este correo ya está asociado con un usuario"));
    const res = await userPUT(jsonReq("/api/users/5", "PUT", {}), params({ usuarioId: "5" }));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      error: "Este correo ya está asociado con un usuario",
    });
  });

  it("DELETE responde 200 con success", async () => {
    m.usuarios.eliminar.mockResolvedValue(true);
    const res = await userDELETE(jsonReq("/api/users/5", "DELETE"), params({ usuarioId: "5" }));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ success: true });
  });

  it("PATCH alterna el estado activo", async () => {
    m.usuarios.alternarActivo.mockResolvedValue(true);
    const res = await userPATCH(jsonReq("/api/users/5", "PATCH"), params({ usuarioId: "5" }));
    expect(res.status).toBe(200);
    expect(m.usuarios.alternarActivo).toHaveBeenCalledWith(5n);
  });
});

describe("/api/roles", () => {
  it("GET sin nombre lista todos los roles", async () => {
    m.roles.obtenerTodos.mockResolvedValue([{ idRol: "1" }]);
    const res = await rolesGET(jsonReq("/api/roles"));
    expect(res.status).toBe(200);
    expect(m.roles.obtenerPorNombre).not.toHaveBeenCalled();
  });

  it("GET con nombre busca por nombre", async () => {
    m.roles.obtenerPorNombre.mockResolvedValue({ idRol: "1", nombre: "admin" });
    const res = await rolesGET(jsonReq("/api/roles?nombre=admin"));
    expect(res.status).toBe(200);
    expect(m.roles.obtenerPorNombre).toHaveBeenCalledWith("admin");
  });

  it("GET con nombre inexistente responde 404", async () => {
    m.roles.obtenerPorNombre.mockResolvedValue(null);
    const res = await rolesGET(jsonReq("/api/roles?nombre=xx"));
    expect(res.status).toBe(404);
  });

  it("POST crea un rol", async () => {
    m.roles.crear.mockResolvedValue({ idRol: "2" });
    const res = await rolesPOST(jsonReq("/api/roles", "POST", { nombre: "x" }));
    expect(res.status).toBe(201);
  });
});

describe("/api/roles/[id]", () => {
  it("GET responde el rol encontrado", async () => {
    m.roles.obtenerPorId.mockResolvedValue({ idRol: "2" });
    const res = await roleGET(jsonReq("/api/roles/2"));
    expect(res.status).toBe(200);
    expect(m.roles.obtenerPorId).toHaveBeenCalledWith("2");
  });

  it("GET responde 404 si no existe", async () => {
    m.roles.obtenerPorId.mockResolvedValue(null);
    const res = await roleGET(jsonReq("/api/roles/2"));
    expect(res.status).toBe(404);
  });

  it("PUT actualiza el rol", async () => {
    m.roles.actualizar.mockResolvedValue({ idRol: "2" });
    const res = await rolePUT(jsonReq("/api/roles/2", "PUT", { nombre: "x" }));
    expect(res.status).toBe(200);
    expect(m.roles.actualizar).toHaveBeenCalledWith("2", { nombre: "x" });
  });

  it("DELETE responde 200 o 404 según el resultado", async () => {
    m.roles.eliminar.mockResolvedValue(true);
    let res = await roleDELETE(jsonReq("/api/roles/2", "DELETE"));
    expect(res.status).toBe(200);

    m.roles.eliminar.mockResolvedValue(false);
    res = await roleDELETE(jsonReq("/api/roles/2", "DELETE"));
    expect(res.status).toBe(404);
  });
});

describe("GET /api/pos/vendedores", () => {
  it("devuelve solo usuarios activos con campos reducidos", async () => {
    m.usuarios.obtenerTodos.mockResolvedValue([
      { idUsuario: "1", nombre: "Ana", apellido: "Díaz", username: "ana", is_active: true },
      { idUsuario: "2", nombre: "Beto", apellido: "Ruiz", username: "beto", is_active: false },
    ]);
    const res = await vendedoresGET();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual([
      { idUsuario: "1", nombre: "Ana", apellido: "Díaz", username: "ana" },
    ]);
  });

  it("responde 500 si falla", async () => {
    m.usuarios.obtenerTodos.mockRejectedValue(new Error("boom"));
    const res = await vendedoresGET();
    expect(res.status).toBe(500);
  });
});
