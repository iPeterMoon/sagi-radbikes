#!/usr/bin/env node
/**
 * Smoke test HTTP contra una instancia de SAGI ya levantada.
 *
 * Uso:
 *   npm run dev                     # en otra terminal
 *   npm run test:smoke              # solo lecturas (seguro para producción)
 *   SMOKE_WRITE=1 npm run test:smoke # además crea/edita/elimina datos temporales
 *
 * Variables de entorno:
 *   SMOKE_BASE_URL          URL base (default: http://localhost:3000)
 *   SMOKE_USER / SMOKE_PASSWORD     usuario admin (default: plunal / crujones)
 *   SMOKE_LIMITED_USER / SMOKE_LIMITED_PASSWORD
 *                           usuario sin módulos configurados (default: vendedor_smoke)
 *   SMOKE_WRITE=1           habilita pruebas de escritura (SOLO en base local)
 *   SMOKE_IMAGES=1          habilita subida de imágenes (requiere Supabase local)
 *   SMOKE_PRINTER=1         habilita impresión real (requiere impresora USB)
 *   SMOKE_REPORT=ruta       escribe un JSON con el detalle de los checks
 */
import fs from "node:fs";

const BASE = (process.env.SMOKE_BASE_URL || "http://localhost:3000").replace(
  /\/$/,
  "",
);
const USER = process.env.SMOKE_USER || "plunal";
const PASSWORD = process.env.SMOKE_PASSWORD || "crujones";
// Un valor vacío explícito desactiva los checks de rol limitado (ej. smoke de producción).
const LIMITED_USER =
  process.env.SMOKE_LIMITED_USER === undefined ? "vendedor_smoke" : process.env.SMOKE_LIMITED_USER;
const LIMITED_PASSWORD =
  process.env.SMOKE_LIMITED_PASSWORD === undefined ? PASSWORD : process.env.SMOKE_LIMITED_PASSWORD;
const WRITE = process.env.SMOKE_WRITE === "1";
const IMAGES = process.env.SMOKE_IMAGES === "1";
const PRINTER = process.env.SMOKE_PRINTER === "1";
const SUFFIX = `Smoke${Date.now()}`;

const resultados = [];
let failures = 0;
let checks = 0;

function check(name, condition, detail = "") {
  checks += 1;
  const ok = Boolean(condition);
  if (!ok) failures += 1;
  resultados.push({ name, ok, detail });
  console.log(`  ${ok ? "✓" : "✗"} ${name}${!ok && detail ? ` — ${detail}` : ""}`);
}

function section(title) {
  console.log(`\n  ${title}`);
}

function createClient() {
  let cookie = "";
  return {
    get cookie() {
      return cookie;
    },
    async request(path, { method = "GET", body, auth = true, headers = {} } = {}) {
      const finalHeaders = { ...headers };
      if (body !== undefined) finalHeaders["Content-Type"] = "application/json";
      if (auth && cookie) finalHeaders.Cookie = cookie;

      const res = await fetch(`${BASE}${path}`, {
        method,
        headers: finalHeaders,
        body: body === undefined ? undefined : JSON.stringify(body),
        redirect: "manual",
      });

      const setCookies =
        typeof res.headers.getSetCookie === "function"
          ? res.headers.getSetCookie()
          : [res.headers.get("set-cookie")].filter(Boolean);
      for (const value of setCookies) {
        const match = /(?:^|,\s*)token=([^;]+)/.exec(value);
        if (match && match[1]) cookie = `token=${match[1]}`;
      }

      const text = await res.text();
      let json;
      try {
        json = text ? JSON.parse(text) : undefined;
      } catch {
        json = undefined;
      }
      return {
        res,
        status: res.status,
        text,
        json,
        location: res.headers.get("location"),
        setCookie: res.headers.get("set-cookie"),
      };
    },
  };
}

const status = (name, response, expected, extra = () => true) =>
  check(
    name,
    response.status === expected && extra(response),
    `status ${response.status} ${response.text.slice(0, 160)}`,
  );

