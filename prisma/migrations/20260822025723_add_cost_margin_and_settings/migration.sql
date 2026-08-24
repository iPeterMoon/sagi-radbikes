-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "cost" REAL;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "cost" REAL;

-- AlterTable
ALTER TABLE "sale_details" ADD COLUMN     "unitCost" REAL;

-- CreateTable
CREATE TABLE "store_settings" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "suggested_margin" DOUBLE PRECISION NOT NULL DEFAULT 1.5,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);
