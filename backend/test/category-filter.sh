#!/usr/bin/env bash
# ============================================================
# Pruebas de filtrado por categorías — AmigojoLive
# Ejecutar desde la raíz del proyecto con:
#   bash backend/test/category-filter.sh
#
# Requiere: curl, jq  (apt install jq / brew install jq)
# ============================================================

BASE_URL="${AMIGOJO_URL:-http://localhost:3000}"
EMAIL="${AMIGOJO_EMAIL:-admin@institucion.edu.ec}"
PASSWORD="${AMIGOJO_PASSWORD:-Admin123456}"

GREEN='\033[0;32m'; RED='\033[0;31m'; CYAN='\033[0;36m'; NC='\033[0m'

pass() { echo -e "${GREEN}PASS${NC} $1"; }
fail() { echo -e "${RED}FAIL${NC} $1"; exit 1; }
info() { echo -e "${CYAN}INFO${NC} $1"; }

# ── 1. Login ───────────────────────────────────────────────────────────────────
info "1. Login..."
LOGIN=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"institutionalEmail\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
TOKEN=$(echo "$LOGIN" | jq -r '.data.token // empty')
[ -z "$TOKEN" ] && fail "Login fallido. Respuesta: $LOGIN"
pass "Login OK"

# ── 2. Obtener (o crear) dos categorías ───────────────────────────────────────
info "2. Obteniendo categorías disponibles..."
CATS=$(curl -s "$BASE_URL/api/v1/categories" -H "Authorization: Bearer $TOKEN")
CAT1_ID=$(echo "$CATS" | jq -r '.data[0].id // empty')
CAT2_ID=$(echo "$CATS" | jq -r '.data[1].id // empty')

if [ -z "$CAT1_ID" ]; then
  info "   Creando categoría 'Test-Cat-A'..."
  R=$(curl -s -X POST "$BASE_URL/api/v1/categories" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name":"Test-Cat-A"}')
  CAT1_ID=$(echo "$R" | jq -r '.data.id // empty')
fi
if [ -z "$CAT2_ID" ]; then
  info "   Creando categoría 'Test-Cat-B'..."
  R=$(curl -s -X POST "$BASE_URL/api/v1/categories" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name":"Test-Cat-B"}')
  CAT2_ID=$(echo "$R" | jq -r '.data.id // empty')
fi

[ -z "$CAT1_ID" ] && fail "No se pudo obtener CAT1_ID"
[ -z "$CAT2_ID" ] && fail "No se pudo obtener CAT2_ID"
pass "Categorías: id1=$CAT1_ID, id2=$CAT2_ID"

# ── 3. Crear publicaciones con distintas combinaciones ────────────────────────
info "3. Creando publicaciones de prueba..."

create_pub() {
  local TITLE="$1"
  local TAG_ARGS="$2"
  curl -s -X POST "$BASE_URL/api/v1/publications" \
    -H "Authorization: Bearer $TOKEN" \
    -F "title=$TITLE" \
    -F "content=Contenido de prueba para filtrado" \
    -F "isAnonymous=false" \
    $TAG_ARGS | jq -r '.data.id // empty'
}

PUB1_ID=$(create_pub "Pub solo cat1 $(date +%s)" "-F tags=$CAT1_ID")
PUB2_ID=$(create_pub "Pub solo cat2 $(date +%s)" "-F tags=$CAT2_ID")
PUB3_ID=$(create_pub "Pub ambas cats $(date +%s)" "-F tags=$CAT1_ID -F tags=$CAT2_ID")

[ -z "$PUB1_ID" ] && fail "No se creó pub1"
[ -z "$PUB2_ID" ] && fail "No se creó pub2"
[ -z "$PUB3_ID" ] && fail "No se creó pub3"
pass "Publicaciones creadas: pub1=$PUB1_ID, pub2=$PUB2_ID, pub3=$PUB3_ID"

# ── 4. Sin filtro: debe incluir las tres ─────────────────────────────────────
info "4. GET /publications sin filtro..."
ALL=$(curl -s "$BASE_URL/api/v1/publications" -H "Authorization: Bearer $TOKEN")
for ID in $PUB1_ID $PUB2_ID $PUB3_ID; do
  FOUND=$(echo "$ALL" | jq --arg id "$ID" '[.data[] | select(.id == ($id | tonumber))] | length')
  [ "$FOUND" -ge 1 ] && pass "  pub $ID presente en feed general" || fail "  pub $ID ausente del feed general"
done

# ── 5. Filtrar solo CAT1 ──────────────────────────────────────────────────────
info "5. GET /publications?tagIds=$CAT1_ID (solo cat1)..."
F1=$(curl -s "$BASE_URL/api/v1/publications?tagIds=$CAT1_ID" -H "Authorization: Bearer $TOKEN")
for ID in $PUB1_ID $PUB3_ID; do
  FOUND=$(echo "$F1" | jq --arg id "$ID" '[.data[] | select(.id == ($id | tonumber))] | length')
  [ "$FOUND" -ge 1 ] && pass "  pub $ID presente con filtro cat1" || fail "  pub $ID ausente con filtro cat1"
done
FOUND2=$(echo "$F1" | jq --arg id "$PUB2_ID" '[.data[] | select(.id == ($id | tonumber))] | length')
[ "$FOUND2" -eq 0 ] && pass "  pub $PUB2_ID correctamente excluida con filtro cat1" || fail "  pub $PUB2_ID no debería aparecer con filtro cat1"

# ── 6. Filtrar solo CAT2 ──────────────────────────────────────────────────────
info "6. GET /publications?tagIds=$CAT2_ID (solo cat2)..."
F2=$(curl -s "$BASE_URL/api/v1/publications?tagIds=$CAT2_ID" -H "Authorization: Bearer $TOKEN")
for ID in $PUB2_ID $PUB3_ID; do
  FOUND=$(echo "$F2" | jq --arg id "$ID" '[.data[] | select(.id == ($id | tonumber))] | length')
  [ "$FOUND" -ge 1 ] && pass "  pub $ID presente con filtro cat2" || fail "  pub $ID ausente con filtro cat2"
done
FOUND1=$(echo "$F2" | jq --arg id "$PUB1_ID" '[.data[] | select(.id == ($id | tonumber))] | length')
[ "$FOUND1" -eq 0 ] && pass "  pub $PUB1_ID correctamente excluida con filtro cat2" || fail "  pub $PUB1_ID no debería aparecer con filtro cat2"

# ── 7. Filtrar ambas (unión) ──────────────────────────────────────────────────
info "7. GET /publications?tagIds=${CAT1_ID},${CAT2_ID} (unión)..."
FB=$(curl -s "$BASE_URL/api/v1/publications?tagIds=${CAT1_ID},${CAT2_ID}" -H "Authorization: Bearer $TOKEN")
for ID in $PUB1_ID $PUB2_ID $PUB3_ID; do
  FOUND=$(echo "$FB" | jq --arg id "$ID" '[.data[] | select(.id == ($id | tonumber))] | length')
  [ "$FOUND" -ge 1 ] && pass "  pub $ID presente con filtro unión" || fail "  pub $ID ausente con filtro unión"
done

echo ""
echo -e "${GREEN}══════════════════════════════════════════${NC}"
echo -e "${GREEN} Todas las pruebas de filtrado pasaron ✓  ${NC}"
echo -e "${GREEN}══════════════════════════════════════════${NC}"
