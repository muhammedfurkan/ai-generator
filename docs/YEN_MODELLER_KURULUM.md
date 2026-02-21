# 🎬 Yeni Kie.ai Modellerini Ekle

## 📋 Özet

12 yeni Kie.ai video modeli sisteme eklenmiştir:

- Sora 2 Pro & Storyboard
- Kling 2.1 & 2.5
- Seedance 1.0 Lite, Pro & 1.5 Pro
- Hailuo 2.3
- Wan 2.2, 2.5 & 2.6
- Sora Watermark Remover

## 🚀 Kurulum Adımları

### Yöntem 1: Admin Panel'den (ÖNERİLEN)

1. **Admin paneline giriş yapın**

   ```
   https://amonify.com/admin
   ```

2. **Models sayfasına gidin**

   ```
   https://amonify.com/admin/models
   ```

3. **"Varsayılan Modelleri Yükle" butonuna tıklayın**
   - Eğer listede hiç model yoksa bu buton görünecektir
   - Buton, tüm modelleri (yeniler dahil) otomatik olarak ekleyecektir

4. **Sonucu kontrol edin**
   - Sayfa yenilendiğinde toplam 19 model görmelisiniz
   - 12 yeni model ✅ işaretiyle aktif olmalı

### Yöntem 2: API Endpoint'i Çağırarak

Admin kullanıcısı olarak aşağıdaki tRPC mutation'ı çağırabilirsiniz:

```typescript
// tRPC client üzerinden
const result = await trpc.adminPanel.initializeAiModels.mutate();
console.log(`${result.inserted} yeni model eklendi`);
console.log(`${result.updated} model güncellendi`);
```

## 📊 Eklenen Modeller

| Model                      | Provider  | Max Süre | Kredi | Öncelik |
| -------------------------- | --------- | -------- | ----- | ------- |
| **Sora 2 Pro**             | OpenAI    | 20s      | 40-65 | 2       |
| **Sora 2 Pro Storyboard**  | OpenAI    | 20s      | 80    | 2       |
| **Kling 2.1**              | Kuaishou  | 10s      | 35-60 | 4       |
| **Kling 2.5**              | Kuaishou  | 10s      | 40-70 | 3       |
| **Seedance 1.0 Lite**      | ByteDance | 6s       | 20-35 | 5       |
| **Seedance 1.0 Pro**       | ByteDance | 6s       | 30-50 | 4       |
| **Seedance 1.5 Pro**       | ByteDance | 10s      | 55-95 | 2       |
| **Hailuo 2.3**             | MiniMax   | 6s       | 25    | 5       |
| **Wan 2.2**                | Alibaba   | 10s      | 30-55 | 5       |
| **Wan 2.5**                | Alibaba   | 10s      | 35-60 | 4       |
| **Wan 2.6**                | Alibaba   | 10s      | 40-70 | 3       |
| **Sora Watermark Remover** | Kie AI    | 60s      | 20    | 10      |

## ✅ Doğrulama

Modellerin başarıyla eklendiğini doğrulamak için:

1. **Admin panel kontrolü:**

   ```
   /admin/models sayfasında 19 model görünmeli
   ```

2. **Frontend kontrolü:**

   ```
   /video-generate sayfasına gidin
   Model seçim dropdown'ında yeni modeller görünmeli
   ```

3. **API kontrolü:**
   ```bash
   curl https://amonify.com/api/trpc/videoGeneration.getPricing
   ```

   - Response'da yeni modellerin pricing bilgileri olmalı

## 🎯 Sonraki Adımlar

### 1. Feature Pricing Keys Ekleyin

Her model için database'de pricing key'leri oluşturun:

**Admin Panel > Features** sayfasına gidin ve şunları ekleyin:

```
video_sora2_pro_10s = 40
video_sora2_pro_15s = 50
video_sora2_pro_20s = 65
video_sora2_pro_storyboard = 80

video_kling21_5s = 35
video_kling21_10s = 60
video_kling25_5s = 40
video_kling25_10s = 70

video_seedance_lite_3s = 20
video_seedance_lite_6s = 35
video_seedance_pro_3s = 30
video_seedance_pro_6s = 50
video_seedance_15_pro_5s = 55
video_seedance_15_pro_10s = 95

video_hailuo_6s = 25

video_wan22_5s = 30
video_wan22_10s = 55
video_wan25_5s = 35
video_wan25_10s = 60
video_wan26_5s = 40
video_wan26_10s = 70

video_sora_watermark_remover = 20
```

### 2. Test Edin

1. `/video-generate` sayfasına gidin
2. Yeni bir model seçin (örn: "Sora 2 Pro")
3. Test video oluşturun
4. Credits düşüp düşmediğini kontrol edin

## 🔧 Sorun Giderme

### "Modeller görünmüyor"

- Tarayıcı cache'ini temizleyin
- `pm2 restart 0` ile sunucuyu yeniden başlatın

### "Pricing hatası"

- Feature pricing keys'lerin eklendiğinden emin olun
- Database bağlantısını kontrol edin

### "API hatası"

- `server/kieAiApi.ts` dosyasının güncel olduğundan emin olun
- Log'larda hata mesajlarını kontrol edin: `pm2 logs 0`

## 📝 Notlar

- ✅ **Backend API** tamamen hazır
- ✅ **Frontend types** güncel
- ✅ **Pricing sistem** entegre
- ⚠️ **Feature pricing keys** manuel eklenmeli
- ⚠️ **Actual API implementation** Kie.ai dökümanlarına göre yapılacak

## 📚 İlgili Dosyalar

- `server/routers/adminPanel.ts` - Model initialization
- `server/routers/videoGeneration.ts` - Video generation logic & pricing
- `server/kieAiApi.ts` - Kie.ai API integration
- `client/src/pages/VideoGenerate.tsx` - Frontend UI
- `KIE_AI_YENI_MODELLER.md` - Model detayları

---

**Hazırlayan:** AI Assistant  
**Tarih:** 2026-01-10  
**Versiyon:** 1.0
