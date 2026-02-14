# Storage Yapılandırma Rehberi

Manus Forge API kaldırıldı. Dosya yüklemeleri için üç seçenek mevcut:

## 🎯 Seçenekler (Önerilen Sırada)

### 1. ⭐ Cloudinary (ÖNERİLEN)
**Neden Cloudinary?**
- ✅ **Ücretsiz Plan:** 25GB depolama + 25GB bandwidth/ay
- ✅ **Kolay Kurulum:** 5 dakika
- ✅ **Otomatik Optimizasyon:** Görseller otomatik optimize edilir
- ✅ **Video Desteği:** Video transkoding dahil
- ✅ **Global CDN:** Ultra hızlı yükleme
- ✅ **Transform API:** Anında resize, crop, filter

**Maliyet:** 
- Ücretsiz: 25GB storage, 25GB bandwidth
- Plus ($99/ay): 500GB storage, 100GB bandwidth

### 2. 💰 Cloudflare R2 (EKONOMİK)
**Neden R2?**
- ✅ **ÜCRETSİZ Egress:** Transfer ücreti yok
- ✅ **S3 Uyumlu:** AWS SDK ile çalışır
- ✅ **Ucuz:** $0.015/GB depolama

**Maliyet:**
- İlk 10GB: ÜCRETSIZ
- Depolama: $0.015/GB
- Egress: ÜCRETSIZ (AWS'de $90/TB!)

### 3. 🏢 AWS S3 (ENTERPRISE)
**Ne Zaman Kullanılır:**
- Büyük şirket projesi
- AWS ekosistemi gerekli
- Compliance/security gereksinimleri

**Maliyet:**
- Depolama: $0.023/GB
- Transfer: $0.09/GB (PAHALI!)

---

## 🚀 Hızlı Kurulum

### Option 1: Cloudinary (5 dakika) ⭐

#### 1. Hesap Oluştur
1. [cloudinary.com](https://cloudinary.com) → Sign up (ücretsiz)
2. Dashboard'a git
3. Bu bilgileri kopyala:
   - **Cloud Name** (örn: `dxyz123abc`)
   - **API Key** (örn: `123456789012345`)
   - **API Secret** (örn: `abcdefghijklmnopqrstuvwxyz`)

#### 2. `.env` Dosyasını Güncelle
```bash
# Storage Configuration
STORAGE_PROVIDER=cloudinary

# Cloudinary
CLOUDINARY_CLOUD_NAME=dxyz123abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

#### 3. Sunucuyu Yeniden Başlat
```bash
pm2 restart nano-influencer
```

#### 4. Test Et
Bir görsel oluştur - otomatik olarak Cloudinary'ye yüklenecek!

**TAMAM! ✅ Cloudinary hazır.**

**Dashboard:** https://console.cloudinary.com
- Tüm görselleri/videoları görebilirsin
- Kullanım istatistikleri
- Transform/optimize ayarları

---

### Option 2: Cloudflare R2 (15 dakika) 💰

#### 1. R2 Bucket Oluştur
1. [dash.cloudflare.com](https://dash.cloudflare.com) → R2
2. **Create bucket** → Bucket name: `nanoinf-storage`
3. Location: Automatic

#### 2. Public Access Ayarla
1. Bucket settings → **Public access**
2. **Allow access** → Copy public URL
   - Örn: `https://pub-abc123xyz.r2.dev`

#### 3. API Token Oluştur
1. R2 → **Manage R2 API Tokens**
2. **Create API Token**
3. Permissions: **Object Read & Write**
4. Kopyala:
   - **Access Key ID**
   - **Secret Access Key**

#### 4. Account ID Bul
1. Cloudflare Dashboard → Sağ üst köşe
2. Account ID'yi kopyala

#### 5. `.env` Dosyasını Güncelle
```bash
# Storage Configuration
STORAGE_PROVIDER=r2

# Cloudflare R2
S3_BUCKET=nanoinf-storage
S3_REGION=auto
S3_ACCESS_KEY=your_access_key_id_here
S3_SECRET_KEY=your_secret_access_key_here
S3_ENDPOINT=https://ACCOUNT_ID.r2.cloudflarestorage.com
S3_PUBLIC_URL=https://pub-ACCOUNT_ID.r2.dev
CLOUDFLARE_ACCOUNT_ID=your_account_id
```

`ACCOUNT_ID`'yi kendi account ID'nizle değiştirin!

#### 6. AWS SDK Yükle
```bash
cd /home/nano-influencer
npm install @aws-sdk/client-s3
# veya
pnpm add @aws-sdk/client-s3
```

#### 7. Sunucuyu Yeniden Başlat
```bash
pm2 restart nano-influencer
```

**TAMAM! ✅ Cloudflare R2 hazır.**

---

### Option 3: AWS S3 (20 dakika) 🏢

#### 1. S3 Bucket Oluştur
1. AWS Console → S3 → **Create bucket**
2. Bucket name: `nanoinf-storage` (benzersiz olmalı)
3. Region: `eu-central-1` (size yakın bölge seçin)
4. **Block public access:** ❌ KAPALI
5. Create bucket

#### 2. Bucket Policy Ekle
1. Bucket → Permissions → **Bucket policy**
2. Şu policy'yi ekle:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::nanoinf-storage/*"
    }
  ]
}
```

#### 3. IAM User Oluştur
1. AWS Console → IAM → Users → **Add user**
2. User name: `nanoinf-uploader`
3. **Programmatic access**
4. Permissions: **Attach existing policies** → `AmazonS3FullAccess`
5. Create user → **Download .csv** (Access key + Secret key)

#### 4. `.env` Dosyasını Güncelle
```bash
# Storage Configuration
STORAGE_PROVIDER=s3

