// Corre `next build`/`next start` usando las variables de .env (producción)
// en vez de .env.local (que Next.js prioriza por defecto mientras exista).
//
// No usamos flags de node como --env-file o -r porque los worker threads que
// usa Next para compilar en paralelo heredan execArgv y Node los rechaza con
// ERR_WORKER_INVALID_EXEC_ARGV. En cambio, cargamos .env acá mismo (antes de
// lanzar next) y se lo pasamos al proceso hijo ya en su process.env: Next
// nunca sobreescribe una variable que ya esté seteada, así que .env.local
// queda ignorado para esas claves.
const path = require('path');
const { spawnSync } = require('child_process');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const nextBin = path.resolve(__dirname, '..', 'node_modules', '.bin', 'next');
const args = process.argv.slice(2);

const result = spawnSync(nextBin, args, {
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status === null ? 1 : result.status);
