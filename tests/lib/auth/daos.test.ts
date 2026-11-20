import { beforeEach, describe, expect, it, vi } from "vitest";
import { UsuarioDAO } from "@/lib/auth/datos/daos/implementaciones/UsuarioDAO";
import { RolDAO } from "@/lib/auth/datos/daos/implementaciones/RolDAO";
import { UsuarioRolDAO } from "@/lib/auth/datos/daos/implementaciones/UsuarioRolDAO";
import { RolModuloDAO } from "@/lib/auth/datos/daos/implementaciones/RolModuloDAO";
import { prismaDelegateMock } from "../../helpers/mocks";

 

describe("UsuarioDAO", () => {
  let delegate: any;
  let dao: UsuarioDAO;

  beforeEach(() => {
    delegate = prismaDelegateMock();
    dao = new UsuarioDAO({ users: delegate } as any);
  });

  it("getAllWithRoles incluye roles", async () => {
    delegate.findMany.mockResolvedValue([]);
    await dao.getAllWithRoles();
    expect(delegate.findMany).toHaveBeenCalledWith({
      include: { user_role: { include: { roles: true } } },
    });
  });

  it("getByUsername busca de forma insensible a mayúsculas", async () => {
    delegate.findFirst.mockResolvedValue(null);
    await dao.getByUsername("Pedro");
    expect(delegate.findFirst).toHaveBeenCalledWith({
      where: { username: { equals: "Pedro", mode: "insensitive" } },
    });
  });

  it("getByUsernameWithRoles incluye roles y sus módulos", async () => {
    delegate.findFirst.mockResolvedValue(null);
    await dao.getByUsernameWithRoles("pedro");
    const arg = delegate.findFirst.mock.calls[0][0];
    expect(arg.include.user_role.include.roles.include.role_module_access).toBe(true);
  });

  it("getByEmail y getByEmailWithRoles usan email insensible", async () => {
    delegate.findFirst.mockResolvedValue(null);
    await dao.getByEmail("A@X.com");
    await dao.getByEmailWithRoles("A@X.com");
    expect(delegate.findFirst).toHaveBeenNthCalledWith(1, {
      where: { email: { equals: "A@X.com", mode: "insensitive" } },
    });
    expect(delegate.findFirst.mock.calls[1][0].include).toBeDefined();
  });

  it("getByPhone consulta la columna telefono (regresión)", async () => {
    delegate.findFirst.mockResolvedValue(null);
    await dao.getByPhone("8110000000");
    expect(delegate.findFirst).toHaveBeenCalledWith({
      where: { telefono: { equals: "8110000000" } },
    });
  });

  it("getByPhoneWithRoles consulta telefono con roles", async () => {
    delegate.findFirst.mockResolvedValue(null);
    await dao.getByPhoneWithRoles("811");
    const arg = delegate.findFirst.mock.calls[0][0];
    expect(arg.where).toEqual({ telefono: { equals: "811" } });
    expect(arg.include.user_role).toBeDefined();
  });

  it("toggleActive alterna el estado cuando el usuario existe", async () => {
    delegate.findUnique.mockResolvedValue({ id: 1n, is_active: true });
    delegate.update.mockResolvedValue({ id: 1n, is_active: false });
    await expect(dao.toggleActive(1n)).resolves.toBe(true);
    expect(delegate.update).toHaveBeenCalledWith({
      where: { id: 1n },
      data: { is_active: false },
    });
  });

  it("toggleActive devuelve false si el usuario no existe", async () => {
    delegate.findUnique.mockResolvedValue(null);
    await expect(dao.toggleActive(1n)).resolves.toBe(false);
    expect(delegate.update).not.toHaveBeenCalled();
  });

  it("toggleActive devuelve false si Prisma falla", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    delegate.findUnique.mockRejectedValue(new Error("boom"));
    await expect(dao.toggleActive(1n)).resolves.toBe(false);
    log.mockRestore();
  });
});

describe("RolDAO", () => {
  let delegate: any;
  let dao: RolDAO;

  beforeEach(() => {
    delegate = prismaDelegateMock();
    dao = new RolDAO({ roles: delegate } as any);
  });

  it("obtenerPorNombre es insensible a mayúsculas", async () => {
    delegate.findFirst.mockResolvedValue(null);
    await dao.obtenerPorNombre("Admin");
    expect(delegate.findFirst).toHaveBeenCalledWith({
      where: { name: { equals: "Admin", mode: "insensitive" } },
    });
  });

  it("getAllConModulos y getByIdConModulos incluyen módulos", async () => {
    delegate.findMany.mockResolvedValue([]);
    delegate.findUnique.mockResolvedValue(null);
    await dao.getAllConModulos();
    await dao.getByIdConModulos(2n);
    expect(delegate.findMany).toHaveBeenCalledWith({
      include: { role_module_access: true },
    });
    expect(delegate.findUnique).toHaveBeenCalledWith({
      where: { id: 2n },
      include: { role_module_access: true },
    });
  });
});

describe("UsuarioRolDAO / RolModuloDAO", () => {
  it("UsuarioRolDAO.getByUserId incluye roles", async () => {
    const delegate = prismaDelegateMock();
    const dao = new UsuarioRolDAO({ user_role: delegate } as any);
    delegate.findMany.mockResolvedValue([]);
    await dao.getByUserId(1n);
    expect(delegate.findMany).toHaveBeenCalledWith({
      where: { user_id: 1n },
      include: { roles: true },
    });
  });

  it("RolModuloDAO.getByRoleId filtra por rol", async () => {
    const delegate = prismaDelegateMock();
    const dao = new RolModuloDAO({ role_module_access: delegate } as any);
    delegate.findMany.mockResolvedValue([]);
    await dao.getByRoleId(2n);
    expect(delegate.findMany).toHaveBeenCalledWith({ where: { role_id: 2n } });
  });
});
