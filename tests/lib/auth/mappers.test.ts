import { describe, expect, it } from "vitest";
import { UsuarioMapper } from "@/lib/auth/negocio/mappers/UsuarioMapper";
import { RolMapper } from "@/lib/auth/negocio/mappers/RolMapper";
import { PasswordEncoder } from "@/lib/auth/negocio/PasswordEncoder";

 

const role = (over: any = {}) => ({
  id: 2n,
  created_at: new Date(),
  name: "Vendedor",
  description: "Vende",
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
  telefono: "644",
  is_active: true,
  user_role: [],
  ...over,
});

describe("RolMapper", () => {
  it("toDTO incluye los módulos del rol", () => {
    const dto = RolMapper.toDTO(
      role({
        role_module_access: [
          { id: 1n, role_id: 2n, module: "catalogo" },
          { id: 2n, role_id: 2n, module: "reportes" },
        ],
      }) as any,
    );
    expect(dto).toEqual({
      idRol: "2",
      nombre: "Vendedor",
      descripcion: "Vende",
      modulos: ["catalogo", "reportes"],
    });
  });

  it("toDTO deja módulos vacíos cuando no vienen incluidos", () => {
    const dto = RolMapper.toDTO(role({ role_module_access: undefined }) as any);
    expect(dto.modulos).toEqual([]);
  });

  it("toEntity convierte el id a bigint", () => {
    const entity = RolMapper.toEntity({
      idRol: "2",
      nombre: "Vendedor",
      descripcion: "Vende",
      modulos: [],
    });
    expect(entity.id).toBe(2n);
    expect(entity.name).toBe("Vendedor");
  });

  it("toDTOArray mapea cada entidad", () => {
    const dtos = RolMapper.toDTOArray([role({ id: 1n }), role({ id: 2n })] as any);
    expect(dtos.map((d) => d.idRol)).toEqual(["1", "2"]);
  });
});

describe("UsuarioMapper.toDTO", () => {
  it("siempre incluye el módulo pos como piso implícito", () => {
    const dto = UsuarioMapper.toDTO(user({ user_role: [] }) as any);
    expect(dto.modulosPermitidos).toEqual(["pos"]);
  });

  it("une los módulos de todos los roles sin duplicados", () => {
    const dto = UsuarioMapper.toDTO(
      user({
        user_role: [
          {
            roles: role({
              role_module_access: [
                { module: "catalogo" },
                { module: "reportes" },
              ],
            }),
          },
          {
            roles: role({
              role_module_access: [{ module: "catalogo" }, { module: "usuarios" }],
            }),
          },
        ],
      }) as any,
    );
    expect(dto.modulosPermitidos.sort()).toEqual(
      ["catalogo", "pos", "reportes", "usuarios"].sort(),
    );
  });

  it("ignora roles nulos", () => {
    const dto = UsuarioMapper.toDTO(
      user({ user_role: [{ roles: null }, { roles: role() }] }) as any,
    );
    expect(dto.roles).toHaveLength(1);
  });

  it("usa cadenas vacías y no expone la contraseña", () => {
    const dto = UsuarioMapper.toDTO(
      user({
        username: null,
        nombre: null,
        apellido: null,
        email: null,
        telefono: null,
        is_active: false,
        user_role: undefined,
      }) as any,
    );
    expect(dto).toEqual({
      idUsuario: "1",
      username: "",
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      is_active: false,
      roles: [],
      modulosPermitidos: ["pos"],
    });
    expect(dto).not.toHaveProperty("password");
  });
});

describe("UsuarioMapper.toEntity", () => {
  it("convierte el DTO a entidad sin contraseña", () => {
    const entity = UsuarioMapper.toEntity({
      idUsuario: "5",
      username: "u",
      nombre: "N",
      apellido: "A",
      email: "",
      telefono: "",
      is_active: true,
      roles: [],
      modulosPermitidos: ["pos"],
    });
    expect(entity.id).toBe(5n);
    expect(entity.username).toBe("u");
    expect(entity.password).toBeNull();
  });
});

describe("PasswordEncoder", () => {
  it("hashea y verifica una contraseña", async () => {
    const hash = await PasswordEncoder.encode("secreta");
    expect(hash).not.toBe("secreta");
    await expect(PasswordEncoder.matches("secreta", hash)).resolves.toBe(true);
    await expect(PasswordEncoder.matches("otra", hash)).resolves.toBe(false);
  });
});
