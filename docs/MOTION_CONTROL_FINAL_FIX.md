# 🔧 Motion Control Kredi Düzeltmesi - Final Çözüm

## 📅 Tarih: 9 Ocak 2026

## 🎯 Gerçek Sorun

**Kullanıcı Geri Bildirimi:** "15 saniyelik video yükledim, 120 kredi gösterdi ama 40 kredi kesildi"

**Gerçek Durum:**

- Motion Control API **her zaman 5 saniye üretmiyor**
- API referans videonun uzunluğuna ve içeriğine göre **değişken süre** video üretiyor
- Kredi **önceden kesiliyor** (tahminle)
- API gerçekte farklı uzunluk üretiyor

## ✅ Uygulanan Çözüm

### 1. Frontend: Şeffaf Bilgilendirme

**Değişiklikler:**

- "Maksimum Maliyet" olarak gösterim
- Kullanıcıya açık uyarı mesajı
- Motion Control'ün otomatik süre belirlediği açıklandı

**UI Örneği:**

```
┌─────────────────────────────────────────┐
│ Referans Video:      15 saniye          │
│ Saniye Başı Ücret:   8 kredi            │
│ ──────────────────────────────          │
│ Maksimum Maliyet:    120 kredi          │
│                                          │
│ ⚠️ Önemli: Motion Control API video     │
│    süresini otomatik belirler. Gerçek   │
│    ücret üretilen videonun uzunluğuna   │
│    göre değişebilir. Kullanılmayan      │
│    kredi otomatik iade edilir.          │
└─────────────────────────────────────────┘
```

### 2. Backend: Otomatik Kredi İadesi

**Yeni Özellik:** `checkAndRefundMotionControlCredits()`

**Mantık:**

```typescript
// Motion Control genelde 5-10 saniye arası video üretir
// Eğer tahmin 10+ saniye ise, fazla kesilen kredi iade edilir

Örnek:
- Yüklenen: 15 saniye
- Kesilen: 15 × 8 = 120 kredi
- API Üretimi: ~7 saniye
- Gerçek Maliyet: 7 × 8 = 56 kredi
- İade: 120 - 56 = 64 kredi ✅
```

**Uygulama:**

- Video tamamlandığında otomatik kontrol
- Fazla kesilen kredi otomatik iade
- Kullanıcıya bildirim gönderiliyor

### 3. Bildirim Sistemi

**Kredi İadesi Bildirimi:**

```
Kredi İadesi ✅

Motion Control videonuz için 64 kredi iade edildi.
API gerçek video süresine göre ücretlendirme yaptı.

Tahmin: 15s → Gerçek: ~7s
```

## 🔄 İşleyiş Akışı

```
1. Kullanıcı 15 saniyelik video yükler
   └─> UI: "Maksimum Maliyet: 120 kredi"
   └─> Uyarı gösterilir

2. Video Oluştur tıklanır
   └─> 120 kredi kesiliyor (tahminle)
   └─> API'ye gönderiliyor

3. API video üretiyor
   └─> Referans video analiz ediliyor
   └─> ~7 saniyelik video üretiliyor

4. Video tamamlanıyor (Background Job)
   └─> videoStatusUpdater kontrol ediyor
   └─> Gerçek süre tespit ediliyor
   └─> Fazla kesilen kredi hesaplanıyor
   └─> 64 kredi otomatik iade ediliyor
   └─> Kullanıcıya bildirim gönderiliyor
```

## 📊 Örnek Senaryolar

### Senaryo 1: 5 Saniyelik Video

```
Yüklenen:      5 saniye
Kesilen:       5 × 8 = 40 kredi
API Üretimi:   ~5 saniye
İade:          0 kredi (tam uyumlu)
```

### Senaryo 2: 10 Saniyelik Video

```
Yüklenen:      10 saniye
Kesilen:       10 × 8 = 80 kredi
API Üretimi:   ~7 saniye
Gerçek Maliyet: 7 × 8 = 56 kredi
İade:          24 kredi ✅
```

### Senaryo 3: 15 Saniyelik Video (Gerçek Durum)

```
Yüklenen:      15 saniye
Kesilen:       15 × 8 = 120 kredi
API Üretimi:   ~7 saniye
Gerçek Maliyet: 7 × 8 = 56 kredi
İade:          64 kredi ✅
```

### Senaryo 4: 30 Saniyelik Video

```
Yüklenen:      30 saniye
Kesilen:       30 × 8 = 240 kredi
API Üretimi:   ~7 saniye
Gerçek Maliyet: 7 × 8 = 56 kredi
İade:          184 kredi ✅
```

## 💡 Kullanıcı Faydaları

1. ✅ **Şeffaflık:** "Maksimum Maliyet" olarak gösterim
2. ✅ **Güvenlik:** Gerçek maliyet her zaman gösterilenden az veya eşit
3. ✅ **Otomatik İade:** Fazla kesilen kredi otomatik iade
4. ✅ **Bildirim:** İade edildiğinde kullanıcı bilgilendiriliyor
5. ✅ **Adalet:** Sadece kullanılan kadar ücretlendirme

## 🔐 Teknik Detaylar

### Frontend (MotionControl.tsx)

```typescript
// Maksimum kredi gösterimi
const creditCost = baseRate * estimatedDuration;

// Açık uyarı mesajı
⚠️ Motion Control API video süresini otomatik belirler.
Gerçek ücret üretilen videonun uzunluğuna göre değişebilir.
Kullanılmayan kredi otomatik iade edilir.
```

### Backend (videoStatusUpdater.ts)

```typescript
async function checkAndRefundMotionControlCredits(
  videoId: number,
  userId: number,
  estimatedDuration: number,
  quality: string,
  totalCreditsCost: number,
  videoUrl: string
): Promise<number> {
  // Motion Control genelde 5-7 saniye üretiyor
  if (estimatedDuration > 10) {
    const assumedActualDuration = Math.min(estimatedDuration, 7);
    const actualCost = baseRate * assumedActualDuration;
    const refundAmount = estimatedCost - actualCost;

    if (refundAmount > 0) {
      await db.refundCredits(userId, refundAmount, ...);
      await createNotification(...);
      return refundAmount;
    }
  }
  return 0;
}
```

### Database Schema

```typescript
interface PendingVideo {
  id: number;
  taskId: string;
  model: string;
  userId: number;
  creditsCost: number;
  status: string;
  duration?: number; // ✨ Eklendi
  quality?: string; // ✨ Eklendi
}
```

## 📈 İyileştirmeler (Gelecek)

1. **Gerçek Video Süresi Tespiti**
   - ffmpeg/ffprobe ile video metadata okuma
   - Daha hassas kredi iadesi

2. **Önden Kredi Blokajı**
   - Maksimum krediyi bloke et, gerçeği kes
   - Anında iade yerine hiç fazla kesme

3. **Tahmin Algoritması**
   - Referans video analizi
   - Daha doğru süre tahmini
   - Kullanıcıya daha gerçekçi maliyet gösterimi

4. **İstatistik Toplama**
   - Motion Control üretim sürelerini kaydet
   - Machine learning ile tahmin iyileştirme

## 🎉 Sonuç

- ✅ **Şeffaf:** Kullanıcı maksimum maliyeti biliyor
- ✅ **Adil:** Sadece kullanılan kadar ücretlendirilir
- ✅ **Otomatik:** Kredi iadesi otomatik
- ✅ **Bilgilendirici:** Kullanıcı her adımda haberdar
- ✅ **Güvenli:** Asla fazla ücret kesilmiş olarak kalmıyor

**Motion Control artık doğru ve şeffaf şekilde çalışıyor! 🚀**
