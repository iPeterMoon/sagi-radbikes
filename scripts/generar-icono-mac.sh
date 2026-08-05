#!/usr/bin/env bash
# scripts/generar-icono-mac.sh
# Genera build/icon.icns a partir de un PNG fuente cuadrado (idealmente 1024x1024).
# Uso: ./scripts/generar-icono-mac.sh logo-original.png

set -euo pipefail

ORIGEN="${1:-logo-original.png}"
DESTINO_DIR="build"
DESTINO="$DESTINO_DIR/icon.icns"
TMP_DIR=$(mktemp -d)

if [ ! -f "$ORIGEN" ]; then
  echo "Error: no se encontró el archivo fuente '$ORIGEN'"
  exit 1
fi

mkdir -p "$DESTINO_DIR"

echo "Generando tamaños intermedios en $TMP_DIR ..."

# png2icns funciona mejor si le damos varios tamaños ya generados,
# en vez de un solo PNG grande que tenga que reescalar internamente.
for size in 16 32 48 64 128 256 512 1024; do
  magick "$ORIGEN" -resize "${size}x${size}" "$TMP_DIR/icon_${size}.png"
done

echo "Empaquetando .icns ..."

png2icns "$DESTINO" \
  "$TMP_DIR/icon_16.png" \
  "$TMP_DIR/icon_32.png" \
  "$TMP_DIR/icon_48.png" \
  "$TMP_DIR/icon_64.png" \
  "$TMP_DIR/icon_128.png" \
  "$TMP_DIR/icon_256.png" \
  "$TMP_DIR/icon_512.png" \
  "$TMP_DIR/icon_1024.png"

rm -rf "$TMP_DIR"

echo "Listo: $DESTINO"