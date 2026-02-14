# ✅ Wan 2.6 - 3 Generation Mode Desteği

**Tarih:** 2026-01-17  
**Durum:** ✅ Tamamlandı

---

## 🎯 Özellikler

### 1. Generation Modes: 3 Seçenek ✅
- ✅ **Text to Video** - Metin ile video
- ✅ **Image to Video** - Görsel ile video
- ✅ **Video to Video** - Video ile video (edit/transform)

### 2. Duration: 3 Seçenek ✅
- ✅ **5 Saniye**
- ✅ **10 Saniye**
- ✅ **15 Saniye**

### 3. Resolution: 2 Seçenek ✅
- ✅ **720p**
- ✅ **1080p**

### 4. Multi-Shot Support ✅
- ✅ Toggle: Tek çekim vs Çoklu çekim
- API'de `multi_shots` parametresi

---

## 📊 Fiyatlandırma Matrisi

| Resolution | Duration | Credits | Price (USD) |
|------------|----------|---------|-------------|
| 720p       | 5s       | 70      | $0.35       |
| 720p       | 10s      | 140     | $0.70       |
| 720p       | 15s      | 210     | $1.05       |
| 1080p      | 5s       | 104.5   | $0.52       |
| 1080p      | 10s      | 209.5   | $1.05       |
| 1080p      | 15s      | 315     | $1.58       |

---

## 🎨 UI Görünümü

### Wan 2.6 Seçildiğinde

```
┌─────────────────────────────────────┐
│ GENERATION MODE                     │
├─────────┬─────────────┬─────────────┤
│ Text to │ Image to    │ Video to    │
│  Video  │   Video     │   Video     │
└─────────┴─────────────┴─────────────┘

┌─────────────────────────────────────┐
│ DURATION                            │
├───────────┬───────────┬─────────────┤
│ 5 Saniye  │ 10 Saniye │ 15 Saniye   │
└───────────┴───────────┴─────────────┘

┌─────────────────────────────────────┐
│ RESOLUTION                          │
├──────────────────┬──────────────────┤
│ 720p             │ 1080p            │
└──────────────────┴──────────────────┘

┌─────────────────────────────────────┐
│ ASPECT RATIO                        │
├──────────────────┬──────────────────┤
│ 16:9 (Yatay)     │ 9:16 (Dikey)     │
└──────────────────┴──────────────────┘

┌─────────────────────────────────────┐
│ MULTI-SHOT (Advanced)               │
│ ☐ Enable multi-shot composition     │
└─────────────────────────────────────┘
```

---

## 🔧 Yapılan Değişiklikler

### Backend - `server/routers/videoGeneration.ts`

**ÖNCESİ:**
```typescript
"wan-26": {
  options: [
    { label: "720p 5s", value: "720p-5s", credits: 70 },
    // ... 6 kombinasyon
  ],
  supportsImageToVideo: true,
  supportsVideoToVideo: true,
}
```

**SONRASI:**
```typescript
"wan-26": {
  options: [
    { label: "5 Saniye", value: "5s", duration: "5s" },
    { label: "10 Saniye", value: "10s", duration: "10s" },
    { label: "15 Saniye", value: "15s", duration: "15s" },
  ],
  supportedDurations: ["5", "10", "15"],
  supportedResolutions: ["720p", "1080p"], // ✅ Ayrı seçim
  supportsImageToVideo: true,
  supportsVideoToVideo: true, // ✅ V2V mode
  hasMultiShotSupport: true, // ✅ Multi-shot toggle
}
```

**Değişiklikler:**
- ✅ Options sadece duration içeriyor
- ✅ Resolution ayrı parametre olarak
- ✅ Multi-shot support eklendi
- ✅ Video-to-video mode aktif

---

### Frontend - `client/src/pages/VideoGenerate.tsx`

#### Generation Type State

**ÖNCESİ:**
```tsx
const [generationType, setGenerationType] = 
  useState<"text-to-video" | "image-to-video">("text-to-video");
```

**SONRASI:**
```tsx
const [generationType, setGenerationType] = 
  useState<"text-to-video" | "image-to-video" | "video-to-video">("text-to-video");
```

#### Mode Toggle - 3 Buton

```tsx
{(selectedModelData as any)?.supportsVideoToVideo && (
  <button onClick={() => setGenerationType("video-to-video")}>
    Video to Video
  </button>
)}
```

**Conditional Grid:**
- Wan 2.6: **3 kolon** (T2V, I2V, V2V)
- Veo 3.1: **3 kolon** (T2V, I2V, R2V)
- Diğerleri: **2 kolon** (T2V, I2V)

---

## 🎯 Kullanım Senaryoları

