# Kie.ai Model İncelemesi ve Eksik Kısımlar

**Tarih:** 2026-01-17  
**Dökümantasyon Kaynağı:** docs.kie.ai

## 📊 Mevcut Durum Özeti

### ✅ Entegre Edilmiş Modeller

#### Video Modelleri

- ✅ **Veo 3.1 (Fast & Quality)** - Tam entegre
- ✅ **Sora 2 & Sora 2 Pro** - Tam entegre
- ✅ **Kling 2.1, 2.5, 2.6** - Tam entegre
- ✅ **Kling Motion Control** - Tam entegre
- ✅ **Runway Gen-3 Alpha** - Kod entegrasyonu mevcut
- ✅ **Wan 2.2, 2.5, 2.6** - Tam entegre
- ✅ **Hailuo 2.3** - Tam entegre
- ✅ **Seedance (ByteDance) 1.0, 1.5** - Tam entegre
- ✅ **Grok Imagine Video** - Tam entegre

#### Image Modelleri

- ✅ **Seedream 4.5 (Text-to-Image & Edit)** - Tam entegre
- ✅ **Flux 2.0 Pro** - Tam entegre
- ✅ **Flux 1.1 Pro & Ultra** - Kod mevcut
- ✅ **Flux Kontext (Pro & Max)** - Tam entegre
- ✅ **4o-Image (GPT-4o)** - Tam entegre
- ✅ **Google Imagen 4** - Entegre edilmiş
- ✅ **Ideogram V3 & Character** - Tam entegre
- ✅ **Qwen Image** - Tam entegre
- ✅ **Z-Image** - Tam entegre
- ✅ **Grok Imagine (Image)** - Tam entegre
- ✅ **GPT Image 1.5** - Tam entegre
- ✅ **Nano Banana Pro** - Nano Banana API üzerinden entegre
- ✅ **Recraft V3 & 20B** - Kod entegrasyonu mevcut
- ✅ **Topaz Upscale** - Tam entegre

## 🔍 Eksik veya Geliştirilmesi Gereken Kısımlar

### 1. **Frontend Model Seçenekleri**

**Durum:** `generation.ts` dosyasında hardcoded model listesi var

**Sorun:**

```typescript
aiModel: z.enum([
  "qwen",
  "seedream",
  "nano-banana-pro",
  "flux-2-pro",
  "4o-image",
  "flux-kontext-pro",
  "google-imagen4",
  "ideogram-v3",
  "ideogram-character",
  "qwen-image",
  "z-image",
  "grok-imagine",
  "gpt-image-1.5",
  "seedream-edit",
]);
```

**Eksik Modeller:**

- `flux-1.1-pro` - Backend'de kieAiApi.ts'de tanımlı ama frontend'de yok
- `flux-1.1-pro-ultra` - Backend'de tanımlı ama frontend'de yok
- `recraft-v3` - Backend'de tanımlı ama frontend'de yok
- `recraft-20b` - Backend'de tanımlı ama frontend'de yok
- `ideogram-character-edit` - Backend'de tanımlı ama frontend'de yok
- `ideogram-character-remix` - Backend'de tanımlı ama frontend'de yok
- `qwen/image-edit` - Backend'de tanımlı ama frontend'de yok
- `nano-banana-edit` - Backend'de tanımlı ama frontend'de yok

### 2. **Image-to-Image Model Desteği**

**Sorun:** Bazı modellerde image-to-image desteği eksik

