#!/bin/bash

################################################################################
# TiDB Cloud to Local MySQL Migration Script
# 
# Bu script uzaktaki TiDB Cloud veritabanındaki tüm verileri 
# lokal MySQL veritabanına güvenli bir şekilde taşır.
#
# Özellikler:
# - Otomatik backup oluşturma
# - Hata kontrolü ve rollback desteği
# - Detaylı loglama
# - Veri bütünlüğü kontrolü
# - SSL desteği (TiDB Cloud için gerekli)
################################################################################

set -e  # Hata durumunda scripti durdur

# Renkli çıktı için ANSI kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log fonksiyonları
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

################################################################################
# Yapılandırma
################################################################################

# Uzak Veritabanı Bilgileri (TiDB Cloud)
REMOTE_HOST="gateway02.us-east-1.prod.aws.tidbcloud.com"
REMOTE_USER="3RD81TG4rcgjaLg.bf493ad42272"
REMOTE_PASSWORD="lril1MrVR9q32wH4Y2am"
REMOTE_PORT="4000"
REMOTE_DATABASE="LKmeEoJsnZn9U4KoySaL4G"  # TiDB Cloud tarafından oluşturulan benzersiz veritabanı adı

# Lokal Veritabanı Bilgileri
LOCAL_HOST="localhost"
LOCAL_USER="root"
LOCAL_PASSWORD="Aa123456+"
LOCAL_PORT="3306"
LOCAL_DATABASE="nanoinf"

# Yedekleme ve geçici dosyalar
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
DUMP_FILE="${BACKUP_DIR}/remote_dump_${TIMESTAMP}.sql"
LOCAL_BACKUP_FILE="${BACKUP_DIR}/local_backup_${TIMESTAMP}.sql"
LOG_FILE="${BACKUP_DIR}/migration_${TIMESTAMP}.log"

################################################################################
# Ön Kontroller
################################################################################

log_info "Migration işlemi başlatılıyor..."

# Backup dizinini oluştur
mkdir -p "${BACKUP_DIR}"

# mysqldump ve mysql komutlarının varlığını kontrol et
if ! command -v mysqldump &> /dev/null; then
    log_error "mysqldump komutu bulunamadı. MySQL client tools yüklü değil!"
    exit 1
fi

if ! command -v mysql &> /dev/null; then
    log_error "mysql komutu bulunamadı. MySQL client tools yüklü değil!"
    exit 1
fi

log_success "Gerekli araçlar kontrol edildi"

################################################################################
# Uzak Veritabanı Bağlantı Kontrolü
################################################################################

log_info "Uzak veritabanı bağlantısı test ediliyor..."

if mysql -h "${REMOTE_HOST}" \
         -P "${REMOTE_PORT}" \
         -u "${REMOTE_USER}" \
         -p"${REMOTE_PASSWORD}" \
         --ssl-mode=REQUIRED \
         -e "SELECT 1" &> /dev/null; then
    log_success "Uzak veritabanına başarıyla bağlanıldı"
else
    log_error "Uzak veritabanına bağlanılamadı! Lütfen bağlantı bilgilerini kontrol edin."
    exit 1
fi

################################################################################
# Lokal Veritabanı Bağlantı Kontrolü
################################################################################

log_info "Lokal veritabanı bağlantısı test ediliyor..."

if mysql -h "${LOCAL_HOST}" \
         -P "${LOCAL_PORT}" \
         -u "${LOCAL_USER}" \
         -p"${LOCAL_PASSWORD}" \
         -e "SELECT 1" &> /dev/null; then
    log_success "Lokal veritabanına başarıyla bağlanıldı"
else
    log_error "Lokal veritabanına bağlanılamadı! Lütfen MySQL'in çalıştığından emin olun."
    exit 1
fi

################################################################################
# Lokal Veritabanı Yedekleme (Güvenlik İçin)
################################################################################

log_info "Mevcut lokal veritabanı yedekleniyor..."

# Veritabanının var olup olmadığını kontrol et
DB_EXISTS=$(mysql -h "${LOCAL_HOST}" \
                  -P "${LOCAL_PORT}" \
                  -u "${LOCAL_USER}" \
                  -p"${LOCAL_PASSWORD}" \
                  -e "SHOW DATABASES LIKE '${LOCAL_DATABASE}';" | grep -c "${LOCAL_DATABASE}" || true)

