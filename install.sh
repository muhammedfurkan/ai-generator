#!/bin/bash

###############################################################################
# NanoInf - Otomatik Docker Kurulum Scripti
# Bu script, NanoInf platformunu VPS üzerine otomatik olarak kurar
###############################################################################

set -e  # Hata durumunda scripti durdur

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logo
echo -e "${GREEN}"
cat << "EOF"
 _   _                  ___        __ 
| \ | | __ _ _ __   ___|_ _|_ __  / _|
|  \| |/ _` | '_ \ / _ \| || '_ \| |_ 
| |\  | (_| | | | | (_) | || | | |  _|
|_| \_|\__,_|_| |_|\___/___|_| |_|_|  
                                       
    Otomatik Docker Kurulum Scripti
EOF
echo -e "${NC}"

# Root kontrolü
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Bu scripti root olarak çalıştırmalısınız!${NC}"
    echo "Lütfen 'sudo bash install.sh' komutunu kullanın."
    exit 1
fi

echo -e "${BLUE}=== NanoInf Kurulum Başlıyor ===${NC}\n"

# Sistem bilgisi
echo -e "${YELLOW}Sistem Bilgisi:${NC}"
echo "OS: $(lsb_release -d | cut -f2)"
echo "Kernel: $(uname -r)"
echo "Architecture: $(uname -m)"
echo ""

# 1. Sistem Güncellemesi
echo -e "${BLUE}[1/8] Sistem güncelleniyor...${NC}"
apt-get update -qq
apt-get upgrade -y -qq
echo -e "${GREEN}✓ Sistem güncellendi${NC}\n"

# 2. Gerekli Paketleri Kur
echo -e "${BLUE}[2/8] Gerekli paketler kuruluyor...${NC}"
apt-get install -y -qq \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw \
    fail2ban \
    certbot
echo -e "${GREEN}✓ Paketler kuruldu${NC}\n"

# 3. Docker Kurulumu
echo -e "${BLUE}[3/8] Docker kuruluyor...${NC}"
if ! command -v docker &> /dev/null; then
    # Docker GPG key ekle
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Docker repository ekle
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Docker kur
    apt-get update -qq
    apt-get install -y -qq docker-ce docker-ce-cli containerd.io
    
    # Docker servisini başlat
    systemctl start docker
    systemctl enable docker
    
    echo -e "${GREEN}✓ Docker kuruldu${NC}"
else
    echo -e "${GREEN}✓ Docker zaten kurulu${NC}"
fi
echo ""

# 4. Docker Compose Kurulumu
echo -e "${BLUE}[4/8] Docker Compose kuruluyor...${NC}"
if ! command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✓ Docker Compose kuruldu (${DOCKER_COMPOSE_VERSION})${NC}"
else
    echo -e "${GREEN}✓ Docker Compose zaten kurulu${NC}"
fi
echo ""

# 5. Firewall Ayarları
echo -e "${BLUE}[5/8] Firewall ayarlanıyor...${NC}"
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
echo -e "${GREEN}✓ Firewall ayarlandı${NC}\n"

# 6. Fail2ban Ayarları
echo -e "${BLUE}[6/8] Fail2ban ayarlanıyor...${NC}"
systemctl start fail2ban
systemctl enable fail2ban
echo -e "${GREEN}✓ Fail2ban ayarlandı${NC}\n"

# 7. Proje Klasörü Oluştur
echo -e "${BLUE}[7/8] Proje klasörü hazırlanıyor...${NC}"
PROJECT_DIR="/opt/nanoinf"

if [ -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}Proje klasörü zaten mevcut. Yedek alınıyor...${NC}"
    mv "$PROJECT_DIR" "${PROJECT_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
fi

mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"
echo -e "${GREEN}✓ Proje klasörü oluşturuldu: $PROJECT_DIR${NC}\n"

# 8. Environment Dosyası Oluştur
echo -e "${BLUE}[8/8] Environment dosyası yapılandırılıyor...${NC}"

# Rastgele şifre üretme fonksiyonu
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# .env dosyası oluştur
cat > .env << EOF
# Database Configuration
MYSQL_ROOT_PASSWORD=$(generate_password)
MYSQL_DATABASE=nanoinf
MYSQL_USER=nanoinf_user
MYSQL_PASSWORD=$(generate_password)

# Application Configuration
APP_PORT=3000
NODE_ENV=production

# JWT Secret
JWT_SECRET=$(generate_password)

# Manus OAuth Configuration (LÜTFEN DOLDURUN!)
VITE_APP_ID=
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=
OWNER_NAME=

# AI API Keys (LÜTFEN DOLDURUN!)
NANO_BANANA_API_KEY=
KIE_AI_API_KEY=

# Telegram Bot Configuration (OPSİYONEL)
TELEGRAM_BOT_TOKEN=
TELEGRAM_ADMIN_CHAT_ID=

# Application Branding
VITE_APP_TITLE=NanoInf
VITE_APP_LOGO=/logo.png
EOF

chmod 600 .env
echo -e "${GREEN}✓ Environment dosyası oluşturuldu${NC}\n"

# SSL klasörü oluştur
mkdir -p ssl

# Kurulum tamamlandı
echo -e "${GREEN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ✓ NanoInf Kurulum Başarıyla Tamamlandı!               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${YELLOW}ÖNEMLİ: Devam etmeden önce yapmanız gerekenler:${NC}\n"

echo -e "${BLUE}1. Proje dosyalarını yükleyin:${NC}"
echo "   cd $PROJECT_DIR"
echo "   # Git ile:"
echo "   git clone <repository-url> ."
echo "   # Veya dosyaları manuel olarak kopyalayın"
echo ""

echo -e "${BLUE}2. Environment değişkenlerini düzenleyin:${NC}"
echo "   nano $PROJECT_DIR/.env"
echo "   # Aşağıdaki değerleri MUTLAKA doldurun:"
echo "   - VITE_APP_ID"
echo "   - OWNER_OPEN_ID"
echo "   - OWNER_NAME"
echo "   - NANO_BANANA_API_KEY"
echo "   - KIE_AI_API_KEY"
echo ""

echo -e "${BLUE}3. SSL sertifikası alın (HTTPS için):${NC}"
echo "   # Let's Encrypt ile otomatik:"
echo "   bash setup-ssl.sh yourdomain.com"
echo "   # Veya mevcut sertifikalarınızı kopyalayın:"
echo "   cp fullchain.pem $PROJECT_DIR/ssl/"
echo "   cp privkey.pem $PROJECT_DIR/ssl/"
echo ""

echo -e "${BLUE}4. Uygulamayı başlatın:${NC}"
echo "   cd $PROJECT_DIR"
echo "   docker-compose up -d"
echo ""

echo -e "${BLUE}5. Veritabanı migration'larını çalıştırın:${NC}"
echo "   docker-compose exec app npm run db:push"
echo ""

echo -e "${BLUE}6. Logları kontrol edin:${NC}"
echo "   docker-compose logs -f"
echo ""

echo -e "${GREEN}Kurulum scripti tamamlandı!${NC}"
echo -e "${YELLOW}Yardım için: https://docs.nanoinf.com${NC}\n"