# AWS S3
S3_BUCKET=nanoinf-storage
S3_REGION=eu-central-1
S3_ACCESS_KEY=AKIAXXXXXXXXXXXXXXXX
S3_SECRET_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

#### 5. AWS SDK Yükle
```bash
cd /home/nano-influencer
npm install @aws-sdk/client-s3
# veya
pnpm add @aws-sdk/client-s3
```

#### 6. Sunucuyu Yeniden Başlat
```bash
pm2 restart nano-influencer
```

**TAMAM! ✅ AWS S3 hazır.**

---

## 🧪 Test

```bash
# Log'ları izle
pm2 logs nano-influencer

# Test: Bir görsel üret
# Dashboard'tan veya API'den görsel oluştur
# Log'larda "[Storage] Upload success" görmelisin
```

---

## 🐛 Sorun Giderme

### Cloudinary Hataları

**Hata: "Cloudinary not configured"**
```bash
# .env kontrol et
cat .env | grep CLOUDINARY

# Değişkenler boş olmamalı
CLOUDINARY_CLOUD_NAME=dxyz123abc  # ✅ Dolu olmalı
CLOUDINARY_API_KEY=123456789      # ✅ Dolu olmalı
CLOUDINARY_API_SECRET=abcxyz      # ✅ Dolu olmalı
```

