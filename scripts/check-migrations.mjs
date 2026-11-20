#!/usr/bin/env node
/**
 * Verifica que todas las migraciones del repositorio estén aplicadas en la
 * base apuntada por DIRECT_URL. Pensado para usarse antes de cada release y en CI.
 *
 * Uso:
 *   DIRECT_URL=postgres://... node scripts/check-migrations.mjs
 *   node scripts/with-env.js .env -- node scripts/check-migrations.mjs
 *
 * Sale con código 1 si hay migraciones pendientes o si no puede conectarse.
 */
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "pg";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migrationsPath = path.join(root, "prisma", "migrations");
const directUrl = process.env.DIRECT_URL;

if (!directUrl) {
  console.error("✗ DIRECT_URL no está definida; no se puede verificar la base.");
  process.exit(1);
}

const entries = await readdir(migrationsPath, { withFileTypes: true });
const locales = entries
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const client = new Client({ connectionString: directUrl, connectionTimeoutMillis: 15000 });

try {
  await client.connect();
  const { rows } = await client.query(
    "SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL",
  );
  const aplicadas = new Set(rows.map((row) => row.migration_name));
  const pendientes = locales.filter((name) => !aplicadas.has(name));

  console.log(`Migraciones en repositorio: ${locales.length}`);
  console.log(`Migraciones aplicadas: ${aplicadas.size}`);

  if (pendientes.length === 0) {
    console.log("✓ No hay migraciones pendientes.");
  } else {
    console.error(`✗ Migraciones pendientes (${pendientes.length}):`);
    for (const name of pendientes) console.error(`  - ${name}`);
    process.exitCode = 1;
  }
} catch (error) {
  console.error(`✗ No se pudo verificar la base: ${error.message}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
