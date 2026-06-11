#!/bin/bash
# Kullanım: bash move-pilav.sh "admin@email.com" "sifre"

EMAIL="$1"
PASSWORD="$2"
BASE="https://aramabul.com"
COOKIE_FILE="/tmp/aramabul-admin-cookies.txt"

if [ -z "$EMAIL" ] || [ -z "$PASSWORD" ]; then
  echo "Kullanım: bash move-pilav.sh \"admin@email.com\" \"sifre\""
  exit 1
fi

# 1) Login
echo "🔐 Giriş yapılıyor..."
LOGIN_RESP=$(curl -s -c "$COOKIE_FILE" -X POST "$BASE/api/admin/auth/login" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

if echo "$LOGIN_RESP" | grep -q '"error"'; then
  echo "❌ Giriş başarısız: $LOGIN_RESP"
  rm -f "$COOKIE_FILE"
  exit 1
fi
echo "✅ Giriş başarılı"

# 2) Kategorileri çek, pilavcı ID'sini bul
echo "📂 Kategoriler yükleniyor..."
CAT_RESP=$(curl -s -b "$COOKIE_FILE" "$BASE/api/admin/categories?mainCategoryKey=yeme-icme&isActive=true" \
  -H "Accept: application/json")

PILAVCI_ID=$(echo "$CAT_RESP" | python3 -c "
import sys, json
data = json.load(sys.stdin)
items = data.get('items', [])
for c in items:
    if 'pilavcı' in c.get('name','').lower() or 'pilavci' in c.get('key','').lower():
        print(c['id'])
        break
" 2>/dev/null)

if [ -z "$PILAVCI_ID" ]; then
  echo "❌ Pilavcı kategorisi bulunamadı!"
  echo "Mevcut kategoriler:"
  echo "$CAT_RESP" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for c in data.get('items', []):
    print(f\"  - {c.get('name','')} (id:{c.get('id','')})\")" 2>/dev/null
  rm -f "$COOKIE_FILE"
  exit 1
fi
echo "✅ Pilavcı kategorisi ID: $PILAVCI_ID"

# 3) Pilav mekanlarını bul
echo "🔍 Pilav mekanları aranıyor..."
PAGE=1
ALL_IDS=""
while true; do
  RESP=$(curl -s -b "$COOKIE_FILE" \
    "$BASE/api/admin/venues?q=pilav&city=%C4%B0stanbul&mainCategoryKey=yeme-icme&limit=100&page=$PAGE" \
    -H "Accept: application/json")
  
  IDS=$(echo "$RESP" | python3 -c "
import sys, json
data = json.load(sys.stdin)
items = data.get('items', [])
for v in items:
    name = v.get('name','').lower()
    cat_id = v.get('categoryId', v.get('category',{}).get('id','') if isinstance(v.get('category'), dict) else '')
    if 'pilav' in name and str(cat_id) != str($PILAVCI_ID):
        print(f\"{v['id']}|{v['name']}\")
" 2>/dev/null)
  
  COUNT=$(echo "$RESP" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('items',[])))" 2>/dev/null)
  
  if [ -n "$IDS" ]; then
    ALL_IDS="$ALL_IDS
$IDS"
  fi
  
  echo "  Sayfa $PAGE: $COUNT mekan"
  
  if [ "$COUNT" -lt 100 ] 2>/dev/null; then
    break
  fi
  PAGE=$((PAGE + 1))
done

ALL_IDS=$(echo "$ALL_IDS" | sed '/^$/d')
TOTAL=$(echo "$ALL_IDS" | wc -l | tr -d ' ')
echo "📋 Taşınacak $TOTAL mekan bulundu"

if [ "$TOTAL" -eq 0 ] 2>/dev/null; then
  echo "✅ Tüm pilavcılar zaten doğru kategoride!"
  rm -f "$COOKIE_FILE"
  exit 0
fi

# 4) Her mekanı güncelle
SUCCESS=0
ERROR=0
CURRENT=0

echo "$ALL_IDS" | while IFS='|' read -r VID VNAME; do
  CURRENT=$((CURRENT + 1))
  
  # Detay çek
  DETAIL=$(curl -s -b "$COOKIE_FILE" "$BASE/api/admin/venues/$VID" -H "Accept: application/json")
  
  # categoryId'yi değiştirip geri gönder
  UPDATED=$(echo "$DETAIL" | python3 -c "
import sys, json
data = json.load(sys.stdin)
item = data.get('item', data)
body = {
    'name': item.get('name',''),
    'slug': item.get('slug',''),
    'city': item.get('city',''),
    'district': item.get('district',''),
    'neighborhood': item.get('neighborhood',''),
    'categoryId': $PILAVCI_ID,
    'cuisine': item.get('cuisine',''),
    'budget': item.get('budget',''),
    'rating': item.get('rating'),
    'userRatingCount': item.get('userRatingCount'),
    'latitude': item.get('latitude'),
    'longitude': item.get('longitude'),
    'address': item.get('address',''),
    'phone': item.get('phone',''),
    'website': item.get('website',''),
    'menuUrl': item.get('menuUrl',''),
    'instagram': item.get('instagram',''),
    'mapsUrl': item.get('mapsUrl',''),
    'sourcePlaceId': item.get('sourcePlaceId',''),
    'photoUri': item.get('photoUri',''),
    'isOpenNow': item.get('isOpenNow'),
    'openingStatusText': item.get('openingStatusText',''),
    'temporarilyClosed': item.get('temporarilyClosed', False),
    'isActive': item.get('isActive'),
    'isIstanbulMvp': item.get('isIstanbulMvp', False),
    'editorialSummary': item.get('editorialSummary',''),
    'tagKeys': item.get('tagKeys', []),
    'photos': item.get('photos', []),
}
print(json.dumps(body))
" 2>/dev/null)
  
  if [ -z "$UPDATED" ]; then
    echo "  ❌ [$CURRENT/$TOTAL] $VNAME - detay okunamadı"
    continue
  fi
  
  SAVE_RESP=$(curl -s -b "$COOKIE_FILE" -X PUT "$BASE/api/admin/venues/$VID" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "$UPDATED")
  
  if echo "$SAVE_RESP" | grep -q '"error"'; then
    echo "  ❌ [$CURRENT/$TOTAL] $VNAME"
  else
    echo "  ✅ [$CURRENT/$TOTAL] $VNAME → Pilavcı"
  fi
  
  sleep 0.2
done

echo ""
echo "🏁 Tamamlandı!"
rm -f "$COOKIE_FILE"
