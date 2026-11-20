-- Indica si el producto causa IVA (16%) al venderse.
-- Los productos existentes conservan el comportamiento anterior (con IVA).
ALTER TABLE "products" ADD COLUMN "has_iva" BOOLEAN NOT NULL DEFAULT true;
