# NanoInf - Kendi Sunucunuza Taşıma Rehberi

**Yazar:** Manus AI  
**Tarih:** 19 Aralık 2025  
**Versiyon:** 1.0

Bu rehber, NanoInf projesini Manus platformundan kendi sunucunuza taşımanız için gereken tüm adımları detaylı olarak açıklamaktadır.

---

## İçindekiler

1. [Genel Bakış](#1-genel-bakış)
2. [Gereksinimler](#2-gereksinimler)
3. [Sunucu Hazırlığı](#3-sunucu-hazırlığı)
4. [Veritabanı Kurulumu](#4-veritabanı-kurulumu)
5. [Dosya Depolama (S3)](#5-dosya-depolama-s3)
6. [Environment Değişkenleri](#6-environment-değişkenleri)
7. [Proje Kurulumu](#7-proje-kurulumu)
8. [Harici API Entegrasyonları](#8-harici-api-entegrasyonları)
9. [Nginx ve SSL Yapılandırması](#9-nginx-ve-ssl-yapılandırması)
10. [PM2 ile Süreç Yönetimi](#10-pm2-ile-süreç-yönetimi)
11. [Sorun Giderme](#11-sorun-giderme)

---

## 1. Genel Bakış

NanoInf, aşağıdaki teknolojilerle geliştirilmiş modern bir full-stack web uygulamasıdır:

| Bileşen | Teknoloji |
|---------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS 4 |
| Backend | Express.js + tRPC |
| Veritabanı | MySQL / TiDB |
| Dosya Depolama | AWS S3 veya uyumlu servis |
| Kimlik Doğrulama | Manus OAuth (değiştirilmeli) |
| AI Servisleri | Kie AI, Nano Banana Pro, Seedream |

### Proje Yapısı

```
nano-influencer/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Sayfa bileşenleri
│   │   ├── components/    # Yeniden kullanılabilir bileşenler
│   │   └── lib/           # Yardımcı fonksiyonlar
│   └── public/            # Statik dosyalar
├── server/                 # Express backend
│   ├── _core/             # Çekirdek modüller (auth, llm, vb.)
│   ├── routers/           # tRPC router'ları
│   └── storage.ts         # S3 yardımcıları
├── drizzle/               # Veritabanı şeması
└── shared/                # Paylaşılan tipler ve sabitler
```

---

## 2. Gereksinimler

### Sunucu Gereksinimleri

| Gereksinim | Minimum | Önerilen |
|------------|---------|----------|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 4 GB | 8 GB |
| Disk | 40 GB SSD | 100 GB SSD |
| İşletim Sistemi | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

### Yazılım Gereksinimleri

| Yazılım | Versiyon |
|---------|----------|
| Node.js | 22.x veya üzeri |
| pnpm | 10.x |
| MySQL | 8.0+ veya TiDB |
| Nginx | 1.18+ |
| PM2 | 5.x |

---

## 3. Sunucu Hazırlığı

### 3.1 Sistemi Güncelleyin

```bash
sudo apt update && sudo apt upgrade -y
```

### 3.2 Node.js Kurulumu

```bash
# Node.js 22.x kurulumu
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# pnpm kurulumu
npm install -g pnpm

# Versiyonları kontrol edin
node --version  # v22.x.x
pnpm --version  # 10.x.x
```

### 3.3 PM2 Kurulumu

```bash
npm install -g pm2
```

### 3.4 Nginx Kurulumu

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## 4. Veritabanı Kurulumu

### Seçenek A: MySQL Kurulumu (Önerilen)

```bash
# MySQL 8.0 kurulumu
sudo apt install -y mysql-server

# Güvenlik yapılandırması
sudo mysql_secure_installation

# MySQL'e bağlanın
sudo mysql -u root -p
```

Veritabanı ve kullanıcı oluşturun:

```sql
CREATE DATABASE nanoinf CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'nanoinf_user'@'localhost' IDENTIFIED BY 'GÜÇLÜ_BİR_ŞİFRE';
GRANT ALL PRIVILEGES ON nanoinf.* TO 'nanoinf_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Seçenek B: Bulut Veritabanı (PlanetScale, TiDB Cloud)

Bulut veritabanı kullanmak isterseniz, PlanetScale veya TiDB Cloud gibi servisleri tercih edebilirsiniz. Bu servisler MySQL uyumlu bağlantı string'i sağlar.

### Veritabanı Bağlantı String'i Formatı

```
mysql://kullanici:sifre@host:port/veritabani?ssl={"rejectUnauthorized":true}
```

---

## 5. Dosya Depolama (S3)

Proje, dosya depolama için AWS S3 veya S3-uyumlu servisler kullanmaktadır.

### Seçenek A: AWS S3

1. AWS Console'da yeni bir S3 bucket oluşturun
2. IAM kullanıcısı oluşturun ve S3 erişim izinleri verin
3. Access Key ve Secret Key'i kaydedin

### Seçenek B: Alternatif S3-Uyumlu Servisler

| Servis | Açıklama |
|--------|----------|
| Cloudflare R2 | Ücretsiz egress, S3 uyumlu |
| MinIO | Self-hosted, açık kaynak |
| DigitalOcean Spaces | Uygun fiyatlı |
| Backblaze B2 | Ekonomik seçenek |

### S3 Bucket Politikası (Public Read için)

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::BUCKET_ADI/*"
        }
    ]
}
```

---

## 6. Environment Değişkenleri

Proje kök dizininde `.env` dosyası oluşturun:

```bash
# Veritabanı
DATABASE_URL="mysql://nanoinf_user:SIFRE@localhost:3306/nanoinf"

# JWT Secret (rastgele 64 karakter)
JWT_SECRET="RASTGELE_64_KARAKTERLIK_GUVENLI_STRING"

# S3 Yapılandırması
S3_BUCKET="bucket-adiniz"
S3_REGION="eu-central-1"
S3_ACCESS_KEY="AWS_ACCESS_KEY"
S3_SECRET_KEY="AWS_SECRET_KEY"
S3_ENDPOINT="https://s3.eu-central-1.amazonaws.com"  # Veya alternatif endpoint

# Uygulama Ayarları
VITE_APP_ID="nanoinf"
VITE_APP_TITLE="NanoInf"
NODE_ENV="production"

# SMTP Email Doğrulama (Zorunlu)
SMTP_HOST="cpmail.hostingdunyam.online"
SMTP_PORT="465"
SMTP_USER="noreply@amonify.com"
SMTP_PASS="EMAIL_SIFRESI"

# Google OAuth (Opsiyonel - varsayılan: false)
GOOGLE_AUTH_ENABLED="false"  # "true" yaparak Google ile giriş aktif edilir
VITE_CLERK_PUBLISHABLE_KEY=""  # Google auth için Clerk publishable key
CLERK_SECRET_KEY=""  # Google auth için Clerk secret key

# AI Servisleri (Kendi API anahtarlarınızı alın)
KIE_AI_API_KEY="kie_ai_api_anahtariniz"

# Telegram Bot (Opsiyonel)
TELEGRAM_BOT_TOKEN="telegram_bot_token"
TELEGRAM_ADMIN_CHAT_ID="admin_chat_id"
```

### Kritik Environment Değişkenleri Tablosu

| Değişken | Açıklama | Zorunlu |
|----------|----------|---------|
| DATABASE_URL | MySQL bağlantı string'i | Evet |
| JWT_SECRET | Session imzalama anahtarı | Evet |
| S3_BUCKET | S3 bucket adı | Evet |
| S3_ACCESS_KEY | S3 erişim anahtarı | Evet |
| S3_SECRET_KEY | S3 gizli anahtar | Evet |
| SMTP_HOST | SMTP sunucu adresi | Evet |
| SMTP_PORT | SMTP port (genellikle 465) | Evet |
| SMTP_USER | SMTP kullanıcı adı (email) | Evet |
| SMTP_PASS | SMTP şifresi | Evet |
| KIE_AI_API_KEY | Video üretimi için | Evet |
| GOOGLE_AUTH_ENABLED | Google ile giriş aktif mi (true/false) | Hayır |


---

## 7. Proje Kurulumu

### 7.1 Projeyi Sunucuya Aktarın

```bash
# Proje dizinini oluşturun
sudo mkdir -p /var/www/nanoinf
sudo chown $USER:$USER /var/www/nanoinf

# Dosyaları aktarın (yerel makineden)
rsync -avz --exclude node_modules --exclude .git ./ user@sunucu:/var/www/nanoinf/

# Veya Git ile klonlayın (eğer repo'nuz varsa)
git clone https://github.com/kullanici/nanoinf.git /var/www/nanoinf
```

### 7.2 Bağımlılıkları Yükleyin

```bash
cd /var/www/nanoinf
pnpm install
```

### 7.3 Veritabanı Migrasyonlarını Çalıştırın

```bash
pnpm db:push
```

### 7.4 Projeyi Derleyin

```bash
pnpm build
```

Bu komut:
- Frontend'i `dist/` klasörüne derler
- Backend'i `dist/index.js` olarak bundle'lar

### 7.5 Uygulamayı Test Edin

```bash
pnpm start
```

Uygulama `http://localhost:3000` adresinde çalışmalıdır.

---

## 8. Harici API Entegrasyonları

### 8.1 Kimlik Doğrulama Değişikliği

Mevcut proje Manus OAuth kullanmaktadır. Kendi sunucunuzda çalıştırmak için aşağıdaki seçeneklerden birini uygulayın:

**Seçenek A: Basit Email/Şifre Kimlik Doğrulama**

`server/_core/auth.ts` dosyasını düzenleyerek bcrypt tabanlı basit kimlik doğrulama ekleyin.

**Seçenek B: OAuth Sağlayıcıları**

Google, GitHub veya Discord OAuth entegrasyonu için Passport.js kullanabilirsiniz.

### 8.2 Kie AI API

Video üretimi için Kie AI API kullanılmaktadır. API anahtarı almak için:

1. [Kie AI](https://www.kieai.com) sitesine kayıt olun
2. Dashboard'dan API anahtarı oluşturun
3. `KIE_AI_API_KEY` environment değişkenine ekleyin

### 8.3 LLM Entegrasyonu

Prompt geliştirme ve AI özellikleri için `server/_core/llm.ts` dosyasındaki `invokeLLM` fonksiyonunu düzenlemeniz gerekecektir. OpenAI, Anthropic veya diğer LLM sağlayıcılarını kullanabilirsiniz.

---

## 9. Nginx ve SSL Yapılandırması

### 9.1 Nginx Yapılandırması

`/etc/nginx/sites-available/nanoinf` dosyası oluşturun:

```nginx
server {
    listen 80;
    server_name nanoinf.com www.nanoinf.com;

    # HTTP'yi HTTPS'e yönlendir
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name nanoinf.com www.nanoinf.com;

    # SSL Sertifikaları (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/nanoinf.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nanoinf.com/privkey.pem;

    # SSL Ayarları
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # Güvenlik Başlıkları
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Dosya yükleme limiti
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 9.2 Nginx'i Etkinleştirin

```bash
sudo ln -s /etc/nginx/sites-available/nanoinf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 9.3 SSL Sertifikası (Let's Encrypt)

```bash
# Certbot kurulumu
sudo apt install -y certbot python3-certbot-nginx

# SSL sertifikası alın
sudo certbot --nginx -d nanoinf.com -d www.nanoinf.com

# Otomatik yenileme testi
sudo certbot renew --dry-run
```

---

## 10. PM2 ile Süreç Yönetimi

### 10.1 PM2 Ecosystem Dosyası

Proje kök dizininde `ecosystem.config.cjs` dosyası oluşturun:

```javascript
module.exports = {
  apps: [{
    name: 'nanoinf',
    script: 'dist/index.js',
    cwd: '/var/www/nanoinf',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '.env',
    max_memory_restart: '1G',
    error_file: '/var/log/nanoinf/error.log',
    out_file: '/var/log/nanoinf/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

### 10.2 Log Dizinini Oluşturun

```bash
sudo mkdir -p /var/log/nanoinf
sudo chown $USER:$USER /var/log/nanoinf
```

### 10.3 Uygulamayı Başlatın

```bash
cd /var/www/nanoinf
pm2 start ecosystem.config.cjs

# Sistem başlangıcında otomatik başlat
pm2 startup
pm2 save
```

### 10.4 PM2 Komutları

| Komut | Açıklama |
|-------|----------|
| `pm2 status` | Uygulama durumunu göster |
| `pm2 logs nanoinf` | Logları görüntüle |
| `pm2 restart nanoinf` | Uygulamayı yeniden başlat |
| `pm2 stop nanoinf` | Uygulamayı durdur |
| `pm2 monit` | Canlı izleme |

---

## 11. Sorun Giderme

### Yaygın Sorunlar ve Çözümleri

**Sorun: Veritabanı bağlantı hatası**
```bash
# MySQL servisini kontrol edin
sudo systemctl status mysql

# Bağlantıyı test edin
mysql -u nanoinf_user -p -h localhost nanoinf
```

**Sorun: Port 3000 kullanımda**
```bash
# Portu kullanan süreci bulun
sudo lsof -i :3000

# Süreci sonlandırın
sudo kill -9 PID
```

**Sorun: S3 yükleme hatası**
- Access Key ve Secret Key'in doğruluğunu kontrol edin
- Bucket politikasının doğru yapılandırıldığından emin olun
- Region'ın doğru olduğunu doğrulayın

**Sorun: SSL sertifikası yenilenmiyor**
```bash
# Certbot timer'ını kontrol edin
sudo systemctl status certbot.timer

# Manuel yenileme
sudo certbot renew
```

### Güncelleme Prosedürü

```bash
cd /var/www/nanoinf

# Yeni dosyaları aktarın
rsync -avz --exclude node_modules --exclude .git ./ user@sunucu:/var/www/nanoinf/

# Bağımlılıkları güncelleyin
pnpm install

# Veritabanı migrasyonlarını çalıştırın
pnpm db:push

# Projeyi yeniden derleyin
pnpm build

# Uygulamayı yeniden başlatın
pm2 restart nanoinf
```

---

## Sonuç

Bu rehberi takip ederek NanoInf projesini kendi sunucunuza başarıyla taşıyabilirsiniz. Herhangi bir sorunla karşılaşırsanız, yukarıdaki sorun giderme bölümüne başvurun.

**Önemli Notlar:**
- Tüm API anahtarlarını güvenli bir şekilde saklayın
- Düzenli yedekleme yapın (veritabanı ve S3)
- Güvenlik güncellemelerini takip edin
- SSL sertifikasının otomatik yenilendiğinden emin olun

---

*Bu doküman Manus AI tarafından hazırlanmıştır.*