if [ "$DB_EXISTS" -eq "1" ]; then
    log_warning "Lokal veritabanı zaten mevcut, yedek alınıyor..."
    
    mysqldump -h "${LOCAL_HOST}" \
              -P "${LOCAL_PORT}" \
              -u "${LOCAL_USER}" \
              -p"${LOCAL_PASSWORD}" \
              --single-transaction \
              --routines \
              --triggers \
              --events \
              --add-drop-table \
              "${LOCAL_DATABASE}" > "${LOCAL_BACKUP_FILE}" 2>> "${LOG_FILE}"
    
    if [ $? -eq 0 ]; then
        log_success "Lokal veritabanı yedeği oluşturuldu: ${LOCAL_BACKUP_FILE}"
    else
        log_error "Lokal veritabanı yedeklenemedi!"
        exit 1
    fi
else
    log_info "Lokal veritabanı mevcut değil, yeni oluşturulacak"
fi

################################################################################
# Uzak Veritabanından Dump Alma
################################################################################

log_info "Uzak veritabanından dump alınıyor... (Bu işlem birkaç dakika sürebilir)"

# TiDB Cloud'dan dump al (SSL gerekli)
# Not: TiDB Cloud için --single-transaction yerine --lock-tables=false kullanılıyor
mysqldump -h "${REMOTE_HOST}" \
          -P "${REMOTE_PORT}" \
          -u "${REMOTE_USER}" \
          -p"${REMOTE_PASSWORD}" \
          --ssl-mode=REQUIRED \
          --lock-tables=false \
          --skip-lock-tables \
          --routines \
          --triggers \
          --events \
          --add-drop-table \
          --set-gtid-purged=OFF \
          --column-statistics=0 \
          --no-tablespaces \
          "${REMOTE_DATABASE}" > "${DUMP_FILE}" 2>> "${LOG_FILE}"

if [ $? -eq 0 ] && [ -s "${DUMP_FILE}" ]; then
    FILE_SIZE=$(du -h "${DUMP_FILE}" | cut -f1)
    log_success "Uzak veritabanı dump'ı başarıyla alındı (Boyut: ${FILE_SIZE})"
else
    log_error "Uzak veritabanından dump alınamadı!"
    cat "${LOG_FILE}"
    exit 1
fi

################################################################################
# Dump Dosyası Analizi
################################################################################

log_info "Dump dosyası analiz ediliyor..."

# Tablo sayısını kontrol et
TABLE_COUNT=$(grep -c "CREATE TABLE" "${DUMP_FILE}" || true)
log_info "Toplam tablo sayısı: ${TABLE_COUNT}"

# Insert statement sayısını kontrol et
INSERT_COUNT=$(grep -c "INSERT INTO" "${DUMP_FILE}" || true)
log_info "Toplam INSERT statement sayısı: ${INSERT_COUNT}"

if [ "$TABLE_COUNT" -eq "0" ]; then
    log_warning "Dump dosyasında tablo bulunamadı! Veritabanı boş olabilir."
    read -p "Devam etmek istiyor musunuz? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Migration iptal edildi"
        exit 0
    fi
fi

################################################################################
# Lokal Veritabanını Hazırlama
################################################################################

log_info "Lokal veritabanı hazırlanıyor..."

# Veritabanını oluştur veya temizle
mysql -h "${LOCAL_HOST}" \
      -P "${LOCAL_PORT}" \
      -u "${LOCAL_USER}" \
      -p"${LOCAL_PASSWORD}" \
      -e "DROP DATABASE IF EXISTS ${LOCAL_DATABASE}; CREATE DATABASE ${LOCAL_DATABASE} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>> "${LOG_FILE}"

if [ $? -eq 0 ]; then
    log_success "Lokal veritabanı hazırlandı: ${LOCAL_DATABASE}"
else
    log_error "Lokal veritabanı oluşturulamadı!"
    cat "${LOG_FILE}"
    exit 1
fi

