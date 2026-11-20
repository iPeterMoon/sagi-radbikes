import { beforeEach, describe, expect, it } from "vitest";
import jwt from "jsonwebtoken";
import { UsuarioBO } from "@/lib/auth/negocio/BOs/UsuarioBO";
import { RolBO } from "@/lib/auth/negocio/BOs/RolBO";
import { PasswordEncoder } from "@/lib/auth/negocio/PasswordEncoder";
import { authAccesoMock } from "../../helpers/mocks";

 

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key";

const role = (over: any = {}) => ({
  id: 2n,
  created_at: new Date(),
  name: "admin",
  description: "Administra",
  role_module_access: [],
  ...over,
});

const user = (over: any = {}) => ({
  id: 1n,
  created_at: new Date(),
  username: "pedro",
  password: "hash",
  nombre: "Pedro",
  apellido: "Luna",
  email: "p@x.com",
  telefono: "6441234567",
  is_active: true,
  user_role: [],
  ...over,
});

const userConRol = (over: any = {}) =>
  user({
    user_role: [
      {
        roles: role({
          role_module_access: [{ module: "catalogo" }],
        }),
      },
    ],
    ...over,
  });

describe("UsuarioBO.login", () => {
  let acceso: any;
  let bo: UsuarioBO;
  let hash: string;

  beforeEach(async () => {
    acceso = authAccesoMock();
    bo = new UsuarioBO(acceso);
    hash = await PasswordEncoder.encode("secreta");
  });

  it("devuelve un token y el DTO del usuario con credenciales válidas", async () => {
    acceso.usuarioDAO.getByUsernameWithRoles.mockResolvedValue(
      userConRol({ password: hash }),
    );

    const sesion = await bo.login({ username: "pedro", password: "secreta" });

    expect(sesion.usuario.username).toBe("pedro");
    expect(sesion.usuario.modulosPermitidos.sort()).toEqual(["catalogo", "pos"]);
    expect(sesion.token).toBeTruthy();

    const decoded = jwt.verify(sesion.token, JWT_SECRET) as any;
    expect(decoded.username).toBe("pedro");
    expect(decoded.roles).toEqual(["admin"]);
    expect(sesion.fechaExpiracion.getTime()).toBeGreaterThan(Date.now());
  });

  it("rechaza un usuario inexistente sin revelar cuál campo falló", async () => {
    acceso.usuarioDAO.getByUsernameWithRoles.mockResolvedValue(null);
    await expect(bo.login({ username: "x", password: "y" })).rejects.toThrow(
      "Usuario o contraseña incorrectos",
    );
  });

  it("rechaza un usuario sin contraseña configurada", async () => {
    acceso.usuarioDAO.getByUsernameWithRoles.mockResolvedValue(
      userConRol({ password: null }),
    );
    await expect(bo.login({ username: "pedro", password: "x" })).rejects.toThrow(
      "Usuario sin contraseña configurada",
    );
  });

  it("rechaza una contraseña incorrecta", async () => {
    acceso.usuarioDAO.getByUsernameWithRoles.mockResolvedValue(
      userConRol({ password: hash }),
    );
    await expect(bo.login({ username: "pedro", password: "mala" })).rejects.toThrow(
      "Usuario o contraseña incorrectos",
    );
  });
});

describe("UsuarioBO.validarToken", () => {
  let acceso: any;
  let bo: UsuarioBO;

  beforeEach(() => {
    acceso = authAccesoMock();
    bo = new UsuarioBO(acceso);
  });

  it("devuelve el usuario asociado a un token válido", async () => {
    const token = jwt.sign({ username: "pedro" }, JWT_SECRET, { expiresIn: 60 });
    acceso.usuarioDAO.getByUsernameWithRoles.mockResolvedValue(userConRol());

    const dto = await bo.validarToken(token);
    expect(dto.idUsuario).toBe("1");
    expect(acceso.usuarioDAO.getByUsernameWithRoles).toHaveBeenCalledWith("pedro");
  });

  it("rechaza un token inválido", async () => {
    await expect(bo.validarToken("no-es-un-token")).rejects.toThrow(
      /Token inválido o expirado/,
    );
  });

  it("rechaza un token válido cuyo usuario ya no existe", async () => {
    const token = jwt.sign({ username: "fantasma" }, JWT_SECRET, { expiresIn: 60 });
    acceso.usuarioDAO.getByUsernameWithRoles.mockResolvedValue(null);
    await expect(bo.validarToken(token)).rejects.toThrow(/Usuario no encontrado/);
  });
});

