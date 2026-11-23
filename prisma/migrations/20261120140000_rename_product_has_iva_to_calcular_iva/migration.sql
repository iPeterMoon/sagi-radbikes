-- El IVA siempre se muestra (16%); el flag ahora indica si se calcula sobre el
-- precio capturado (base) o si el precio capturado ya lo incluye y debe extraerse.
-- Se conservan los valores existentes: true = calcular, false = precio con IVA.
ALTER TABLE "products" RENAME COLUMN "has_iva" TO "calcular_iva";