const isRedirectTo = (response, path) =>
  [302, 307, 308].includes(response.status) &&
  Boolean(response.location?.includes(path));

const hasIdAndName = (items, idKey) =>
  items.every((item) => Boolean(item[idKey]) && typeof item.nombre === "string");

async function main() {
  console.log(`Smoke test contra ${BASE} (${WRITE ? "lectura + escritura" : "solo lectura"})\n`);

  const admin = createClient();
  const limited = createClient();
  const anon = createClient();
  let token = "";

  section("Páginas públicas y middleware");
  status("GET /login responde 200", await anon.request("/login", { auth: false }), 200);
  const root = await anon.request("/", { auth: false });
  check("GET / sin sesión redirige a /login", isRedirectTo(root, "/login"), `status ${root.status} → ${root.location}`);
  status("API sin sesión responde 401", await anon.request("/api/inventario/productos", { auth: false }), 401);
  const catalogoAnon = await anon.request("/catalogo", { auth: false });
  check("GET /catalogo sin sesión redirige a /login", isRedirectTo(catalogoAnon, "/login"), `status ${catalogoAnon.status}`);

  section("Autenticación");
  const badLogin = await anon.request("/api/auth/login", {
    method: "POST",
    auth: false,
    body: { username: USER, password: "password-incorrecto" },
  });
  status("login con contraseña inválida responde 401", badLogin, 401);

  const login = await admin.request("/api/auth/login", {
    method: "POST",
    auth: false,
    body: { username: USER, password: PASSWORD },
  });
  status("POST /api/auth/login responde 200 con token", login, 200, (r) => Boolean(r.json?.token));
  token = login.json?.token || "";
  check("la cookie de sesión se guardó", Boolean(admin.cookie));
  check("el login devuelve el usuario con idUsuario", Boolean(login.json?.usuario?.idUsuario));

  const validate = await admin.request("/api/auth/validate");
  status("GET /api/auth/validate con cookie responde 200", validate, 200, (r) =>
    Array.isArray(r.json?.modulosPermitidos),
  );
  check(
    "el admin tiene los módulos configurables",
    ["dashboard", "catalogo", "reportes", "usuarios", "configuracion"].every((m) =>
      validate.json?.modulosPermitidos?.includes(m),
    ),
    JSON.stringify(validate.json?.modulosPermitidos),
  );

  const bearer = await anon.request("/api/auth/validate", {
    auth: false,
    headers: { Authorization: `Bearer ${token}` },
  });
  status("validate con header Bearer responde 200", bearer, 200);
  status(
    "validate con token inválido responde 401",
    await anon.request("/api/auth/validate", {
      auth: false,
      headers: { Authorization: "Bearer token-invalido" },
    }),
    401,
  );
  const logout = await anon.request("/api/auth/logout", {
    method: "POST",
    auth: false,
    headers: { Authorization: `Bearer ${token}` },
  });
  status("POST /api/auth/logout responde 200", logout, 200);
  check("logout limpia la cookie", /token=;/.test(logout.setCookie || ""), logout.setCookie || "");

  if (LIMITED_USER) {
    section("Permisos por módulo");
    const limitedLogin = await limited.request("/api/auth/login", {
      method: "POST",
      auth: false,
      body: { username: LIMITED_USER, password: LIMITED_PASSWORD },
    });
    status("login del usuario limitado responde 200", limitedLogin, 200);
    check(
      "POS siempre está permitido y catálogo no",
      limitedLogin.json?.usuario?.modulosPermitidos?.includes("pos") &&
        !limitedLogin.json?.usuario?.modulosPermitidos?.includes("catalogo"),
      JSON.stringify(limitedLogin.json?.usuario?.modulosPermitidos),
    );
    status("API de catálogo con rol limitado responde 403", await limited.request("/api/inventario/productos"), 403);
    status("API del POS con rol limitado responde 200", await limited.request("/api/pos/productos"), 200);
    const limitedCatalogo = await limited.request("/catalogo");
    check("página de catálogo con rol limitado redirige a /pos", isRedirectTo(limitedCatalogo, "/pos"), `status ${limitedCatalogo.status}`);
  } else {
    console.log("\n  (checks de rol limitado omitidos: SMOKE_LIMITED_USER está vacío)");
  }

  section("Páginas autenticadas");
  for (const ruta of ["/dashboard", "/catalogo", "/pos", "/reportes", "/usuarios", "/configuracion"]) {
    status(`GET ${ruta} responde 200`, await admin.request(ruta), 200);
  }

  section("APIs de solo lectura");
  const inventario = await admin.request("/api/inventario/productos");
  status("GET /api/inventario/productos responde 200", inventario, 200, (r) => Array.isArray(r.json));
  if (Array.isArray(inventario.json)) {
    check(
      "los productos incluyen calcularIVA booleano",
      inventario.json.every((p) => typeof p.calcularIVA === "boolean"),
    );
    const filtrado = await admin.request("/api/inventario/productos?busqueda=__no_existe__");
    status("filtro de búsqueda responde 200", filtrado, 200, (r) => Array.isArray(r.json));
    check("la búsqueda inexistente devuelve 0 productos", filtrado.json?.length === 0);
  }

  const pos = await admin.request("/api/pos/productos");
  status("GET /api/pos/productos responde 200", pos, 200, (r) => Array.isArray(r.json));
  if (Array.isArray(pos.json)) {
    check(
      "los productos del POS incluyen calcularIVA booleano",
      pos.json.every((p) => typeof p.calcularIVA === "boolean"),
    );
    const busqueda = await admin.request("/api/pos/productos?busqueda=__no_existe__");
    status("búsqueda del POS responde 200", busqueda, 200, (r) => Array.isArray(r.json));
  }

  const marcas = await admin.request("/api/inventario/marcas");
  const categorias = await admin.request("/api/inventario/categorias");
  const subcategorias = await admin.request("/api/inventario/subcategorias");
  status("GET /api/inventario/marcas responde 200", marcas, 200, (r) => Array.isArray(r.json));
  status("GET /api/inventario/categorias responde 200", categorias, 200, (r) => Array.isArray(r.json));
  status("GET /api/inventario/subcategorias responde 200", subcategorias, 200, (r) => Array.isArray(r.json));
  if (Array.isArray(marcas.json)) check("las marcas tienen idMarca y nombre", hasIdAndName(marcas.json, "idMarca"));
  if (Array.isArray(categorias.json)) check("las categorías tienen idCategoria y nombre", hasIdAndName(categorias.json, "idCategoria"));

  const primerProducto = inventario.json?.[0];
  if (primerProducto?.idProducto) {
    status("GET producto por id responde 200", await admin.request(`/api/inventario/productos/${primerProducto.idProducto}`), 200);
    status("GET variantes del producto responde 200", await admin.request(`/api/inventario/productos/${primerProducto.idProducto}/variantes`), 200, (r) => Array.isArray(r.json));
    status("GET etiquetas del producto responde 200", await admin.request(`/api/inventario/etiquetas/${primerProducto.idProducto}`), 200, (r) => Array.isArray(r.json));
  }

  const primerVariante = pos.json?.[0];
  if (primerVariante?.idVariante) {
    status("GET atributos de variante responde 200", await admin.request(`/api/inventario/atributos-variante/${primerVariante.idVariante}`), 200, (r) => Array.isArray(r.json));
  }

  status("GET /api/pos/vendedores responde 200", await admin.request("/api/pos/vendedores"), 200, (r) => Array.isArray(r.json));
  status("GET /api/pos/carrito responde 200", await admin.request("/api/pos/carrito"), 200, (r) => Array.isArray(r.json));
  status("GET /api/dashboard/resumen responde 200", await admin.request("/api/dashboard/resumen"), 200, (r) => Boolean(r.json?.ventas));
  status("GET /api/configuracion responde 200", await admin.request("/api/configuracion"), 200, (r) => typeof r.json?.margenGananciaSugerido === "number");
  status("GET /api/roles responde 200", await admin.request("/api/roles"), 200, (r) => Array.isArray(r.json));
  status("GET /api/users responde 200", await admin.request("/api/users"), 200, (r) => Array.isArray(r.json));

  const hoy = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  const desde = iso(new Date(hoy.getTime() - 2 * 86400000));
  const hasta = iso(new Date(hoy.getTime() + 2 * 86400000));
  const reporte = await admin.request(`/api/reportes/ventas?desde=${desde}&hasta=${hasta}`);
  status("GET /api/reportes/ventas con rango válido responde 200", reporte, 200, (r) => Boolean(r.json?.resumen));
  status("reporte sin fechas responde 400", await admin.request("/api/reportes/ventas"), 400);
  status("reporte con rango invertido responde 400", await admin.request(`/api/reportes/ventas?desde=${hasta}&hasta=${desde}`), 400);
  const fechaLejana = iso(new Date(hoy.getTime() + 800 * 86400000));
  status("reporte con rango mayor a 1 año responde 400", await admin.request(`/api/reportes/ventas?desde=${desde}&hasta=${fechaLejana}`), 400);

  if (PRINTER) {
    section("Impresión (opt-in)");
    status("POST /api/print sin folio responde 400", await admin.request("/api/print", { method: "POST", body: {} }), 400);
    status("POST /api/print con folio inexistente responde 404", await admin.request("/api/print", { method: "POST", body: { folio: "__no_existe__" } }), 404);
  }

  if (!WRITE) {
    console.log("\n  (lecturas solamente; usá SMOKE_WRITE=1 o npm run test:smoke:local:write para probar escrituras)");
    return finish();
  }

  section("Escritura: catálogo");
  const marcaId = marcas.json?.[0]?.idMarca;
  const categoriaId = categorias.json?.[0]?.idCategoria;
  const subcategoriaId = subcategorias.json?.[0]?.idSubCategoria;
  if (!marcaId || !categoriaId || !subcategoriaId) {
    check("hay marca, categoría y subcategoría para crear productos", false, "corré el seed de smoke");
  } else {
    const nombre = `SMOKE ${SUFFIX}`;
    const codigo = `SMOKE-${Date.now()}`;
    const creado = await admin.request("/api/inventario/productos", {
      method: "POST",
      body: {
        nombre,
        precio: 100,
        costo: 50,
        stock: 5,
        codigoDeBarras: codigo,
        minStock: 1,
        descripcion: "producto temporal de smoke test",
        calcularIVA: false,
        idCategoria: categoriaId,
        idMarca: marcaId,
        imagenesArchivo: [],
        idSubCategoria: subcategoriaId,
      },
    });
    status("POST producto con calcularIVA=false responde 201", creado, 201, (r) => r.json?.calcularIVA === false);
    const id = creado.json?.idProducto;

    if (id) {
      status("GET producto creado responde 200", await admin.request(`/api/inventario/productos/${id}`), 200, (r) => r.json?.calcularIVA === false);

      const actualizado = await admin.request(`/api/inventario/productos/${id}`, {
        method: "PUT",
        body: {
          idProducto: id,
          nombre,
          precio: 100,
          costo: 50,
          stock: 5,
          codigoDeBarras: "",
          minStock: 1,
          descripcion: "producto temporal de smoke test",
          calcularIVA: true,
          idCategoria: categoriaId,
          imagenesNuevas: [],
          imagenesEliminar: [],
          idImagenPrincipal: "",
          idMarca: marcaId,
          idSubCategoria: subcategoriaId,
        },
      });
      status("PUT producto cambia calcularIVA a true", actualizado, 200, (r) => r.json?.calcularIVA === true);

      const variantes = await admin.request(`/api/inventario/productos/${id}/variantes`);
      const varianteCreada = await admin.request(`/api/inventario/productos/${id}/variantes`, {
        method: "POST",
        body: { precio: 75, costo: 30, stock: 4, minStock: 1, codigoDeBarras: `SV-${Date.now()}`, atributos: [{ nombre: "Color", valor: "Rojo" }] },
      });
      status("POST variante responde 201", varianteCreada, 201, (r) => Boolean(r.json?.idVariante));
      const idVariante = varianteCreada.json?.idVariante;
      if (idVariante) {
        status("GET variantes del producto incluye la nueva", variantes, 200);
        status("PUT variante responde 200", await admin.request(`/api/inventario/variantes/${idVariante}`, { method: "PUT", body: { precio: 80, costo: 30, stock: 4, minStock: 1 } }), 200);
        status("PATCH ajustarStock responde 200", await admin.request(`/api/inventario/variantes/${idVariante}`, { method: "PATCH", body: { action: "adjustStock", cantidad: 2 } }), 200);
        status("PATCH toggleStatus responde 200", await admin.request(`/api/inventario/variantes/${idVariante}`, { method: "PATCH", body: { action: "toggleStatus" } }), 200);
        const atributos = await admin.request(`/api/inventario/atributos-variante/${idVariante}`);
        if (Array.isArray(atributos.json) && atributos.json.length > 0) {
          status(
            "DELETE atributo por idAtributo responde 204",
            await admin.request(`/api/inventario/atributos-variante/atributo/${atributos.json[0].idAtributo}`, { method: "DELETE" }),
            204,
          );
        }
        status("DELETE variante responde 204", await admin.request(`/api/inventario/variantes/${idVariante}`, { method: "DELETE" }), 204);
      }

      const etiqueta = await admin.request("/api/inventario/etiquetas", {
        method: "POST",
        body: { nombre: "color", valor: "rojo", idProducto: id },
      });
      status("POST etiqueta responde 201", etiqueta, 201, (r) => Boolean(r.json?.idEtiqueta));
      status(
        "DELETE etiqueta por idEtiqueta responde 204",
        await admin.request(`/api/inventario/etiquetas/etiqueta/${etiqueta.json?.idEtiqueta}`, { method: "DELETE" }),
        204,
      );

      if (IMAGES) {
        section("Imágenes (opt-in)");
        const form = new FormData();
        form.append("archivos", new Blob(["dummy"], { type: "image/png" }), "smoke.png");
        const imagen = await fetch(`${BASE}/api/inventario/productos/${id}/imagenes`, {
          method: "POST",
          headers: { Cookie: admin.cookie },
          body: form,
          redirect: "manual",
        });
        check("POST imagen responde 201", imagen.status === 201, `status ${imagen.status}`);
      }

      status("DELETE producto responde 204", await admin.request(`/api/inventario/productos/${id}`, { method: "DELETE" }), 204);
    }
  }

  section("Escritura: carrito y venta (IVA mixto)");
  await admin.request("/api/pos/carrito", { method: "DELETE" });
  const posActualizado = await admin.request("/api/pos/productos");
  const conIVA = posActualizado.json?.find((p) => p.calcularIVA === true);
  const conIVAIncluido = posActualizado.json?.find((p) => p.calcularIVA === false);
  check(
    "hay variantes con precio base y con precio con IVA incluido",
    Boolean(conIVA && conIVAIncluido),
    `conIVA=${conIVA?.idVariante} conIVAIncluido=${conIVAIncluido?.idVariante}`,
  );

  if (conIVA && conIVAIncluido) {
    const itemConIVA = {
      idVariante: conIVA.idVariante,
      nombre: conIVA.nombre,
      cantidad: 2,
      precioUnitario: conIVA.precio,
      subtotal: 2 * conIVA.precio,
      urlImagen: conIVA.urlImagen || "",
      porcentajeImpuesto: 16,
      precioIncluyeIVA: false,
    };
    const itemIVAIncluido = {
      idVariante: conIVAIncluido.idVariante,
      nombre: conIVAIncluido.nombre,
      cantidad: 1,
      precioUnitario: conIVAIncluido.precio,
      subtotal: conIVAIncluido.precio,
      urlImagen: conIVAIncluido.urlImagen || "",
      porcentajeImpuesto: 16,
      precioIncluyeIVA: true,
    };
    const agregado = await admin.request("/api/pos/carrito", { method: "POST", body: itemConIVA });
    status("POST carrito responde 200", agregado, 200, (r) => Array.isArray(r.json) && r.json.length === 1);
    const modificado = await admin.request(`/api/pos/carrito/${conIVA.idVariante}`, { method: "PATCH", body: { cantidad: 2 } });
    status("PATCH carrito responde 200", modificado, 200, (r) => Array.isArray(r.json));
    await admin.request("/api/pos/carrito", { method: "POST", body: itemIVAIncluido });
    const carrito = await admin.request("/api/pos/carrito");
    status("GET carrito devuelve 2 items", carrito, 200, (r) => r.json?.length === 2);

    const stockAntes = Object.fromEntries(
      (await admin.request("/api/pos/productos")).json.map((p) => [p.idVariante, p.stock]),
    );
    const venta = await admin.request("/api/pos/venta", {
      method: "POST",
      body: {
        idUsuario: login.json?.usuario?.idUsuario,
        metodoPago: "Efectivo",
        porcentajeImpuesto: 16,
        productos: [itemConIVA, itemIVAIncluido],
      },
    });
    status("POST /api/pos/venta responde 201", venta, 201, (r) => Boolean(r.json?.folio));
    const redondear = (n) => Math.round(n * 100) / 100;
    const ivaBase = redondear(2 * conIVA.precio * 0.16);
    const ivaIncluido = redondear(conIVAIncluido.precio - conIVAIncluido.precio / 1.16);
    const esperadoSubtotal = redondear(2 * conIVA.precio + conIVAIncluido.precio - ivaIncluido);
    const esperadoIVA = redondear(ivaBase + ivaIncluido);
    const esperadoTotal = redondear(2 * conIVA.precio + conIVAIncluido.precio + ivaBase);
    check("subtotal de la venta mixta es correcto", Math.abs(venta.json?.subtotal - esperadoSubtotal) < 0.02, `${venta.json?.subtotal} vs ${esperadoSubtotal}`);
    check("IVA se suma y se extrae según cada producto", Math.abs(venta.json?.importeIVA - esperadoIVA) < 0.02, `${venta.json?.importeIVA} vs ${esperadoIVA}`);
    check("total de la venta mixta es correcto", Math.abs(venta.json?.total - esperadoTotal) < 0.02, `${venta.json?.total} vs ${esperadoTotal}`);

    const stockDespues = Object.fromEntries(
      (await admin.request("/api/pos/productos")).json.map((p) => [p.idVariante, p.stock]),
    );
    check("el stock de la variante con IVA bajó 2 unidades", stockDespues[conIVA.idVariante] === stockAntes[conIVA.idVariante] - 2);
    check("el stock de la variante con IVA incluido bajó 1 unidad", stockDespues[conIVAIncluido.idVariante] === stockAntes[conIVAIncluido.idVariante] - 1);

    const ventaSinStock = await admin.request("/api/pos/venta", {
      method: "POST",
      body: {
        idUsuario: login.json?.usuario?.idUsuario,
        metodoPago: "Efectivo",
        porcentajeImpuesto: 16,
        productos: [{ ...itemConIVA, cantidad: 100000, subtotal: 100000 * conIVA.precio }],
      },
    });
    status("venta con stock insuficiente responde 409", ventaSinStock, 409);
    status("venta con carrito vacío responde error controlado", await admin.request("/api/pos/venta", {
      method: "POST",
      body: { idUsuario: login.json?.usuario?.idUsuario, metodoPago: "Efectivo", porcentajeImpuesto: 16, productos: [] },
    }), 500);

    const reportePost = await admin.request(`/api/reportes/ventas?desde=${desde}&hasta=${hasta}`);
    check("la venta aparece en el reporte de ventas", (reportePost.json?.ventas || []).some((v) => v.folio === venta.json?.folio));
    const dashboardPost = await admin.request("/api/dashboard/resumen");
    status("el dashboard sigue respondiendo tras la venta", dashboardPost, 200);
  }

  await admin.request(`/api/pos/carrito/${conIVA?.idVariante || "none"}`, { method: "DELETE" });
  await admin.request("/api/pos/carrito", { method: "DELETE" });
  status("DELETE carrito responde 200", await admin.request("/api/pos/carrito"), 200, (r) => Array.isArray(r.json) && r.json.length === 0);

  section("Escritura: roles y usuarios");
  const rol = await admin.request("/api/roles", {
    method: "POST",
    body: { nombre: `Rol ${SUFFIX}`, descripcion: "Rol temporal de smoke test", modulos: ["reportes"] },
  });
  status("POST /api/roles responde 201", rol, 201, (r) => Boolean(r.json?.idRol));
  const idRol = rol.json?.idRol;
  if (idRol) {
    status("GET rol creado responde 200", await admin.request(`/api/roles/${idRol}`), 200);
    status("PUT rol responde 200", await admin.request(`/api/roles/${idRol}`, {
      method: "PUT",
      body: { nombre: `Rol ${SUFFIX} editado`, descripcion: "Editado por smoke", modulos: [] },
    }), 200);
  }

  const username = `smoke_${Date.now()}`;
  const usuario = await admin.request("/api/users", {
    method: "POST",
    body: {
      username,
      password: "smoke-pass-123",
      nombre: "Smoke",
      apellido: "User",
      email: `${username}@example.com`,
      telefono: `5${Date.now()}`,
      is_active: true,
      roles: [],
    },
  });
  status("POST /api/users responde 201", usuario, 201, (r) => Boolean(r.json?.idUsuario));
  const idUsuario = usuario.json?.idUsuario;
  if (idUsuario) {
    status("GET usuario creado responde 200", await admin.request(`/api/users/${idUsuario}`), 200);
    status("PATCH usuario alterna is_active", await admin.request(`/api/users/${idUsuario}`, { method: "PATCH" }), 200, (r) => r.json?.success === true);
    status("DELETE usuario responde 200", await admin.request(`/api/users/${idUsuario}`, { method: "DELETE" }), 200, (r) => r.json?.success === true);
  }
  if (idRol) {
    status("DELETE rol responde 200", await admin.request(`/api/roles/${idRol}`, { method: "DELETE" }), 200);
  }

  section("Escritura: configuración");
  const configOriginal = await admin.request("/api/configuracion");
  const margenOriginal = configOriginal.json?.margenGananciaSugerido;
  const margenTemporal = Number(margenOriginal) + 0.01;
  const configCambiada = await admin.request("/api/configuracion", { method: "PUT", body: { margenGananciaSugerido: margenTemporal } });
  status("PUT /api/configuracion responde 200", configCambiada, 200, (r) => r.json?.margenGananciaSugerido === margenTemporal);
  const configRestaurada = await admin.request("/api/configuracion", { method: "PUT", body: { margenGananciaSugerido: margenOriginal } });
  status("configuración restaurada", configRestaurada, 200, (r) => r.json?.margenGananciaSugerido === margenOriginal);

  return finish();
}

function finish() {
  console.log(`\n${checks - failures}/${checks} checks OK`);
  if (process.env.SMOKE_REPORT) {
    fs.writeFileSync(
      process.env.SMOKE_REPORT,
      JSON.stringify({ base: BASE, write: WRITE, checks, failures, resultados }, null, 2),
    );
    console.log(`Reporte escrito en ${process.env.SMOKE_REPORT}`);
  }
  if (failures > 0) {
    console.error(`Fallaron ${failures} check(s).`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`\nError ejecutando el smoke test: ${error.message}`);
  console.error("¿Está corriendo el servidor? Probá `npm run dev` y luego `npm run test:smoke`.");
  process.exitCode = 1;
});
