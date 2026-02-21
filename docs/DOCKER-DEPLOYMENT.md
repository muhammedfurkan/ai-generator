# NanoInf - Docker Deployment Rehberi

Bu rehber, NanoInf platformunu VPS üzerine Docker ile nasıl kuracağınızı adım adım açıklar.

---

## Sistem Gereksinimleri

### Minimum Gereksinimler

- **CPU**: 2 Core
- **RAM**: 4 GB
- **Disk**: 20 GB SSD
- **OS**: Ubuntu 20.04 LTS veya üzeri
- **Network**: 100 Mbps

### Önerilen Gereksinimler

- **CPU**: 4 Core
- **RAM**: 8 GB
- **Disk**: 50 GB SSD
- **OS**: Ubuntu 22.04 LTS
- **Network**: 1 Gbps

---

## Hızlı Kurulum

### 1. Kurulum Scriptini İndirin

```bash
# Root olarak giriş yapın
sudo su

# Proje dosyalarını indirin
cd /tmp
# Git ile:
git clone <repository-url> nanoinf
# Veya wget ile:
wget <zip-url> && unzip nanoinf.zip

# Kurulum scriptine çalıştırma izni verin
cd nanoinf
chmod +x install.sh setup-ssl.sh manage.sh
```

### 2. Otomatik Kurulumu Başlatın

```bash
bash install.sh
```

Bu script otomatik olarak:

- ✅ Sistemi günceller
- ✅ Docker ve Docker Compose kurar
- ✅ Firewall ayarlarını yapar
- ✅ Fail2ban kurar
- ✅ Proje klasörünü oluşturur (/opt/nanoinf)
- ✅ Environment dosyasını hazırlar

### 3. Proje Dosyalarını Kopyalayın

```bash
cd /opt/nanoinf

# Git ile:
git clone <repository-url> .

# Veya manuel olarak:
# Tüm proje dosyalarını bu klasöre kopyalayın
```

### 4. Environment Değişkenlerini Düzenleyin

```bash
nano /opt/nanoinf/.env
```

**MUTLAKA doldurun:**

```env
VITE_APP_ID=your_manus_app_id
OWNER_OPEN_ID=your_owner_open_id
OWNER_NAME=your_owner_name
BUILT_IN_FORGE_API_KEY=your_forge_api_key
VITE_FRONTEND_FORGE_API_KEY=your_frontend_forge_api_key
NANO_BANANA_API_KEY=your_nano_banana_api_key
KIE_AI_API_KEY=your_kie_ai_api_key
```

**Opsiyonel (Telegram bot için):**

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_ADMIN_CHAT_ID=your_telegram_chat_id
```

### 5. SSL Sertifikası Kurun (HTTPS için)

```bash
bash setup-ssl.sh yourdomain.com admin@yourdomain.com
```

Veya mevcut sertifikalarınızı kopyalayın:

```bash
cp /path/to/fullchain.pem /opt/nanoinf/ssl/
cp /path/to/privkey.pem /opt/nanoinf/ssl/
```

### 6. Uygulamayı Başlatın

```bash
cd /opt/nanoinf
docker-compose up -d
```

### 7. Database Migration'larını Çalıştırın

```bash
# Container'ın başlamasını bekleyin (30 saniye)
sleep 30

# Migration'ları çalıştırın
docker-compose exec app pnpm db:push
```

### 8. Durumu Kontrol Edin

```bash
docker-compose ps
docker-compose logs -f
```

---

## Yönetim Komutları

`manage.sh` scripti ile uygulamayı kolayca yönetebilirsiniz:

```bash
# Uygulamayı başlat
bash manage.sh start

# Uygulamayı durdur
bash manage.sh stop

# Uygulamayı yeniden başlat
bash manage.sh restart

# Durum kontrolü
bash manage.sh status

# Logları görüntüle
bash manage.sh logs
bash manage.sh logs-app    # Sadece uygulama
bash manage.sh logs-db     # Sadece veritabanı
bash manage.sh logs-nginx  # Sadece nginx

# Uygulamayı güncelle
bash manage.sh update

# Veritabanı yedeği al
bash manage.sh backup

# Veritabanı yedeğini geri yükle
bash manage.sh restore backups/nanoinf_backup_20250121_120000.sql.gz

# Database migration'ları çalıştır
bash manage.sh db-push

# Container shell'e bağlan
bash manage.sh shell

# MySQL shell'e bağlan
bash manage.sh db-shell

# Temizlik yap
bash manage.sh clean

# Kaynak kullanımı
bash manage.sh stats
```

---

## Manuel Kurulum

Otomatik kurulum yerine manuel kurulum yapmak isterseniz:

### 1. Docker Kurulumu

```bash
# Docker GPG key ekle
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Docker repository ekle
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker kur
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io

# Docker servisini başlat
sudo systemctl start docker
sudo systemctl enable docker
```

### 2. Docker Compose Kurulumu

```bash
# En son versiyonu kur
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Çalıştırma izni ver
sudo chmod +x /usr/local/bin/docker-compose

# Versiyonu kontrol et
docker-compose --version
```

### 3. Proje Kurulumu

```bash
# Proje klasörü oluştur
sudo mkdir -p /opt/nanoinf
cd /opt/nanoinf

# Proje dosyalarını kopyala
# (Git clone veya manuel kopyalama)

# .env dosyası oluştur
cp .env.example .env
nano .env

# SSL klasörü oluştur
mkdir -p ssl