describe("UsuarioBO.consultas", () => {
  let acceso: any;
  let bo: UsuarioBO;

  beforeEach(() => {
    acceso = authAccesoMock();
    bo = new UsuarioBO(acceso);
  });

  it("obtenerTodos mapea cada usuario", async () => {
    acceso.usuarioDAO.getAllWithRoles.mockResolvedValue([userConRol()]);
    const dtos = await bo.obtenerTodos();
    expect(dtos).toHaveLength(1);
    expect(dtos[0].idUsuario).toBe("1");
  });

  it("obtenerPorId devuelve null si no existe", async () => {
    acceso.usuarioDAO.getById.mockResolvedValue(null);
    await expect(bo.obtenerPorId("9")).resolves.toBeNull();
    expect(acceso.usuarioDAO.getById).toHaveBeenCalledWith(9n);
  });

  it("logout no lanza", async () => {
    await expect(bo.logout("token")).resolves.toBeUndefined();
  });
});

describe("UsuarioBO.crear", () => {
  let acceso: any;
  let bo: UsuarioBO;

  beforeEach(() => {
    acceso = authAccesoMock();
    bo = new UsuarioBO(acceso);
  });

  const nuevo = {
    username: "ana",
    password: "secreta",
    nombre: "Ana",
    apellido: "Díaz",
    email: "ana@x.com",
    telefono: "8110000000",
    is_active: true,
    roles: [{ idRol: "2", nombre: "vendedor", descripcion: null, modulos: [] }],
  };

  it("hashea la contraseña, guarda el teléfono y asigna roles", async () => {
    acceso.usuarioDAO.getByUsername.mockResolvedValue(null);
    acceso.usuarioDAO.create.mockResolvedValue(user({ id: 5n, username: "ana" }));
    acceso.usuarioDAO.getByUsernameWithRoles.mockResolvedValue(
      userConRol({ id: 5n, username: "ana" }),
    );

    const dto = await bo.crear(nuevo as any);

    const creado = acceso.usuarioDAO.create.mock.calls[0][0];
    expect(creado.telefono).toBe("8110000000");
    expect(creado.password).not.toBe("secreta");
    await expect(PasswordEncoder.matches("secreta", creado.password)).resolves.toBe(
      true,
    );
    expect(acceso.usuarioRolDAO.create).toHaveBeenCalledWith({
      user_id: 5n,
      role_id: 2n,
    });
    expect(dto.idUsuario).toBe("5");
  });

  it("activa por defecto cuando is_active viene indefinido", async () => {
    acceso.usuarioDAO.getByUsername.mockResolvedValue(null);
    acceso.usuarioDAO.create.mockResolvedValue(user({ id: 5n }));
    acceso.usuarioDAO.getByUsernameWithRoles.mockResolvedValue(userConRol({ id: 5n }));

    await bo.crear({ ...nuevo, is_active: undefined, roles: [] } as any);
    expect(acceso.usuarioDAO.create.mock.calls[0][0].is_active).toBe(true);
  });

  it("rechaza un username duplicado", async () => {
    acceso.usuarioDAO.getByUsername.mockResolvedValue(user());
    await expect(bo.crear(nuevo as any)).rejects.toThrow(
      /Ya existe un usuario con ese username/,
    );
    expect(acceso.usuarioDAO.create).not.toHaveBeenCalled();
  });
});

