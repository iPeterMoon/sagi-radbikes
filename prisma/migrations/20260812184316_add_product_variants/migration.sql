-- Custom: ventas existentes son datos de prueba, se eliminan por completo
-- para no tener que migrar sale_details a variantes (confirmado con el usuario).
TRUNCATE TABLE "public"."payments", "public"."sale_details", "public"."sales" RESTART IDENTITY CASCADE;

-- CreateTable
CREATE TABLE "public"."product_variants" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "product_id" BIGINT NOT NULL,
    "SKU" TEXT NOT NULL,
    "barcode_upc" TEXT,
    "price" REAL,
    "stock" INTEGER,
    "min_stock" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_variant_attributes" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT,
    "value" TEXT,
    "variant_id" BIGINT NOT NULL,

    CONSTRAINT "product_variant_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_SKU_key" ON "public"."product_variants"("SKU" ASC);

-- CreateIndex
CREATE INDEX "product_variants_product_id_idx" ON "public"."product_variants"("product_id" ASC);

-- CreateIndex
CREATE INDEX "product_variant_attributes_variant_id_idx" ON "public"."product_variant_attributes"("variant_id" ASC);

-- Custom: backfill de una variante "default" por cada producto existente,
-- reutilizando su SKU/stock/precio/barcode actuales (el SKU ya era único, sin colisiones).
INSERT INTO "public"."product_variants" ("product_id", "SKU", "barcode_upc", "price", "stock", "min_stock", "is_active", "created_at")
SELECT "id", "SKU", "barcode_upc", "price", "stock", "min_stock", "is_active", "created_at"
FROM "public"."products";

-- AddForeignKey
ALTER TABLE "public"."product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."product_variant_attributes" ADD CONSTRAINT "product_variant_attributes_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AlterTable
ALTER TABLE "public"."product_images" ADD COLUMN "variant_id" BIGINT;

-- CreateIndex
CREATE INDEX "product_images_variant_id_idx" ON "public"."product_images"("variant_id" ASC);

-- AddForeignKey
ALTER TABLE "public"."product_images" ADD CONSTRAINT "product_images_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- DropForeignKey (sale_details ya está vacía tras el TRUNCATE, no hace falta backfill)
ALTER TABLE "public"."sale_details" DROP CONSTRAINT "sale_details_product_id_fkey";

-- AlterTable
ALTER TABLE "public"."sale_details" DROP COLUMN "product_id",
ADD COLUMN "variant_id" BIGINT;

-- AddForeignKey
ALTER TABLE "public"."sale_details" ADD CONSTRAINT "sale_details_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropIndex (products_SKU_key fue creado en 0_init como CREATE UNIQUE INDEX, no como
-- constraint con nombre -- DROP CONSTRAINT falla contra una base recién creada/shadow DB).
DROP INDEX "public"."products_SKU_key";

-- AlterTable
ALTER TABLE "public"."products" DROP COLUMN "SKU",
DROP COLUMN "barcode_upc",
DROP COLUMN "stock";
