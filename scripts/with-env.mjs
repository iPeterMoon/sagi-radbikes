#!/usr/bin/env node
/**
 * Ejecuta un comando con variables cargadas desde archivos de entorno explícitos.
 *
 * Uso:
 *   node scripts/with-env.mjs .env.local -- prisma migrate status
 *   node scripts/with-env.mjs .env -- prisma migrate deploy
 *
 * Los archivos se aplican en orden (el último gana). Se usa `override: true`
 * porque `prisma.config.ts` carga `.env` por defecto: sin esto, un comando
 * "local" podría terminar apuntando a la base de datos de producción.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import dotenv from "dotenv";

const args = process.argv.slice(2);
const separator = args.indexOf("--");

if (separator <= 0 || separator === args.length - 1) {
  console.error(
    "Uso: node scripts/with-env.mjs <archivo[,archivo...]> -- <comando> [args...]",
  );
  process.exit(1);
}

const files = args.slice(0, separator).flatMap((value) => value.split(","));
const [command, ...commandArgs] = args.slice(separator + 1);

for (const file of files) {
  const filePath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    console.error(`No existe el archivo de entorno: ${filePath}`);
    process.exit(1);
  }
  dotenv.config({ path: filePath, override: true });
}

// Prioriza el binario instalado en el proyecto para no depender del PATH global.
const localBin = path.resolve(process.cwd(), "node_modules", ".bin", command);
const bin = fs.existsSync(localBin) ? localBin : command;

const result = spawnSync(bin, commandArgs, { stdio: "inherit", env: process.env });
process.exit(result.status === null ? 1 : result.status);
