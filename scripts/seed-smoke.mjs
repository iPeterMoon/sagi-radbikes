#!/usr/bin/env node
/**
 * Seed determinista para la base de smoke tests.
 *
 * Solo se ejecuta con SMOKE_SEED=1 y contra una base local (hostname
 * localhost/127.0.0.1). Idempotente: puede correrse varias veces.
 *
 * Uso:
 *   SMOKE_SEED=1 node scripts/with-env.js .env.smoke -- node scripts/seed-smoke.mjs
 */
import { Client } from "pg";
import bcrypt from "bcrypt";

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (process.env.SMOKE_SEED !== "1") {
  console.error("Activá el seed con SMOKE_SEED=1.");
  process.exit(1);
}
if (!url) {
  console.error("Falta DIRECT_URL o DATABASE_URL.");
  process.exit(1);
}
const hostname = new URL(url).hostname;
if (!["localhost", "127.0.0.1"].includes(hostname)) {
  console.error(`Refusing to seed a non-local database (${hostname}).`);
  process.exit(1);
}

const client = new Client({ connectionString: url });
await client.connect();

const MODULOS_ADMIN = ["dashboard", "catalogo", "reportes", "usuarios", "configuracion"];
const PASSWORD = "crujones";
const suffix = process.env.SMOKE_SUFFIX || "SMOKE";

async function one(sql, params = []) {
  const result = await client.query(sql, params);
  return result.rows[0] ?? null;
}

async function ensureRole(nombre, modulos, descripcion) {
  let rol = await one("SELECT id FROM roles WHERE name = $1", [nombre]);
  if (!rol) {
    rol = await one(
      "INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING id",
      [nombre, descripcion],
    );
  }
  await client.query("DELETE FROM role_module_access WHERE role_id = $1", [rol.id]);
  for (const modulo of modulos) {
    await client.query(
      "INSERT INTO role_module_access (role_id, module) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [rol.id, modulo],
    );
  }
  return rol.id;
}

async function ensureUser(username, roleId, nombre, apellido, email, telefono, hash) {
  let usuario = await one("SELECT id FROM users WHERE username = $1", [username]);
  if (!usuario) {
    usuario = await one(
      `INSERT INTO users (username, password, nombre, apellido, email, telefono, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING id`,
      [username, hash, nombre, apellido, email, telefono],
    );
  } else {
    await client.query(
      "UPDATE users SET password = $1, is_active = true WHERE id = $2",
      [hash, usuario.id],
    );
  }
  await client.query("DELETE FROM user_role WHERE user_id = $1", [usuario.id]);
  await client.query("INSERT INTO user_role (user_id, role_id) VALUES ($1, $2)", [
    usuario.id,
    roleId,
  ]);
  return usuario.id;
}

async function ensureNamed(table, name, extraColumn, extraValue) {
  let fila = await one(`SELECT id FROM ${table} WHERE name = $1`, [name]);
  if (!fila) {
    fila = await one(
      `INSERT INTO ${table} (name, created_at${extraColumn ? `, ${extraColumn}` : ""})
       VALUES ($1, NOW()${extraColumn ? ", $2" : ""}) RETURNING id`,
      extraColumn ? [name, extraValue] : [name],
    );
  }
  return fila.id;
}

async function ensureProduct(nombre, sku, precio, costo, stock, hasIva, subcategoryId, brandId) {
  let producto = await one("SELECT id FROM products WHERE name = $1", [nombre]);
  if (!producto) {
    producto = await one(
      `INSERT INTO products (name, price, cost, min_stock, is_active, has_iva,
                             subcategory_id, brand_id, created_at)
       VALUES ($1, $2, $3, 1, true, $4, $5, $6, NOW()) RETURNING id`,
      [nombre, precio, costo, hasIva, subcategoryId, brandId],
    );
  } else {
    await client.query("UPDATE products SET has_iva = $1 WHERE id = $2", [hasIva, producto.id]);
  }

  let variante = await one('SELECT id FROM product_variants WHERE "SKU" = $1', [sku]);
  if (!variante) {
    variante = await one(
      `INSERT INTO product_variants (product_id, "SKU", price, cost, stock, min_stock, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, 1, true, NOW()) RETURNING id`,
      [producto.id, sku, precio, costo, stock],
    );
  } else {
    await client.query(
      "UPDATE product_variants SET price = $1, cost = $2, stock = $3 WHERE id = $4",
      [precio, costo, stock, variante.id],
    );
  }
  return { productoId: producto.id, varianteId: variante.id };
}

try {
  await client.query("BEGIN");
  const hash = await bcrypt.hash(PASSWORD, 10);

  const adminRoleId = await ensureRole(
    `Admin ${suffix}`,
    MODULOS_ADMIN,
    "Acceso a todos los módulos configurables",
  );
  const limitedRoleId = await ensureRole(
    `Vendedor ${suffix}`,
    [],
    "Solo Punto de Venta (módulo implícito)",
  );

  const adminId = await ensureUser(
    "plunal",
    adminRoleId,
    "Admin",
    "Smoke",
    "admin-smoke@example.com",
    "5550001111",
    hash,
  );
  const limitedId = await ensureUser(
    "vendedor_smoke",
    limitedRoleId,
    "Vendedor",
    "Smoke",
    "vendedor-smoke@example.com",
    "5550002222",
    hash,
  );

  const brandId = await ensureNamed("brands", `Marca ${suffix}`);
  const categoryId = await ensureNamed("categories", `Categoria ${suffix}`);
  const subcategoryId = await ensureNamed(
    "subcategory",
    `Subcategoria ${suffix}`,
    "category_id",
    categoryId,
  );

  const conIva = await ensureProduct(
    `Bicicleta ${suffix} con IVA`,
    `${suffix}-IVA-001`,
    1000,
    600,
    10,
    true,
    subcategoryId,
    brandId,
  );
  const exento = await ensureProduct(
    `Bicicleta ${suffix} exenta`,
    `${suffix}-EXENTO-001`,
    500,
    300,
    10,
    false,
    subcategoryId,
    brandId,
  );

  const settings = await one("SELECT id FROM store_settings ORDER BY id LIMIT 1");
  if (!settings) {
    await client.query(
      "INSERT INTO store_settings (suggested_margin, created_at) VALUES (1.5, NOW())",
    );
  }

  await client.query("COMMIT");

  console.log("Seed de smoke aplicado:");
  console.log(`  usuarios: plunal(${adminId}), vendedor_smoke(${limitedId}) / password: ${PASSWORD}`);
  console.log(`  roles: Admin ${suffix}(${adminRoleId}), Vendedor ${suffix}(${limitedRoleId})`);
  console.log(`  marca/categoria/subcategoria: ${brandId}/${categoryId}/${subcategoryId}`);
  console.log(`  producto con IVA: ${conIva.productoId} / variante: ${conIva.varianteId}`);
  console.log(`  producto exento: ${exento.productoId} / variante: ${exento.varianteId}`);
} catch (error) {
  await client.query("ROLLBACK");
  console.error(`Error aplicando seed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
