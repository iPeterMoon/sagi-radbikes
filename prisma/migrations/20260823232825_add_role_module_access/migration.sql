-- CreateTable
CREATE TABLE "role_module_access" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role_id" BIGINT NOT NULL,
    "module" TEXT NOT NULL,

    CONSTRAINT "role_module_access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "role_module_access_role_id_module_key" ON "role_module_access"("role_id", "module");

-- AddForeignKey
ALTER TABLE "role_module_access" ADD CONSTRAINT "role_module_access_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Da acceso a todos los roles que ya existen (antes de esta migración, todo rol
-- tenía acceso implícito a todo) para no romper el acceso de nadie al lanzar esto.
-- Roles creados después de esta migración arrancan sin módulos configurados.
-- "pos" no se siembra: Punto de Venta es un piso implícito para cualquier usuario
-- logueado, resuelto en código, no en esta tabla.
INSERT INTO "role_module_access" ("role_id", "module")
SELECT "id", m.module FROM "roles"
CROSS JOIN (VALUES ('dashboard'), ('catalogo'), ('reportes'), ('usuarios'), ('configuracion')) AS m(module);