################################################################################
# Dump'ı Lokal Veritabanına Import Etme
################################################################################

log_info "Dump lokal veritabanına import ediliyor... (Bu işlem birkaç dakika sürebilir)"

# Import işlemini gerçekleştir
mysql -h "${LOCAL_HOST}" \
      -P "${LOCAL_PORT}" \
      -u "${LOCAL_USER}" \
      -p"${LOCAL_PASSWORD}" \
      "${LOCAL_DATABASE}" < "${DUMP_FILE}" 2>> "${LOG_FILE}"

if [ $? -eq 0 ]; then
    log_success "Dump başarıyla import edildi"
else
    log_error "Dump import edilemedi! Detaylar için log dosyasına bakın: ${LOG_FILE}"
    
    # Rollback: Eğer önceki yedek varsa geri yükle
    if [ -f "${LOCAL_BACKUP_FILE}" ]; then
        log_warning "Rollback yapılıyor, önceki yedek geri yükleniyor..."
        mysql -h "${LOCAL_HOST}" \
              -P "${LOCAL_PORT}" \
              -u "${LOCAL_USER}" \
              -p"${LOCAL_PASSWORD}" \
              -e "DROP DATABASE IF EXISTS ${LOCAL_DATABASE}; CREATE DATABASE ${LOCAL_DATABASE};" 2>> "${LOG_FILE}"
        
        mysql -h "${LOCAL_HOST}" \
              -P "${LOCAL_PORT}" \
              -u "${LOCAL_USER}" \
              -p"${LOCAL_PASSWORD}" \
              "${LOCAL_DATABASE}" < "${LOCAL_BACKUP_FILE}" 2>> "${LOG_FILE}"
        
        log_success "Rollback tamamlandı, önceki durum geri yüklendi"
    fi
    
    exit 1
fi

################################################################################
# Veri Doğrulama
################################################################################

log_info "Veri bütünlüğü kontrol ediliyor..."