# Script'lere izin ver
chmod +x install.sh setup-ssl.sh manage.sh

# Docker container'ları başlat
docker-compose up -d

# Migration'ları çalıştır
docker-compose exec app pnpm db:push
```

---

## Güvenlik Ayarları

### Firewall (UFW)

```bash
# UFW'yi etkinleştir
sudo ufw enable

# SSH, HTTP, HTTPS portlarını aç
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Durumu kontrol et
sudo ufw status
```

### Fail2ban

```bash
# Fail2ban kur
sudo apt-get install fail2ban

# Servis başlat
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Durumu kontrol et
sudo fail2ban-client status
```

### SSL/TLS

Let's Encrypt ile otomatik SSL:

```bash
bash setup-ssl.sh yourdomain.com
```

Manuel SSL:

```bash
# Sertifikaları kopyala
cp fullchain.pem /opt/nanoinf/ssl/
cp privkey.pem /opt/nanoinf/ssl/

# İzinleri ayarla
chmod 644 /opt/nanoinf/ssl/fullchain.pem
chmod 600 /opt/nanoinf/ssl/privkey.pem
```

---

## Yedekleme ve Geri Yükleme

### Otomatik Yedekleme

Cron job ile günlük yedekleme:

```bash
# Crontab'ı düzenle
crontab -e

# Her gün 02:00'da yedek al
0 2 * * * cd /opt/nanoinf && bash manage.sh backup
```

### Manuel Yedekleme

```bash
bash manage.sh backup
```

Yedek dosyası: `/opt/nanoinf/backups/nanoinf_backup_YYYYMMDD_HHMMSS.sql.gz`

### Geri Yükleme

```bash
bash manage.sh restore backups/nanoinf_backup_20250121_120000.sql.gz
```

---

## Güncelleme

### Uygulama Güncellemesi

```bash
# Otomatik güncelleme (Git kullanıyorsanız)
bash manage.sh update

# Manuel güncelleme
cd /opt/nanoinf
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
docker-compose exec app pnpm db:push
```

### Docker Image Güncellemesi

```bash
# Image'ları güncelle
docker-compose pull

# Container'ları yeniden başlat
docker-compose up -d
```

---

## Sorun Giderme

### Container'lar başlamıyor

```bash
# Logları kontrol et
docker-compose logs

# Belirli bir servisin logları
docker-compose logs app
docker-compose logs mysql
docker-compose logs nginx
```

### Veritabanı bağlantı hatası

```bash
# MySQL container'ının durumunu kontrol et
docker-compose ps mysql

# MySQL loglarını kontrol et
docker-compose logs mysql

# MySQL'e bağlan ve test et
docker-compose exec mysql mysql -u root -p
```

### Port çakışması

```bash
# Kullanılan portları kontrol et
sudo netstat -tulpn | grep LISTEN

# .env dosyasında APP_PORT'u değiştir
nano /opt/nanoinf/.env

# Container'ları yeniden başlat
docker-compose down
docker-compose up -d
```

### Disk doldu

```bash
# Disk kullanımını kontrol et
df -h

# Docker temizliği
bash manage.sh clean

# Eski logları temizle
docker-compose exec app sh -c "find /var/log -type f -name '*.log' -mtime +30 -delete"
```

### Memory yetersiz

```bash
# Memory kullanımını kontrol et
free -h

# Container'ların memory kullanımı
docker stats

# Swap ekle
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## Performans Optimizasyonu

### Docker Compose Ayarları

`docker-compose.yml` dosyasında resource limit'leri ayarlayın:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: 4G
        reservations:
          cpus: "1"
          memory: 2G
```

### MySQL Optimizasyonu

```bash
# MySQL config dosyası oluştur
cat > /opt/nanoinf/mysql.cnf << EOF
[mysqld]
max_connections = 200
innodb_buffer_pool_size = 2G
innodb_log_file_size = 512M
query_cache_size = 0
query_cache_type = 0
EOF

# docker-compose.yml'de volume olarak ekle
# volumes:
#   - ./mysql.cnf:/etc/mysql/conf.d/custom.cnf
```

### Nginx Caching

Nginx config'de caching ayarları zaten yapılmıştır. Gerekirse `nginx.conf` dosyasını düzenleyebilirsiniz.

---

## Monitoring

### Container Durumu

```bash
# Tüm container'ların durumu
docker-compose ps

# Kaynak kullanımı
docker stats
```

### Loglar

```bash
# Tüm loglar
docker-compose logs -f

# Son 100 satır
docker-compose logs --tail=100

# Belirli bir servis
docker-compose logs -f app
```

### Health Check

```bash
# Uygulama health check
curl http://localhost:3000/health

# MySQL health check
docker-compose exec mysql mysqladmin ping -h localhost
```

---

## Domain Ayarları

### DNS Kayıtları

Domain sağlayıcınızda aşağıdaki kayıtları ekleyin:

```
A     @           VPS_IP_ADDRESS
A     www         VPS_IP_ADDRESS
AAAA  @           VPS_IPv6_ADDRESS (opsiyonel)
```

### Nginx Domain Ayarı

`nginx.conf` dosyasında `server_name` değerini güncelleyin:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    ...
}
```

---

## Destek

Sorun yaşarsanız:

1. Logları kontrol edin: `bash manage.sh logs`
2. GitHub Issues: <repository-url>/issues
3. Email: support@nanoinf.com
4. Telegram: @nanoinf_support

---

## Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.
