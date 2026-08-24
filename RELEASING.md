# Cómo actualizar la copia de la tienda

La app **ya no se compila en la PC de la tienda**. El `.dmg` se genera automáticamente en GitHub Actions cuando se publica una nueva versión, y a la tienda solo le llega el instalador ya armado.

## Requisito de una sola vez: cargar los secretos en GitHub

En **Settings → Secrets and variables → Actions** del repo, cargar (si todavía no están) los mismos valores que ya usás en tu `.env`/`runtime.env` local:

- `PROD_DATABASE_URL`
- `PROD_DIRECT_URL`
- `PROD_JWT_SECRET`
- `PROD_SESSION_TIMEOUT_HOURS`
- `PROD_SUPABASE_URL`
- `PROD_SUPABASE_SERVICE_ROLE_KEY`
- `PROD_SUPABASE_BUCKET_IMAGES`
- `PROD_PRINTER_INTERFACE`
- `PROD_PRINTER_NAME`

Esto se hace una sola vez (o cuando cambie alguna credencial de producción) — no hace falta repetirlo en cada release.

## Publicar una actualización

1. **Subir la versión** en `package.json` (ej. `0.1.0` → `0.2.0`) y commitear.
2. **Taggear y pushear el tag**:
   ```bash
   git tag v0.2.0
   git push origin v0.2.0
   ```
3. Esto dispara el workflow `Build macOS Release` (pestaña **Actions** del repo en GitHub). Tarda unos minutos — el runner instala todo desde cero, compila el standalone de Next.js y arma el `.dmg` con `electron-builder`.
4. Cuando termina en verde, el `.dmg` queda adjunto en un nuevo **Release** del repo (pestaña **Releases**).

## Instalar la actualización en la tienda

1. Descargar el `.dmg` del Release desde la Mac de la tienda (o transferirlo por USB/AirDrop).
2. Abrir el `.dmg` y arrastrar **Rad Bikes** a la carpeta Aplicaciones, reemplazando la versión anterior.
3. **Paso Gatekeeper (importante, hay que repetirlo en cada actualización)**: como el build no está firmado con una cuenta de Apple Developer, macOS bloquea la app la primera vez ("no se pudo verificar el desarrollador" o "el archivo está dañado"). Para destrabarla, abrir Terminal y correr una vez:
   ```bash
   xattr -cr "/Applications/Rad Bikes.app"
   ```
4. Abrir la app normalmente desde Aplicaciones. Va a conectar a la misma base de producción de siempre — no hay ningún cambio de datos, solo de versión del programa.

## Por qué hace falta el paso de Gatekeeper

No se está firmando/notarizando la app con un certificado de Apple Developer (tiene un costo de USD 99/año). Es una decisión consciente para esta primera etapa — el costo es que cada instalación/actualización necesita ese paso manual de Terminal una vez. Si en el futuro se quiere eliminar ese paso (y de paso habilitar que la app se actualice sola, sin tener que reinstalar a mano), el siguiente paso natural es sumar firma + notarización y `electron-updater`.
