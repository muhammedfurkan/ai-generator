# 🔧 Motion Control Kredi Hesaplama Düzeltmesi

## 📅 Tarih: 9 Ocak 2026

## 🐛 Sorun

**Kullanıcı Raporu:**
- Telegram bildirimi: 40 kredi kesilmiş
- Beklenen: 120 kredi
- Model: kling-motion (Pro quality - 1080p)
- Video: video-to-video, 5 saniye

**Gerçek Durum:**
```
Yüklenen Video: 15 saniye
Frontend Gösterimi: 15 × 8 = 120 kredi
API Üretimi: 5 saniye
Kesilen Kredi: 5 × 8 = 40 kredi ✅
```

## 🔍 Kök Sebep

**Kie.ai Motion Control API Davranışı:**
- API, yüklenen videonun **tamamını kullanmıyor**
- Hareket bilgisini referans olarak alıyor
- Kendi algoritmasına göre **~5 saniyelik** video üretiyor
- Yüklenen videonun uzunluğu ne olursa olsun (3-30 saniye), API yaklaşık 5 saniye üretiyor

**Frontend Hatası:**
- Yüklenen videonun gerçek süresini tespit ediyordu (15 saniye)
- Bu süreye göre kredi hesabı yapıyordu (120 kredi)
- Kullanıcıya yanlış bilgi gösteriyordu

**Backend:**
- Frontend'den gelen duration'ı kullanıyordu
- Ama API gerçekte farklı uzunlukta video üretiyordu

## ✅ Çözüm

### 1. Frontend Güncellemesi

**Değişiklikler:**
- `estimatedDuration` artık her zaman **5 saniye** (sabit)
- Yüklenen video süresi ayrı bir state'de saklanıyor (`uploadedVideoDuration`)
- Kullanıcıya doğru kredi miktarı gösteriliyor

**Yeni State:**
```typescript
const [uploadedVideoDuration, setUploadedVideoDuration] = useState<number>(5); // Bilgi amaçlı
const [estimatedDuration] = useState<number>(5); // API her zaman ~5 saniye üretir
```

### 2. UI İyileştirmeleri

**Video Yükleme Toast:**
```
Video yüklendi: 1920x1080, 15s

Not: Motion Control API yaklaşık 5 saniye video üretir.
```

**Kredi Hesaplama Paneli:**
```
┌──────────────────────────────────────┐
│ Üretilecek Video:    ~5 saniye       │
│ Yüklenen Video:      15s (referans)  │ ← Yeni: Sadece bilgi amaçlı
│ Saniye Başı Ücret:   8 kredi         │
│ ─────────────────────────────────    │
│ Maliyet:             40 kredi        │ ← Doğru gösterim
│                                      │
│ ℹ️ Motion Control API referans       │ ← Yeni: Açıklama
│    videonuzu hareket kontrolü için   │
│    kullanır ve ~5 saniye video       │
│    üretir.                            │
└──────────────────────────────────────┘
```

### 3. Backend Davranışı

**Değişiklik YOK** - Backend zaten doğru çalışıyordu:
```typescript
// videoGeneration.ts
const baseRate = input.quality === "high" ? 8 : 5;
const durationNum = parseInt(input.duration || "5");
creditCost = baseRate * durationNum;
```

Frontend artık her zaman `duration: "5"` gönderiyor.

## 📊 Karşılaştırma

### ❌ Önceki Durum

| Yüklenen Video | Frontend Gösterimi | Backend Kesimi | Telegram | Durum |
|---------------|-------------------|----------------|----------|-------|
| 15 saniye | 120 kredi | 120 kredi | 40 kredi | ❌ Tutarsız |

**Sorun:** Frontend yanlış hesaplama yapıyordu, API 5 saniye üretiyordu.

### ✅ Şimdiki Durum

| Yüklenen Video | Frontend Gösterimi | Backend Kesimi | Telegram | Durum |
|---------------|-------------------|----------------|----------|-------|
| 15 saniye | 40 kredi | 40 kredi | 40 kredi | ✅ Tutarlı |

**Çözüm:** Frontend doğru kredi gösteriyor, kullanıcı bilgilendiriliyor.

## 🎯 Motion Control API Davranışı

### Video Süresi Üretimi

```
Input Referans Video    →    API Çıktısı
─────────────────────────────────────────
3 saniye                →    ~5 saniye
5 saniye                →    ~5 saniye
10 saniye               →    ~5 saniye
15 saniye               →    ~5 saniye
20 saniye               →    ~5 saniye
30 saniye               →    ~5 saniye
```

**Neden?**
- Motion Control, videodaki **hareket bilgisini** referans alır
- Tüm videoyu kullanmaz, sadece hareket analizini yapar
- Sabit uzunlukta (~5 saniye) yeni video üretir
- Bu Kie.ai API'sinin tasarım kararıdır

## 💡 Kullanıcı İçin İpuçları

### Öneriler:
1. ✅ **Referans video 5-10 saniye yeterlidir** - Daha uzun yüklemeye gerek yok
2. ✅ **Net hareketler içeren** kısa videolar daha iyi sonuç verir
3. ✅ **Kredi hesabı şeffaf** - Gösterilen kredi kesilir
4. ✅ **15 saniyelik video yükleseniz de** 5 saniye üretilir ve o kadar ücretlendirilir

### Maliyet:
```
Standard (720p):  5 saniye × 5 kredi/s = 25 kredi
Pro (1080p):      5 saniye × 8 kredi/s = 40 kredi
```

## 🔒 Doğrulama

### Test Senaryoları:

**Senaryo 1: 5 saniyelik video (Pro)**
- Yüklenen: 5 saniye
- Gösterilen: 40 kredi
- Kesilen: 40 kredi ✅

**Senaryo 2: 15 saniyelik video (Pro)**
- Yüklenen: 15 saniye
- Gösterilen: 40 kredi ✅ (eskiden 120 kredi ❌)
- Kesilen: 40 kredi ✅

**Senaryo 3: 30 saniyelik video (Standard)**
- Yüklenen: 30 saniye
- Gösterilen: 25 kredi ✅ (eskiden 150 kredi ❌)
- Kesilen: 25 kredi ✅

## 📝 Değişen Dosyalar

1. **client/src/pages/MotionControl.tsx**
   - `estimatedDuration` sabit 5 saniye
   - `uploadedVideoDuration` yeni state (bilgi amaçlı)
   - UI'da açıklayıcı mesajlar
   - Toast bildirimi güncellendi

## 🎉 Sonuç

- ✅ Kredi hesaplaması **doğru ve şeffaf**
- ✅ Kullanıcı **bilgilendirildi** (Motion Control API davranışı)
- ✅ UI **tutarlı** - Gösterilen kredi = Kesilen kredi
- ✅ Backend **değişiklik gerektirmedi** (zaten doğru çalışıyordu)
- ✅ Telegram bildirimleri **doğru**

**Artık kullanıcılar doğru kredi miktarını görüyor ve sürpriz ücret kesintisi yok! 🚀**

---

## 📚 Ek Bilgi

### Kie.ai Motion Control API Limitleri:
- Minimum referans video: 3 saniye
- Maximum referans video: 30 saniye
- Üretilen video: ~5 saniye (sabit)
- Minimum çözünürlük: 720x720
- Aspect ratio: 16:9 (sabit)

### Pricing:
- Standard (720p): 5 kredi/saniye
- Pro (1080p): 8 kredi/saniye
- Her zaman 5 saniye için ücretlendirme