**Desteklenmesi Gerekenler (Kie.ai API'sine göre):**

- ✅ **Qwen** - Text-to-image, image-to-image, image-edit
- ✅ **Flux 2** - Pro image-to-image, flex image-to-image
- ⚠️ **Nano Banana** - Edit modu backend'de tanımlı ama frontend'de kullanılmıyor
- ⚠️ **Ideogram** - Character-edit ve character-remix backend'de tanımlı ama frontend'de kullanılmıyor

### 3. **Model-Specific Parameters**

**Eksiklikler:**

#### a) **Kling Video Models**

- ✅ `generate_audio` parametresi entegre (ses desteği)
- ✅ `aspect_ratio` entegre
- ✅ Motion Control için `character_orientation` entegre
- ⚠️ Kling 2.6 için `video_urls` (video-to-video) entegrasyonu eksik

#### b) **Flux Kontext**

- ✅ `enableTranslation` parametresi entegre
- ⚠️ `image_urls` parametresi mevcut ama frontend'den kullanılmıyor

#### c) **4o-Image**

- ✅ `size` parametresi entegre ("1:1", "3:2", "2:3")
- ✅ `filesUrl` (referans görseller) entegre
- ✅ `isEnhance` parametresi entegre
- ✅ Özel endpoint `/api/v1/gpt4o-image/generate` kullanılıyor

#### d) **Ideogram**

- ✅ `image_size` parametresi entegre (landscape_16_9, portrait_9_16, vb.)
- ⚠️ Character-edit ve character-remix modları frontend'de kullanılmıyor

### 4. **Video Model Eksiklikleri**

**Runway Gen-3 Alpha:**

- ✅ Backend kod entegrasyonu mevcut
- ❌ Frontend'de kullanıcıya sunulmuyor
- ❌ Video generation router'da entegre değil

**Sora Watermark Remover:**

- ✅ Backend'de tanımlı
- ❌ Frontend'de ayrı bir özellik olarak sunulmuyor

## 💡 Öneriler ve Düzeltmeler

### Öncelik 1: Frontend Model Listesini Güncelle

#### generation.ts içindeki enum'ı güncelle:

```typescript
aiModel: z.enum([
  // Existing
  "qwen",
  "seedream",
  "nano-banana-pro",
  "flux-2-pro",
  "4o-image",
  "flux-kontext-pro",
  "google-imagen4",
  "ideogram-v3",
  "ideogram-character",
  "qwen-image",
  "z-image",
  "grok-imagine",
  "gpt-image-1.5",
  "seedream-edit",
  // Missing
  "flux-1.1-pro",
  "flux-1.1-pro-ultra",
  "recraft-v3",
  "recraft-20b",
  "qwen-image-edit",
  "nano-banana-edit",
]);
```

### Öncelik 2: kieAiApi.ts'de Eksik Fonksiyonları Ekle

Eksik model generation fonksiyonları:

- ✅ `generateFlux2ProImage` - MEVCUT
- ❌ `generateFlux11ProImage` - EKSİK
- ❌ `generateFlux11UltraImage` - EKSİK
- ❌ `generateRecraftV3Image` - EKSİK
- ❌ `generateRecraft20BImage` - EKSİK
- ❌ `generateQwenImageEdit` - EKSİK (sadece text-to-image var)
- ❌ `generateNanoBananaEdit` - EKSİK

### Öncelik 3: Model Mapping Düzelt

`generation.ts` içindeki `getCreditsForResolution` fonksiyonundaki mapping:

```typescript
const kieAiModelMap: Record<string, string> = {
  "flux-2-pro": "flux-2/pro-image-to-image",
  "4o-image": "4o-image",
  "flux-kontext-pro": "flux-kontext-pro",
  "google-imagen4": "google/imagen4-fast",
  "ideogram-v3": "ideogram/v3-reframe",
  "ideogram-character": "ideogram/character",
  "qwen-image": "qwen/text-to-image",
  "z-image": "z-image",
  "grok-imagine": "grok-imagine/text-to-image",
  "gpt-image-1.5": "gpt-image/1.5-text-to-image",
  // EKSİK:
  "flux-1.1-pro": "flux-1.1-pro",
  "flux-1.1-pro-ultra": "flux-1.1-pro-ultra",
  "recraft-v3": "recraft-v3",
  "recraft-20b": "recraft-20b",
  "qwen-image-edit": "qwen/image-edit",
  "nano-banana-edit": "google/nano-banana-edit",
};
```

### Öncelik 4: Video-to-Video Desteği

**Kling 2.6** ve **Wan 2.6** modelleri video-to-video destekliyor:

- Backend'de `videoUrl` parametresi mevcut
- Frontend'de kullanıcıya video upload seçeneği sunulmalı

## 📋 Aksiyon Listesi

### Hemen Yapılması Gerekenler:

1. ✅ Frontend model enum'ını güncelle (generation.ts)
2. ✅ Eksik model generation fonksiyonlarını ekle (kieAiApi.ts)
3. ✅ Frontend'de model selection UI'ını güncelle (Generate.tsx)
4. ✅ Video generation için eksik modelleri entegre et (videoGeneration.ts)

### Orta Vadede Yapılacaklar:

1. Video-to-video upload özelliği ekle
2. Sora Watermark Remover'ı ayrı özellik olarak sun
3. Model-specific parameter UI'ları oluştur
4. Database'deki aiModelConfig tablosunu doldur

### Uzun Vadede Yapılacaklar:

1. Dinamik model loading sistemi oluştur
2. Admin panelinden model enable/disable
3. Model performans metrikleri ve analytics
4. A/B testing için model seçenek grupları

## 🎯 Kullanıcı İhtiyaçları

Kie.ai dökümantasyonuna göre kullanıcılar şunları yapabilmeli:

1. ✅ Text-to-image generation
2. ⚠️ Image-to-image (edit) - Tüm modellerde değil
3. ⚠️ Video-to-video - Frontend'de yok
4. ✅ Image upscaling
5. ✅ Multi-image input (Veo, Nano Banana Pro)
6. ⚠️ Aspect ratio seçimi - Bazı modellerde kısıtlı
7. ⚠️ Quality/Resolution seçimi - Model-specific değil

## 🔗 Referanslar

- Kie.ai API Documentation: https://docs.kie.ai
- Kie.ai Playground: https://kie.ai/playground
- Backend Implementation: `/home/nano-influencer/server/kieAiApi.ts`
- Frontend Implementation: `/home/nano-influencer/server/routers/generation.ts`