describe("UsuarioBO.actualizar", () => {
  let acceso: any;
  let bo: UsuarioBO;

  const dto = {
    idUsuario: "1",
    username: "pedro",
    nombre: "Pedro",
    apellido: "Luna",
    email: "p@x.com",
    telefono: "6441234567",
    is_active: true,
    roles: [],
  };

  beforeEach(() => {
    acceso = authAccesoMock();
    bo = new UsuarioBO(acceso);
    acceso.usuarioRolDAO.getByUserId.mockResolvedValue([]);
    acceso.usuarioDAO.update.mockResolvedValue(user());
    acceso.usuarioDAO.getByUsernameWithRoles.mockResolvedValue(user());
  });

  it("rechaza si el usuario no existe", async () => {
    acceso.usuarioDAO.getById.mockResolvedValue(null);
    await expect(bo.actualizar(1n, dto as any)).rejects.toThrow(
      /El usuario que desea editar no existe/,
    );
  });

  it("no falla al cambiar solo las mayúsculas del propio username", async () => {
    acceso.usuarioDAO.getById.mockResolvedValue(user({ username: "Pedro" }));
    // La búsqueda es insensible a mayúsculas y devuelve al mismo usuario.
    acceso.usuarioDAO.getByUsername.mockResolvedValue(user({ id: 1n, username: "Pedro" }));

    await expect(
      bo.actualizar(1n, { ...dto, username: "pedro" } as any),
    ).resolves.toBeDefined();
    expect(acceso.usuarioDAO.update).toHaveBeenCalled();
  });

  it("rechaza un username ya usado por otro usuario", async () => {
    acceso.usuarioDAO.getById.mockResolvedValue(user({ username: "pedro" }));
    acceso.usuarioDAO.getByUsername.mockResolvedValue(user({ id: 2n, username: "otro" }));

    await expect(
      bo.actualizar(1n, { ...dto, username: "otro" } as any),
    ).rejects.toThrow(/Ya existe un usuario con este nombre/);
  });

  it("rechaza un email ya usado aunque el email actual sea nulo", async () => {
    acceso.usuarioDAO.getById.mockResolvedValue(user({ email: null }));
    acceso.usuarioDAO.getByEmail.mockResolvedValue(user({ id: 2n, email: "tomado@x.com" }));

    await expect(
      bo.actualizar(1n, { ...dto, email: "tomado@x.com" } as any),
    ).rejects.toThrow(/Este correo ya está asociado con un usuario/);
  });

  it("rechaza un teléfono ya usado aunque el actual sea nulo", async () => {
    acceso.usuarioDAO.getById.mockResolvedValue(user({ telefono: null }));
    acceso.usuarioDAO.getByPhone.mockResolvedValue(user({ id: 2n, telefono: "811" }));

    await expect(
      bo.actualizar(1n, { ...dto, telefono: "811" } as any),
    ).rejects.toThrow(/Este telefono ya está asociado con un usuario/);
  });

  it("agrega y quita roles según la diferencia", async () => {
    acceso.usuarioDAO.getById.mockResolvedValue(user());
    acceso.usuarioRolDAO.getByUserId.mockResolvedValue([
      { id: 100n, user_id: 1n, role_id: 2n },
    ]);

    await bo.actualizar(1n, {
      ...dto,
      roles: [{ idRol: "3", nombre: "nuevo", descripcion: null, modulos: [] }],
    } as any);

    expect(acceso.usuarioRolDAO.create).toHaveBeenCalledWith({
      user_id: 1n,
      role_id: 3n,
    });
    expect(acceso.usuarioRolDAO.delete).toHaveBeenCalledWith(100n);
  });

  it("solo re-hashea la contraseña cuando viene", async () => {
    acceso.usuarioDAO.getById.mockResolvedValue(user());

    await bo.actualizar(1n, { ...dto, password: "" } as any);
    expect(acceso.usuarioDAO.update.mock.calls[0][1]).not.toHaveProperty("password");

    await bo.actualizar(1n, { ...dto, password: "nueva" } as any);
    const datos = acceso.usuarioDAO.update.mock.calls[1][1];
    expect(datos.password).not.toBe("nueva");
    await expect(PasswordEncoder.matches("nueva", datos.password)).resolves.toBe(true);
  });
});

describe("UsuarioBO.eliminar / alternarActivo", () => {
  let acceso: any;
  let bo: UsuarioBO;

  beforeEach(() => {
    acceso = authAccesoMock();
    bo = new UsuarioBO(acceso);
  });

  it("eliminar rechaza cuando el usuario no existe (regresión await)", async () => {
    acceso.usuarioDAO.getById.mockResolvedValue(null);
    await expect(bo.eliminar(9n)).rejects.toThrow(/no existe/);
    expect(acceso.usuarioDAO.delete).not.toHaveBeenCalled();
  });

  it("eliminar borra cuando el usuario existe", async () => {
    acceso.usuarioDAO.getById.mockResolvedValue(user());
    await expect(bo.eliminar(1n)).resolves.toBe(true);
    expect(acceso.usuarioDAO.delete).toHaveBeenCalledWith(1n);
  });

  it("alternarActivo rechaza cuando el usuario no existe (regresión await)", async () => {
    acceso.usuarioDAO.getById.mockResolvedValue(null);
    await expect(bo.alternarActivo(9n)).rejects.toThrow(/no existe/);
    expect(acceso.usuarioDAO.toggleActive).not.toHaveBeenCalled();
  });

  it("alternarActivo alterna cuando el usuario existe", async () => {
    acceso.usuarioDAO.getById.mockResolvedValue(user());
    await expect(bo.alternarActivo(1n)).resolves.toBe(true);
    expect(acceso.usuarioDAO.toggleActive).toHaveBeenCalledWith(1n);
  });
});

