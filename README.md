# SAGI RAD Bikes

Sistema de gestión para tienda de bicicletas (inventario, punto de venta, reportes, usuarios/roles y configuración). Aplicación **monolítica** Next.js (App Router) con empaquetado de escritorio vía Electron.

## Arquitectura actual

- **Frontend/API:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4.
- **Base de datos:** PostgreSQL con Prisma 7 (`@prisma/client` + `@prisma/adapter-pg` y pool `pg`). Migraciones en `prisma/migrations/`.
- **Autenticación/autorización:** JWT en cookie `token` (`src/proxy.ts` como middleware). Módulos configurables por rol: `dashboard`, `catalogo`, `reportes`, `usuarios`, `configuracion`; `pos` es implícito.
- **Imágenes:** Supabase Storage (cliente en `src/lib/SupabaseFactory.ts`).
- **Impresión de tickets:** `node-thermal-printer` / `escpos-usb` (ruta `POST /api/print`, requiere hardware y `PRINTER_INTERFACE`).
- **Escritorio:** Electron (`electron/main.js`, build con `electron-builder`).

## Requisitos

- Node.js 20+ (CI usa 22) y npm.
- PostgreSQL (local o remoto). Para desarrollo local el proyecto ha usado un contenedor `sagi-radbikes-localdb` en `localhost:55432`.
- Para compilar dependencias nativas de USB/Electron: `libudev-dev` y `libusb-1.0-0-dev` (Linux).

## Configuración de entorno

- `.env`: valores de **producción** (Supabase remoto). Prisma CLI carga `.env` por defecto vía `prisma.config.ts`.
- `.env.local`: overrides locales (DB local, `JWT_SECRET` local). No debe usarse con los scripts `db:*:prod`.
- `.env.smoke`: generado en runtime para smoke tests (gitignored). Nunca debe apuntar a producción.

Variables relevantes:

- `DATABASE_URL` / `DIRECT_URL`: conexión de app y de migraciones (Prisma 7 usa `DIRECT_URL` en `prisma.config.ts`).
- `JWT_SECRET`, `SESSION_TIMEOUT_HOURS`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET_IMAGES`
- `PRINTER_INTERFACE`, `PRINTER_NAME`

> No sobrescribas `.env`/`.env.local` manualmente para migraciones: usa los scripts `db:*` que fuerzan el archivo correcto con `scripts/with-env.mjs`.

## Base de datos y migraciones

```bash
# Local (.env.local)
npm run db:status:local
npm run db:deploy:local
npm run db:check:local

# Producción (.env) — requiere backup previo y ventana de cambio
npm run db:status:prod
npm run db:deploy:prod   # crea backup manualmente antes
npm run db:check:prod
```

- `scripts/check-migrations.mjs`: compara migraciones en `prisma/migrations/` contra `_prisma_migrations` (aplicadas y no rolled-back). Falla si hay pendientes.
- Backup recomendado antes de tocar producción: `pg_dump "$DIRECT_URL" -Fc -f backup.dump`.
- `.github/workflows/deploy-migrations.yml`: workflow manual (`workflow_dispatch`) con GitHub Environment `production`, backup y artifact. Requiere secreto `PROD_DIRECT_URL`.

## Desarrollo

```bash
npm install
npm run dev            # http://localhost:3000
npm run electron:dev   # Next + Electron
```

`npm install` ejecuta `postinstall` (`electron-builder install-app-deps`, `prisma generate`, `electron-rebuild -f -w usb`).

## Pruebas

### Unitarias (Vitest)

```bash
npm test
npm run test:coverage
```

Los tests unitarios viven en `tests/` y usan mocks (sin DB real). Configuración en `vitest.config.ts`.

### Smoke HTTP (contra una instancia en ejecución)

Requiere que la app esté levantada (`npm run dev` o `npm run start`).

```bash
# Solo lectura (seguro para entornos con datos reales)
npm run test:smoke

# Lectura + escritura (SOLO base local/desechable)
npm run test:smoke:write
# o contra .env.smoke:
npm run test:smoke:local
npm run test:smoke:local:write
```

Variables: `SMOKE_BASE_URL`, `SMOKE_USER`, `SMOKE_PASSWORD`, `SMOKE_LIMITED_USER`, `SMOKE_LIMITED_PASSWORD`, `SMOKE_WRITE`, `SMOKE_IMAGES`, `SMOKE_PRINTER`, `SMOKE_REPORT`.

El smoke de escritura crea/edita/elimina datos temporales (producto, variante, etiqueta, atributo, carrito, venta con IVA mixto 16%/0%, rol, usuario, configuración) y limpia en lo posible. Las ventas no se borran vía API.

### Seed determinista para smoke

```bash
# Generar .env.smoke apuntando a una DB local (gitignored), luego:
SMOKE_SEED=1 npm run seed:smoke
```

Crea `plunal`/`vendedor_smoke` (password `crujones`), roles con/sin módulos, catálogo mínimo y productos con `calcular_iva=true` (precio base) y `calcular_iva=false` (precio con IVA incluido). Solo corre con `SMOKE_SEED=1` y contra DB local.

### CI

`.github/workflows/ci.yml`: lint (no bloqueante), `tsc --noEmit`, tests unitarios, coverage, Postgres de servicio, `migrate deploy` + diff, seed, build y smoke HTTP con escritura.
