#!/usr/bin/env bash
# ============================================================
# Pruebas de descarga de archivos adjuntos — AmigojoLive
# Ejecutar desde la raíz del proyecto con:
#   bash backend/test/attachment-download.sh
#
# Requiere: curl, jq  (apt install jq / brew install jq)
# Variables a ajustar antes de ejecutar:
# ============================================================

BASE_URL="${AMIGOJO_URL:-http://localhost:3000}"
EMAIL="${AMIGOJO_EMAIL:-admin@institucion.edu.ec}"
PASSWORD="${AMIGOJO_PASSWORD:-Admin123456}"
TEST_PDF="${TEST_PDF:-/tmp/test_adjunto.pdf}"
TEST_IMAGE="${TEST_IMAGE:-/tmp/test_imagen.jpg}"

# Colores
GREEN='\033[0;32m'; RED='\033[0;31m'; CYAN='\033[0;36m'; NC='\033[0m'

pass() { echo -e "${GREEN}PASS${NC} $1"; }
fail() { echo -e "${RED}FAIL${NC} $1"; exit 1; }
info() { echo -e "${CYAN}INFO${NC} $1"; }

# ── 0. Crear archivos de prueba si no existen ──────────────────────────────────
if [ ! -f "$TEST_PDF" ]; then
  printf '%%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%%%EOF' > "$TEST_PDF"
fi
if [ ! -f "$TEST_IMAGE" ]; then
  # JPEG mínimo válido (1x1 pixel blanco)
  printf '\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\x1e\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xf5\xf2\xff\xd9' > "$TEST_IMAGE"
fi

info "Usando backend: $BASE_URL"

# ── 1. Login ───────────────────────────────────────────────────────────────────
info "1. Login..."
LOGIN=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"institutionalEmail\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
TOKEN=$(echo "$LOGIN" | jq -r '.data.token // empty')
[ -z "$TOKEN" ] && fail "Login fallido. Respuesta: $LOGIN"
pass "Login OK — token obtenido"

AUTH="-H \"Authorization: Bearer $TOKEN\""

# ── 2. Crear publicación con PDF e imagen ─────────────────────────────────────
info "2. Creando publicación con PDF e imagen..."
CREATE=$(curl -s -X POST "$BASE_URL/api/v1/publications" \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Test adjuntos $(date +%s)" \
  -F "content=Publicación de prueba para descarga de adjuntos" \
  -F "isAnonymous=false" \
  -F "files=@$TEST_PDF;type=application/pdf" \
  -F "files=@$TEST_IMAGE;type=image/jpeg")

PUB_ID=$(echo "$CREATE" | jq -r '.data.id // empty')
[ -z "$PUB_ID" ] && fail "Creación fallida. Respuesta: $CREATE"
pass "Publicación creada — id=$PUB_ID"

PDF_FILENAME=$(echo "$CREATE" | jq -r '.data.attachments[] | select(.type=="DOCUMENT") | .filename' | head -1)
IMG_FILENAME=$(echo "$CREATE" | jq -r '.data.attachments[] | select(.type=="IMAGE") | .filename' | head -1)
info "PDF guardado como: $PDF_FILENAME"
info "Imagen guardada como: $IMG_FILENAME"

# ── 3. Descargar PDF vía /public ──────────────────────────────────────────────
info "3. Descargando PDF..."
HTTP_PDF=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/public/documents/$PDF_FILENAME")
[ "$HTTP_PDF" = "200" ] && pass "PDF descargable (HTTP $HTTP_PDF)" || fail "PDF no disponible (HTTP $HTTP_PDF)"

DISP_PDF=$(curl -sI "$BASE_URL/public/documents/$PDF_FILENAME" | grep -i "content-disposition" || true)
[ -n "$DISP_PDF" ] && pass "Content-Disposition presente: $DISP_PDF" || fail "Falta Content-Disposition en el PDF"

# ── 4. Descargar imagen vía /public ──────────────────────────────────────────
info "4. Descargando imagen..."
HTTP_IMG=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/public/images/$IMG_FILENAME")
[ "$HTTP_IMG" = "200" ] && pass "Imagen descargable (HTTP $HTTP_IMG)" || fail "Imagen no disponible (HTTP $HTTP_IMG)"

# ── 5. Health-check de adjuntos (existsOnDisk) ────────────────────────────────
info "5. Health-check adjuntos (existsOnDisk)..."
HEALTH=$(curl -s "$BASE_URL/api/v1/publications/$PUB_ID/attachments" \
  -H "Authorization: Bearer $TOKEN")
ALL_EXIST=$(echo "$HEALTH" | jq '[.data[].existsOnDisk] | all')
[ "$ALL_EXIST" = "true" ] && pass "Todos los adjuntos existen en disco" || fail "Hay adjuntos huérfanos: $HEALTH"

# ── 6. Verificar /publications incluye adjuntos correctamente ─────────────────
info "6. Verificando feed..."
FEED=$(curl -s "$BASE_URL/api/v1/publications" -H "Authorization: Bearer $TOKEN")
PUB_IN_FEED=$(echo "$FEED" | jq --arg id "$PUB_ID" '.data[] | select(.id == ($id | tonumber))')
ATT_COUNT=$(echo "$PUB_IN_FEED" | jq '.attachments | length')
[ "$ATT_COUNT" = "2" ] && pass "Feed incluye $ATT_COUNT adjuntos correctamente" || fail "Feed devuelve $ATT_COUNT adjuntos (esperados 2)"

echo ""
echo -e "${GREEN}══════════════════════════════════════════${NC}"
echo -e "${GREEN} Todas las pruebas de descarga pasaron ✓  ${NC}"
echo -e "${GREEN}══════════════════════════════════════════${NC}"