describe("RolBO", () => {
  let acceso: any;
  let bo: RolBO;

  beforeEach(() => {
    acceso = authAccesoMock();
    bo = new RolBO(acceso);
  });

  it("crear rechaza un nombre duplicado", async () => {
    acceso.rolDAO.obtenerPorNombre.mockResolvedValue(role());
    await expect(
      bo.crear({ nombre: "admin", descripcion: "d" }),
    ).rejects.toThrow(/Ya existe un rol con ese nombre/);
  });

  it("crear guarda los módulos y devuelve el DTO", async () => {
    acceso.rolDAO.obtenerPorNombre.mockResolvedValue(null);
    acceso.rolDAO.create.mockResolvedValue(role({ id: 9n, name: "nuevo" }));
    acceso.rolDAO.getByIdConModulos.mockResolvedValue(
      role({
        id: 9n,
        name: "nuevo",
        role_module_access: [{ module: "catalogo" }],
      }),
    );

    const dto = await bo.crear({
      nombre: "nuevo",
      descripcion: "d",
      modulos: ["catalogo", "reportes"],
    });

    expect(acceso.rolModuloDAO.create).toHaveBeenCalledWith({
      role_id: 9n,
      module: "catalogo",
    });
    expect(dto.idRol).toBe("9");
    expect(dto.modulos).toEqual(["catalogo"]);
  });

  it("obtenerTodos mapea roles con módulos", async () => {
    acceso.rolDAO.getAllConModulos.mockResolvedValue([
      role({ role_module_access: [{ module: "reportes" }] }),
    ]);
    const dtos = await bo.obtenerTodos();
    expect(dtos[0].modulos).toEqual(["reportes"]);
  });

  it("obtenerPorId devuelve null si no existe", async () => {
    acceso.rolDAO.getByIdConModulos.mockResolvedValue(null);
    await expect(bo.obtenerPorId("9")).resolves.toBeNull();
  });

  it("obtenerPorNombre delega al DAO", async () => {
    acceso.rolDAO.obtenerPorNombre.mockResolvedValue(role({ name: "admin" }));
    await expect(bo.obtenerPorNombre("admin")).resolves.toMatchObject({
      nombre: "admin",
    });
  });

  it("actualizar rechaza si el rol no existe", async () => {
    acceso.rolDAO.getById.mockResolvedValue(null);
    await expect(
      bo.actualizar("9", { idRol: "9", nombre: "x", descripcion: null, modulos: [] }),
    ).rejects.toThrow(/El rol que desea editar no existe/);
  });

  it("actualizar sincroniza módulos y datos", async () => {
    acceso.rolDAO.getById.mockResolvedValue(role());
    acceso.rolDAO.obtenerPorNombre.mockResolvedValue(null);
    acceso.rolModuloDAO.getByRoleId.mockResolvedValue([
      { id: 50n, role_id: 2n, module: "catalogo" },
    ]);
    acceso.rolDAO.update.mockResolvedValue(role());
    acceso.rolDAO.getByIdConModulos.mockResolvedValue(role());

    await bo.actualizar("2", {
      idRol: "2",
      nombre: "admin",
      descripcion: "d",
      modulos: ["reportes"],
    });

    expect(acceso.rolModuloDAO.create).toHaveBeenCalledWith({
      role_id: 2n,
      module: "reportes",
    });
    expect(acceso.rolModuloDAO.delete).toHaveBeenCalledWith(50n);
    expect(acceso.rolDAO.update).toHaveBeenCalledWith(2n, {
      name: "admin",
      description: "d",
    });
  });

  it("eliminar rechaza cuando el rol no existe (regresión await)", async () => {
    acceso.rolDAO.getById.mockResolvedValue(null);
    await expect(bo.eliminar("9")).rejects.toThrow(/no existe/);
    expect(acceso.rolDAO.delete).not.toHaveBeenCalled();
  });

  it("eliminar borra cuando el rol existe", async () => {
    acceso.rolDAO.getById.mockResolvedValue(role());
    await expect(bo.eliminar("2")).resolves.toBe(true);
    expect(acceso.rolDAO.delete).toHaveBeenCalledWith(2n);
  });
});
