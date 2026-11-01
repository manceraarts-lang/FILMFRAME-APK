#!/usr/bin/env bash
# Comprueba sintaxis de cada módulo y que index.html referencia todos los scripts existentes.
set -euo pipefail
cd "$(dirname "$0")/../web"
fail=0
for f in js/*.js; do
  node --check "$f" && echo "OK  $f" || { echo "ERR $f"; fail=1; }
done
for ref in $(grep -o 'src="js/[^"]*"' index.html | sed 's/src="//;s/"//'); do
  [ -f "$ref" ] || { echo "FALTA $ref"; fail=1; }
done
exit $fail
