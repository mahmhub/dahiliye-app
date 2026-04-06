#!/bin/bash
# pd reposundan content ve görselleri senkronize eder
# Kullanım: ./sync.sh veya npm run sync

PD_DIR="${PD_DIR:-/Users/mahmutercan/Desktop/pd}"
APP_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ ! -d "$PD_DIR" ]; then
  echo "Hata: pd dizini bulunamadı: $PD_DIR"
  echo "PD_DIR ortam değişkeni ile belirtebilirsiniz: PD_DIR=/path/to/pd ./sync.sh"
  exit 1
fi

echo "Senkronize ediliyor: $PD_DIR → $APP_DIR"

# DEPT_LIST ile eşleşen dizinler (slug → filesystem adı)
declare -A DEPTS=(
  ["gastroenteroloji"]="Gastroenteroloji"
  ["endokrinoloji"]="Endokrinoloji"
  ["nefroloji"]="Nefroloji"
  ["hematoloji"]="Hematoloji"
  ["romatoloji"]="Romatoloji"
  ["onkoloji"]="Onkoloji"
  ["immunoloji-alerji"]="İmmunoloji ve Alerji"
  ["genel-dahiliye"]="Genel Dahiliye"
)

for slug in "${!DEPTS[@]}"; do
  dir="${DEPTS[$slug]}"
  src="$PD_DIR/$dir/notlar"

  if [ ! -d "$src" ]; then
    continue
  fi

  # Markdown notları → content/
  dest_content="$APP_DIR/content/$dir/notlar"
  mkdir -p "$dest_content"
  rsync -av --delete "$src/"*.md "$dest_content/" 2>/dev/null

  # Görseller → public/
  dest_public="$APP_DIR/public/$slug/notlar"
  mkdir -p "$dest_public"
  # Sadece *-images/ klasörlerini kopyala
  for img_dir in "$src/"*-images; do
    if [ -d "$img_dir" ]; then
      rsync -av --delete "$img_dir" "$dest_public/"
    fi
  done

  echo "✓ $dir → $slug"
done

echo ""
echo "Senkronizasyon tamamlandı."