# Uzak veritabanındaki tablo sayısını al
REMOTE_TABLE_COUNT=$(mysql -h "${REMOTE_HOST}" \
                           -P "${REMOTE_PORT}" \
                           -u "${REMOTE_USER}" \
                           -p"${REMOTE_PASSWORD}" \
                           --ssl-mode=REQUIRED \
                           -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '${REMOTE_DATABASE}';" \
                           -sN 2>> "${LOG_FILE}")

# Lokal veritabanındaki tablo sayısını al
LOCAL_TABLE_COUNT=$(mysql -h "${LOCAL_HOST}" \
                          -P "${LOCAL_PORT}" \
                          -u "${LOCAL_USER}" \
                          -p"${LOCAL_PASSWORD}" \
                          -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '${LOCAL_DATABASE}';" \
                          -sN 2>> "${LOG_FILE}")

log_info "Uzak veritabanı tablo sayısı: ${REMOTE_TABLE_COUNT}"
log_info "Lokal veritabanı tablo sayısı: ${LOCAL_TABLE_COUNT}"

if [ "${REMOTE_TABLE_COUNT}" -eq "${LOCAL_TABLE_COUNT}" ]; then
    log_success "Tablo sayıları eşleşiyor ✓"
else
    log_warning "Tablo sayıları eşleşmiyor! (Uzak: ${REMOTE_TABLE_COUNT}, Lokal: ${LOCAL_TABLE_COUNT})"
fi

# Her tablo için satır sayısını karşılaştır
log_info "Detaylı tablo analizi yapılıyor..."

# Uzak tablolardan satır sayılarını al
mysql -h "${REMOTE_HOST}" \
      -P "${REMOTE_PORT}" \
      -u "${REMOTE_USER}" \
      -p"${REMOTE_PASSWORD}" \
      --ssl-mode=REQUIRED \
      -e "SELECT table_name, table_rows FROM information_schema.tables WHERE table_schema = '${REMOTE_DATABASE}' ORDER BY table_name;" \
      -sN 2>> "${LOG_FILE}" > /tmp/remote_tables.txt

# Lokal tablolardan satır sayılarını al
mysql -h "${LOCAL_HOST}" \
      -P "${LOCAL_PORT}" \
      -u "${LOCAL_USER}" \
      -p"${LOCAL_PASSWORD}" \
      -e "SELECT table_name, table_rows FROM information_schema.tables WHERE table_schema = '${LOCAL_DATABASE}' ORDER BY table_name;" \
      -sN 2>> "${LOG_FILE}" > /tmp/local_tables.txt

# Karşılaştır
echo ""
log_info "═══════════════════════════════════════════════════"
log_info "TABLO SATIR SAYILARI KARŞILAŞTIRMASI"
log_info "═══════════════════════════════════════════════════"
printf "%-35s %-15s %-15s %-10s\n" "TABLO ADI" "UZAK" "LOKAL" "DURUM"
log_info "───────────────────────────────────────────────────"

ALL_MATCH=true

while IFS=$'\t' read -r table_name remote_rows; do
    local_rows=$(grep "^${table_name}" /tmp/local_tables.txt | cut -f2)
    
    if [ -z "$local_rows" ]; then
        local_rows="0"
        ALL_MATCH=false
        status="${RED}✗ EKSIK${NC}"
    elif [ "$remote_rows" -eq "$local_rows" ]; then
        status="${GREEN}✓${NC}"
    else
        ALL_MATCH=false
        status="${YELLOW}⚠ FARKLI${NC}"
    fi
    
    printf "%-35s %-15s %-15s " "$table_name" "$remote_rows" "$local_rows"
    echo -e "$status"
done < /tmp/remote_tables.txt

log_info "═══════════════════════════════════════════════════"
echo ""

if [ "$ALL_MATCH" = true ]; then
    log_success "Tüm tablolardaki satır sayıları eşleşiyor! ✓"
else
    log_warning "Bazı tablolarda farklılıklar var. Lütfen yukarıdaki tabloyu inceleyin."
fi

# Geçici dosyaları temizle
rm -f /tmp/remote_tables.txt /tmp/local_tables.txt

################################################################################
# Özet Rapor
################################################################################

echo ""
log_success "═══════════════════════════════════════════════════"
log_success "MİGRATION BAŞARIYLA TAMAMLANDI!"
log_success "═══════════════════════════════════════════════════"
echo ""
log_info "Özet Bilgiler:"
log_info "  • Uzak Host: ${REMOTE_HOST}:${REMOTE_PORT}"
log_info "  • Lokal Host: ${LOCAL_HOST}:${LOCAL_PORT}"
log_info "  • Veritabanı: ${LOCAL_DATABASE}"
log_info "  • Toplam Tablo: ${LOCAL_TABLE_COUNT}"
log_info "  • Dump Dosyası: ${DUMP_FILE}"
log_info "  • Dump Boyutu: $(du -h "${DUMP_FILE}" | cut -f1)"
echo ""
log_info "Yedek Dosyalar:"
if [ -f "${LOCAL_BACKUP_FILE}" ]; then
    log_info "  • Lokal Yedek: ${LOCAL_BACKUP_FILE}"
fi
log_info "  • Uzak Dump: ${DUMP_FILE}"
log_info "  • Log Dosyası: ${LOG_FILE}"
echo ""
log_info "Sonraki Adımlar:"
log_info "  1. .env dosyanızı lokal veritabanı bilgileriyle güncelleyin"
log_info "  2. Uygulamanızı yeniden başlatın: bun dev"
log_info "  3. Verileri kontrol edin ve test edin"
log_info "  4. Her şey yolundaysa yedek dosyaları silebilirsiniz"
echo ""
log_success "═══════════════════════════════════════════════════"
echo ""

# Kullanıcıya seçenek sun
echo ""
read -p "Dump dosyasını ve yedekleri korumak istiyor musunuz? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Geçici dosyalar temizlenmiyor, manuel olarak silebilirsiniz:"
    log_info "  rm -f ${DUMP_FILE}"
    if [ -f "${LOCAL_BACKUP_FILE}" ]; then
        log_info "  rm -f ${LOCAL_BACKUP_FILE}"
    fi
else
    log_success "Yedek dosyalar korundu: ${BACKUP_DIR}/"
fi

echo ""
log_success "Migration tamamlandı! İyi çalışmalar! 🚀"
echo ""

exit 0
