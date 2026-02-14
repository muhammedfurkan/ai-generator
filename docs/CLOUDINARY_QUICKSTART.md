# 🚀 Cloudinary ile 5 Dakikada Storage Kurulumu

En hızlı ve ücretsiz storage çözümü!

## ✅ Adımlar

### 1. Cloudinary Hesabı Oluştur (2 dakika)

1. [cloudinary.com/users/register/free](https://cloudinary.com/users/register/free) adresine git
2. Email ile kayıt ol (ücretsiz)
3. Email'ini onayla

### 2. API Bilgilerini Kopyala (1 dakika)

1. [Cloudinary Dashboard](https://console.cloudinary.com) → Ana sayfa
2. "Product Environment Credentials" bölümünden kopyala:
   - **Cloud name** (örn: `dxyz123abc`)
   - **API Key** (örn: `123456789012345`)
   - **API Secret** (örn: `abcdefghijklmnopqrstuvwxyz`)

### 3. .env Dosyasını Güncelle (1 dakika)

```bash
nano /home/nano-influencer/.env
```

Şu satırları bul ve doldur:

```bash
# Storage Configuration
STORAGE_PROVIDER=cloudinary

# Cloudinary (Recommended - 25GB free storage, 25GB bandwidth/month)
CLOUDINARY_CLOUD_NAME=dxyz123abc          # 👈 Buraya cloud name'ini yapıştır
CLOUDINARY_API_KEY=123456789012345        # 👈 Buraya API key'ini yapıştır
CLOUDINARY_API_SECRET=abcdefghijklmnopqr  # 👈 Buraya API secret'ını yapıştır
```

Kaydet ve çık: `Ctrl+O`, `Enter`, `Ctrl+X`

### 4. Sunucuyu Yeniden Başlat (1 dakika)

```bash
cd /home/nano-influencer
pm2 restart nano-influencer
```

### 5. Test Et! ✅

1. Uygulamana git (örn: `https://amonify.com`)
2. Giriş yap
3. Bir görsel oluştur (AI Influencer, Generate, vs.)
4. **Başarılı!** Görsel Cloudinary'ye yüklendi

Log'ları kontrol et:
```bash
pm2 logs nano-influencer
```

Şunu göreceksin:
```
[Storage] Cloudinary upload success: https://res.cloudinary.com/...
```

---

## 🎉 TAMAM!

**Şimdi ne oldu?**
- ✅ Tüm görseller/videolar Cloudinary'de saklanıyor
- ✅ Global CDN ile ultra hızlı yükleme
- ✅ Otomatik optimizasyon (WebP, boyut, vs.)
- ✅ 25GB ücretsiz storage
- ✅ 25GB/ay ücretsiz bandwidth

**Cloudinary Dashboard:**
- [console.cloudinary.com](https://console.cloudinary.com)
- Media Library → `nanoinf` klasörü altında tüm dosyalar
- Kullanım istatistikleri
- Transform/optimize ayarları

---

## 🐛 Sorun mu var?

### Hata: "Cloudinary not configured"

`.env` dosyasını kontrol et:
```bash
cat /home/nano-influencer/.env | grep CLOUDINARY
```

Üç satır da dolu olmalı:
```bash
CLOUDINARY_CLOUD_NAME=dxyz123abc  # ✅ Dolu
CLOUDINARY_API_KEY=123456789      # ✅ Dolu
CLOUDINARY_API_SECRET=abcxyz      # ✅ Dolu
```

Boşsa, .env'i tekrar düzenle:
```bash
nano /home/nano-influencer/.env
```

### Hata: "Upload failed"

API credentials yanlış olabilir:
1. [Cloudinary Dashboard](https://console.cloudinary.com) → Settings → Access Keys
2. Credentials'ı tekrar kopyala
3. `.env` dosyasına yapıştır
4. `pm2 restart nano-influencer`

### Görseller yüklenmiyor

```bash
# Log'ları kontrol et
pm2 logs nano-influencer --lines 50

# Restart dene
pm2 restart nano-influencer

# Hala olmazsa
pm2 delete nano-influencer
cd /home/nano-influencer
pm2 start ecosystem.config.cjs
```

---

## 📊 Ücretsiz Plan Limitleri

- ✅ **Storage:** 25 GB
- ✅ **Bandwidth:** 25 GB/ay
- ✅ **Transformations:** 25,000/ay
- ✅ **Dosya boyutu:** Max 10 MB/dosya

**Yeterli mi?**
- 25 GB = ~50,000 görsel (500KB ortalama)
- Aylık ~5,000-10,000 kullanıcı için yeterli

**Limit aşarsan:**
- Cloudinary Plus Plan: $89/ay (500GB + 100GB bandwidth)

---

## 🎯 Sonraki Adımlar

1. **Backup Setup:**
   - [Auto-backup ayarla](https://cloudinary.com/documentation/backups_and_version_management)
   - S3'e otomatik yedekleme

2. **Optimizasyon:**
   - Auto format: WebP/AVIF
   - Auto quality
   - Lazy loading

3. **Monitoring:**
   - Dashboard'tan kullanım takip et
   - Limit uyarıları aç

---

**🎉 Artık production'dasın! İyi şanslar!**

Başka sorun varsa [STORAGE_SETUP_GUIDE.md](STORAGE_SETUP_GUIDE.md)'ye bak.
