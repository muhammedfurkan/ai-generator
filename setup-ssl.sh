#!/bin/bash

###############################################################################
# NanoInf - SSL Sertifika Kurulum Scripti (Let's Encrypt)
###############################################################################

set -e

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Domain kontrolü
if [ -z "$1" ]; then
    echo -e "${RED}Hata: Domain adı belirtilmedi!${NC}"
    echo "Kullanım: bash setup-ssl.sh yourdomain.com"
    exit 1
fi

DOMAIN=$1
EMAIL=${2:-admin@$DOMAIN}

echo -e "${BLUE}=== SSL Sertifika Kurulumu ===${NC}\n"
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo ""

# Root kontrolü
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Bu scripti root olarak çalıştırmalısınız!${NC}"
    exit 1
fi

# Certbot kurulu mu kontrol et
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}Certbot kuruluyor...${NC}"
    apt-get update -qq
    apt-get install -y -qq certbot
    echo -e "${GREEN}✓ Certbot kuruldu${NC}\n"
fi

# Nginx'i geçici olarak durdur
echo -e "${BLUE}Nginx geçici olarak durduruluyor...${NC}"
docker-compose stop nginx 2>/dev/null || true

# Sertifika al
echo -e "${BLUE}SSL sertifikası alınıyor...${NC}"
certbot certonly --standalone \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    -d "$DOMAIN" \
    --preferred-challenges http

# Sertifikaları proje klasörüne kopyala
echo -e "${BLUE}Sertifikalar kopyalanıyor...${NC}"
mkdir -p ssl
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/
chmod 644 ssl/fullchain.pem
chmod 600 ssl/privkey.pem

# Otomatik yenileme için cron job ekle
echo -e "${BLUE}Otomatik yenileme ayarlanıyor...${NC}"
CRON_JOB="0 3 * * * certbot renew --quiet --deploy-hook 'cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /opt/nanoinf/ssl/ && cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /opt/nanoinf/ssl/ && docker-compose -f /opt/nanoinf/docker-compose.yml restart nginx'"

(crontab -l 2>/dev/null | grep -v "certbot renew"; echo "$CRON_JOB") | crontab -

# Nginx'i tekrar başlat
echo -e "${BLUE}Nginx başlatılıyor...${NC}"
docker-compose up -d nginx

echo -e "${GREEN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ✓ SSL Sertifikası Başarıyla Kuruldu!                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${GREEN}Sertifika Bilgileri:${NC}"
echo "Domain: $DOMAIN"
echo "Geçerlilik: 90 gün"
echo "Otomatik Yenileme: Aktif (her gün 03:00'da kontrol edilir)"
echo ""
echo -e "${BLUE}HTTPS üzerinden erişim:${NC}"
echo "https://$DOMAIN"
echo ""