**Hata: "Upload failed"**
- API credentials doğru mu kontrol et
- [Cloudinary Dashboard](https://console.cloudinary.com) → Settings → Security
- API Key'i yeniden oluştur

**Görseller Cloudinary'de görünmüyor**
- Dashboard → Media Library → Filter: `folder:nanoinf`
- Auto-backup aktif mi kontrol et

### R2/S3 Hataları

**Hata: "S3_BUCKET not configured"**
```bash
# .env kontrol et
cat .env | grep S3_

# STORAGE_PROVIDER doğru mu?
STORAGE_PROVIDER=r2  # veya s3
```

**Hata: "Access Denied"**
- IAM/R2 token izinleri kontrol et
- Bucket policy public read izni veriyor mu?
- Access key doğru mu?

**Hata: "Module not found: @aws-sdk/client-s3"**
```bash
cd /home/nano-influencer
npm install @aws-sdk/client-s3
pm2 restart nano-influencer
```

**Görseller yüklenmiyor ama hata yok**
- Public URL doğru mu?
- Bucket CORS ayarları (gerekirse):
```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"]
  }
]
```

### Genel Hatalar

**Hata: "Unknown STORAGE_PROVIDER"**
```bash
# .env'de STORAGE_PROVIDER şunlardan biri olmalı:
STORAGE_PROVIDER=cloudinary  # veya 'r2' veya 's3'
```

**Dosya boyutu çok büyük**
- Cloudinary free: Max 10MB/dosya
- R2/S3: Varsayılan 5GB limit

---

## 💰 Maliyet Karşılaştırması

### Aylık 1000 Görsel + 100 Video Senaryosu

| Provider | Depolama | Bandwidth | Aylık Maliyet |
|----------|----------|-----------|---------------|
| **Cloudinary (Free)** | 25GB | 25GB | **$0** ⭐ |
| **Cloudinary (Plus)** | 500GB | 100GB | **$99** |
| **Cloudflare R2** | 50GB | Unlimited | **$0.75** 💰 |
| **AWS S3** | 50GB | 500GB | **$46** |

**Öneri:**
- **Başlangıç:** Cloudinary Free (0-1000 kullanıcı)
- **Büyüme:** Cloudflare R2 (1000-10K kullanıcı)
- **Enterprise:** AWS S3 (10K+ kullanıcı)

---

## 📊 Karşılaştırma Tablosu

| Özellik | Cloudinary | Cloudflare R2 | AWS S3 |
|---------|------------|---------------|--------|
| **Kurulum** | ⭐⭐⭐⭐⭐ 5 dk | ⭐⭐⭐⭐ 15 dk | ⭐⭐⭐ 20 dk |
| **Ücretsiz Tier** | ✅ 25GB | ✅ 10GB | ❌ Yok |
| **Egress Ücreti** | ✅ Dahil | ✅ ÜCRETSIZ | ❌ Pahalı |
| **Auto Optimize** | ✅ Var | ❌ Yok | ❌ Yok |
| **Transform API** | ✅ Var | ❌ Yok | ❌ Yok |
| **Video Support** | ✅ Full | ✅ Basic | ✅ Basic |
| **CDN** | ✅ Global | ✅ 250+ PoP | ✅ CloudFront |
| **Dashboard** | ✅ Güzel | ⭐⭐⭐ OK | ⭐⭐ Basic |

---

## 🎯 Hangi Birini Seçmeliyim?

### Cloudinary Seç Eğer:
- ✅ Hızlı başlamak istiyorsun
- ✅ Görsel optimizasyonu önemli
- ✅ Video transcoding lazım
- ✅ Dashboard'tan yönetmek istiyorsun
- ✅ Ücretsiz başlamak istiyorsun

### Cloudflare R2 Seç Eğer:
- ✅ Maliyet çok önemli
- ✅ Yüksek bandwidth bekliyorsun
- ✅ S3 uyumluluğu istiyorsun
- ✅ Kendi optimizasyonunu yapacaksın

### AWS S3 Seç Eğer:
- ✅ AWS ekosistemi kullanıyorsun
- ✅ Enterprise compliance gerekli
- ✅ Çok büyük ölçek (100TB+)
- ✅ AWS Lambda/SQS entegrasyonu gerekli

---

## ✅ Hızlı Başlangıç Özeti

**En kolay ve ücretsiz:** Cloudinary
```bash
1. cloudinary.com/users/register/free
2. Copy: Cloud Name, API Key, API Secret
3. .env'e ekle: STORAGE_PROVIDER=cloudinary
4. pm2 restart nano-influencer
5. TAMAM! ✅
```

**En ucuz:** Cloudflare R2
```bash
1. R2 bucket oluştur
2. Public access aç
3. API token al
4. npm install @aws-sdk/client-s3
5. .env'e ekle: STORAGE_PROVIDER=r2
6. pm2 restart nano-influencer
7. TAMAM! ✅
```

---

## 📚 Ek Kaynaklar

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)

---

**🎉 İyi şanslar! Sorun olursa log'lara bak: `pm2 logs nano-influencer`**
```

## Sorun Giderme

**Hata: "Storage not configured"**
- `.env` dosyasındaki S3 değişkenlerini kontrol edin
- Sunucuyu yeniden başlatın

**Hata: "Access Denied"**
- IAM/R2 token izinlerini kontrol edin
- Bucket policy'yi doğrulayın

**Görseller yüklenmiyor**
- Bucket'ın public access ayarlarını kontrol edin
- CORS yapılandırması ekleyin (gerekirse)

## Maliyet Tahmini

**AWS S3:**
- 100GB depolama: ~$2.30/ay
- 1TB transfer: ~$90/ay
- Toplam (ortalama): ~$20-50/ay

**Cloudflare R2:**
- 100GB depolama: ~$1.50/ay
- Transfer: ÜCRETSİZ
- Toplam: ~$1.50/ay (çok daha ekonomik!)

**Öneri:** Cloudflare R2 ile başlayın, gerekirse AWS'ye geçin.