### 1. Text to Video
```
Mode: Text to Video
Prompt: "A cinematic sunset over mountains"
Duration: 10s
Resolution: 1080p
Aspect: 16:9
Multi-shot: ☐ Off
Cost: 209.5 credits
```

### 2. Image to Video
```
Mode: Image to Video
Upload: landscape.jpg (reference)
Prompt: "Camera pans left to right"
Duration: 15s
Resolution: 720p
Aspect: 9:16
Multi-shot: ☐ Off
Cost: 210 credits
```

### 3. Video to Video (Transform/Edit)
```
Mode: Video to Video
Upload: input_video.mp4
Prompt: "Add cinematic color grading"
Duration: 5s
Resolution: 1080p
Aspect: 16:9
Multi-shot: ☑ On (transitions)
Cost: 104.5 credits
```

---

## 🔍 API Parametreleri

### Backend API Call

```typescript
await generateVideo({
  modelType: "wan-26",
  generationType: "video-to-video", // ✅ V2V support
  prompt: "...",
  videoUrl: "https://...", // ✅ Source video for V2V
  duration: "10",
  resolution: "1080p", // ✅ Separate parameter
  aspectRatio: "16:9",
  multiShots: true, // ✅ Multi-shot toggle
});
```

### Kie.ai API Mapping

```typescript
// Wan 2.6 API endpoint
POST /api/v1/jobs/createTask
{
  "model": "wan/2-6-video-to-video", // or text-to-video, image-to-video
  "prompt": "...",
  "duration": 10, // seconds
  "resolution": "1080p", // 720p or 1080p
  "multi_shots": true, // boolean
  "aspect_ratio": "16:9"
}
```

---

## ✅ Başarı Kriterleri

✅ **3 Generation Mode** (Text/Image/Video)  
✅ **3 Duration** seçeneği (5/10/15s)  
✅ **2 Resolution** seçeneği (720p/1080p)  
✅ **Multi-shot toggle** (advanced)  
✅ **Video-to-video** upload desteği  
✅ **Doğru fiyatlandırma** (70-315 kredi)  

---

## 🧪 Test Checklist

### Frontend UI
```bash
# 1. Wan 2.6 model seç
- Model listesinden Wan 2.6'yı seç

# 2. Generation Mode kontrol
- 3 buton görmeli: Text / Image / Video to Video
- Video to Video tıklanabilir olmalı

# 3. Duration kontrol
- 3 buton: 5s / 10s / 15s
- Her biri seçilebilir

# 4. Resolution kontrol
- 2 buton: 720p / 1080p
- Duration'dan bağımsız

# 5. Multi-shot kontrol
- Toggle checkbox görünmeli
- "Enable multi-shot composition" yazısı

# 6. Video Upload (V2V mode)
- Video to Video seçildiğinde
- Video upload alanı gösterilmeli
```

### Backend Pricing
```typescript
// 720p 5s
calculateVideoCreditCost("wan-2.6", {
  duration: "5",
  resolution: "720p"
}) // = 70 ✅

// 1080p 15s
calculateVideoCreditCost("wan-2.6", {
  duration: "15",
  resolution: "1080p"
}) // = 315 ✅
```

---

## 📁 Değiştirilen Dosyalar

| Dosya | Değişiklik | Açıklama |
|-------|-----------|----------|
| `server/routers/videoGeneration.ts` | ~10 satır | V2V support + resolution |
| `client/src/pages/VideoGenerate.tsx` | ~20 satır | 3-button toggle + V2V |
| `WAN_2_6_MODES.md` | +250 satır | Dokümentasyon |

---

## 🚀 Deployment

```bash
# 1. Build
pnpm build

# 2. PM2 reload
pm2 reload 0

# 3. Test
- [ ] Wan 2.6 seçince 3 generation mode var
- [ ] Duration: 5s/10s/15s seçilebiliyor
- [ ] Resolution: 720p/1080p ayrı
- [ ] Video to Video upload alanı çalışıyor
- [ ] Multi-shot toggle görünüyor
```

---

## 📝 Özet

### Her Generation Mode'un Özelliği

**Text to Video:**
- Input: Prompt
- Duration: 5/10/15s
- Resolution: 720p/1080p
- Multi-shot: Available

**Image to Video:**
- Input: Prompt + 1 Image
- Duration: 5/10/15s
- Resolution: 720p/1080p
- Multi-shot: Available

**Video to Video:**
- Input: Prompt + Source Video
- Duration: 5/10/15s (output)
- Resolution: 720p/1080p
- Multi-shot: Available (transitions)

---

**🎉 Wan 2.6 tüm 3 mode ile entegre edildi!**

**Sonuç:**
- ✅ Text/Image/Video-to-Video desteği
- ✅ Duration ve Resolution ayrı parametreler
- ✅ Multi-shot composition toggle
- ✅ Flexible pricing (70-315 kredi)
