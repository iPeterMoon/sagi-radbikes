import { vi } from "vitest";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Crea un doble de `ICatalogoAccesoDatos` con todos los DAOs mockeados.
 * Cada método es un `vi.fn()` listo para configurarse con `mockResolvedValue`.
 */
export function catalogoAccesoMock(): any {
  return {
    prisma: {},
    supabase: {},
    productDAO: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getBelowStock: vi.fn(),
      getByCategory: vi.fn(),
      getBySubCategory: vi.fn(),
      getByBrand: vi.fn(),
      getActive: vi.fn(),
      getByFilter: vi.fn(),
    },
    categoryDAO: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getByName: vi.fn(),
    },
    brandDAO: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getByName: vi.fn(),
    },
    subCategoryDAO: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getByCategory: vi.fn(),
      getByName: vi.fn(),
    },
    productImageDAO: {
      create: vi.fn(),
      getById: vi.fn(),
      delete: vi.fn(),
      getByProduct: vi.fn(),
      getMainByProduct: vi.fn(),
      setMain: vi.fn(),
      deleteByProduct: vi.fn(),
      getByVariant: vi.fn(),
    },
    labelDAO: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getByProduct: vi.fn(),
      deleteByProduct: vi.fn(),
    },
    variantDAO: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getByProduct: vi.fn(),
      getActive: vi.fn(),
      getBySKU: vi.fn(),
      getByBarcode: vi.fn(),
      getBelowStock: vi.fn(),
      decreaseStock: vi.fn(),
      increaseStock: vi.fn(),
    },
    variantAttributeDAO: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getByVariant: vi.fn(),
      deleteByVariant: vi.fn(),
    },
  };
}

/** Crea un doble de `IAuthAccesoDatos`. */
export function authAccesoMock(): any {
  return {
    prisma: {},
    usuarioDAO: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getAllWithRoles: vi.fn(),
      getByUsername: vi.fn(),
      getByUsernameWithRoles: vi.fn(),
      getByEmail: vi.fn(),
      getByEmailWithRoles: vi.fn(),
      getByPhone: vi.fn(),
      getByPhoneWithRoles: vi.fn(),
      toggleActive: vi.fn(),
    },
    usuarioRolDAO: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getByUserId: vi.fn(),
    },
    rolDAO: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      obtenerPorNombre: vi.fn(),
      getAllConModulos: vi.fn(),
      getByIdConModulos: vi.fn(),
    },
    rolModuloDAO: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getByRoleId: vi.fn(),
    },
  };
}

/** Crea un doble de `IPOSAccesoDatos`. */
export function posAccesoMock(): any {
  return {
    ventaDAO: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getByUsuario: vi.fn(),
      getByFolio: vi.fn(),
      createWithDetails: vi.fn(),
    },
    detalleVentaDAO: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getByVenta: vi.fn(),
      createMany: vi.fn(),
    },
    pagoDAO: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getByVenta: vi.fn(),
      createPago: vi.fn(),
    },
    productoDAO: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getActivos: vi.fn(),
      getBySKU: vi.fn(),
      getByCodigoBarras: vi.fn(),
      restarStock: vi.fn(),
      buscarPorNombreOSKU: vi.fn(),
    },
  };
}

/** Crea un doble de Prisma limitado a un delegado de modelo. */
export function prismaDelegateMock() {
  return {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
    groupBy: vi.fn(),
  };
}

/** Respuesta de `fetch` falsa y configurable. */
export function fakeResponse(options: {
  ok?: boolean;
  status?: number;
  json?: () => Promise<unknown>;
}) {
  return {
    ok: options.ok ?? true,
    status: options.status ?? 200,
    json: options.json ?? (() => Promise.resolve({})),
  } as Response;
}
