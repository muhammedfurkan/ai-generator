# NanoInf - Kapsamlı AI Platform İnşa Prompt'u

## Proje Genel Bakış

**NanoInf**, kullanıcıların AI ile görsel, video ve karakter oluşturmasını sağlayan profesyonel bir SaaS platformudur. Platform, kredi tabanlı bir ekonomi sistemi ile çalışır ve çoklu AI modeli entegrasyonu sunar.

---

## Teknik Stack

### Frontend

- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui bileşenleri
- **State Management**: tRPC (end-to-end type safety)
- **Routing**: Wouter
- **Animasyon**: Framer Motion
- **Form**: React Hook Form + Zod validation
- **UI Bileşenler**: shadcn/ui (Button, Card, Dialog, Tabs, Select, Input, Textarea, Badge, etc.)

### Backend

- **Framework**: Express 4 + tRPC 11
- **Database**: MySQL/TiDB (Drizzle ORM)
- **Auth**: Manus OAuth
- **File Storage**: AWS S3
- **API Integration**:
  - Nano Banana (Görsel üretimi)
  - Kie AI (Video üretimi - Veo 3.1, Sora 2, Kling, Grok)
  - LLM (Prompt iyileştirme)

### Deployment

- **Platform**: Manus Hosting (built-in)
- **Database**: TiDB Cloud
- **Storage**: S3-compatible storage

---

## Veritabanı Şeması

### users

```sql
- id (PK, auto-increment)
- openId (unique, Manus OAuth ID)
- name, email, loginMethod
- role (enum: user, admin)
- credits (int, default 100)
- referralCode (unique)
- referredBy (FK to users.id)
- createdAt, updatedAt, lastSignedIn
```

### generatedImages

```sql
- id (PK)
- userId (FK)
- prompt, referenceImageUrl, generatedImageUrl
- aspectRatio, resolution, aiModel
- creditsCost, taskId
- status (enum: pending, processing, completed, failed)
- errorMessage, createdAt, completedAt
```

### videoGenerations

```sql
- id (PK)
- userId (FK)
- model (enum: veo3, sora2, kling, grok)
- prompt, imageUrl (for image-to-video)
- aspectRatio, duration, hasAudio, quality
- videoUrl, taskId
- creditsCost, status
- errorMessage, createdAt, completedAt
```

### aiCharacters

```sql
- id (PK)
- userId (FK)
- name, characterImageUrl
- location, aspectRatio, resolution
- isPublic, usageCount
- createdAt, updatedAt
```

### upscaleHistory

```sql
- id (PK)
- userId (FK)
- originalImageUrl, upscaledImageUrl
- scale (2x, 4x, 8x)
- taskId, creditsCost, status
- createdAt, completedAt
```

### creditTransactions

```sql
- id (PK)
- userId (FK)
- type (enum: add, deduct, purchase)
- amount, reason
- balanceBefore, balanceAfter
- createdAt
```

### userPromptTemplates

```sql
- id (PK)
- userId (FK)
- title, description, prompt
- category, aspectRatio, resolution
- createdAt, updatedAt
```

### promptHistory

```sql
- id (PK)
- userId (FK)
- prompt, aspectRatio, resolution
- usageCount, lastUsedAt, createdAt
```

### favorites, videoFavorites

```sql
- id (PK)
- userId (FK)
- imageId/videoId (FK)
- createdAt
```

### viralAppHistory

```sql
- id (PK)
- userId (FK)
- appId, inputImageUrl, outputImageUrl/outputVideoUrl
- parameters (JSON), creditsCost, status
- createdAt
```

### referrals

```sql
- id (PK)
- referrerId (FK)
- referredUserId (FK)
- rewardCredited (boolean)
- createdAt
```

### blogPosts

```sql
- id (PK)
- slug (unique)
- title, excerpt, content
- coverImage, author, tags
- published, publishedAt
- views, createdAt, updatedAt
```

### seoSettings

```sql
- id (PK)
- page (unique)
- title, description, keywords
- ogImage, canonical
- updatedAt
```

---

## Sayfa Yapısı ve Özellikler

### 1. Ana Sayfa (/)

**Desktop Görünüm:**

- Hero section: "Hayal Et, AI Üretsin" başlığı
- CTA butonları: "Hemen Başla", "Araçları Keşfet"
- AI Araçları grid (8 kart):
  - AI Görsel Oluştur (ÖNE ÇIKAN badge)
  - AI Video Oluştur (POPÜLER badge)
  - AI Influencer (YENİ badge)
  - Görsel Upscale
  - Çoklu Açı Fotoğraf (YENİ badge)
  - Ürün Tanıtım Videosu (YENİ badge)
  - Logo Oluşturucu (YENİ badge)
  - Cilt İyileştirme (YENİ badge)
- Showcase gallery (masonry grid)
- Video showcase
- Özellikler bölümü
- Fiyatlandırma önizleme
- Footer

**Mobil Görünüm (MobileHome.tsx):**

- Üst banner slider (4 slide):
  - Ürün Tanıtım Videosu
  - Çoklu Açı Fotoğraf
  - Logo Oluşturucu
  - Cilt İyileştirme
- AI Araçları grid (2 sütun, responsive)
- Viral Uygulamalar bölümü
- Bottom navigation (Ana Sayfa, Topluluk, Oluştur, Galeri, Profil)

### 2. Görsel Oluştur (/generate)

**Özellikler:**

- Model seçimi: Nano Banana Pro (ÖNE ÇIKAN), Qwen, SeeDream 4.5
- Prompt input (Textarea, 5000 karakter limit)
- AI Prompt İyileştirici butonu (1 kredi)
- Referans görsel yükleme (image-to-image için Qwen)
- En-boy oranı seçimi: 1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3
- Çözünürlük seçimi: 1K, 2K, 4K
- Kredi hesaplama (model + çözünürlüğe göre)
- Prompt template selector
- Prompt history modal
- Save template dialog

**Kredi Maliyetleri:**

- Nano Banana Pro: 1K=10kr, 2K=15kr, 4K=20kr
- Qwen: 1K=8kr, 2K=12kr, 4K=16kr
- SeeDream: 1K=6kr, 2K=9kr, 4K=12kr
- Prompt İyileştirici: 1kr

**Sonuç Ekranı:**

- Görsel önizleme
- İndirme butonu
- Favorilere ekle
- Zoom modal
- Yeni görsel oluştur

**Loading State:**

- GenerationLoadingCard (inline, kutucuk içinde)
- Dönen animasyon + değişen mesajlar
- "Model ayarlanıyor", "Piksel piksel sanat işleniyor", vb.

### 3. Video Oluştur (/video-generate)

**Model Seçenekleri:**

- **Veo 3.1**: Hızlı (50kr), Kaliteli (75kr) - 9s, 16:9/9:16/1:1
- **Sora 2**: 10s (100kr), 15s (150kr) - 16:9/9:16/1:1
- **Kling 2.5**: 5s (60kr), 10s (120kr), 5s+ses (70kr), 10s+ses (130kr)
- **Grok**: 10s (80kr) - 16:9/9:16/1:1

**Özellikler:**

- Text-to-Video / Image-to-Video seçimi
- Prompt input
- AI Viral Prompt Üretici (5 kredi)
- Görsel yükleme (image-to-video için)
- En-boy oranı seçimi
- Süre ve kalite seçimi
- Kredi gösterimi

**Sonuç Ekranı:**

- Video player (controls)
- İndirme butonu
- Favorilere ekle
- Yeni video oluştur

**Loading State:**

- GenerationLoadingCard (inline)
- Status polling (her 5 saniyede bir)

### 4. AI Influencer (/ai-influencer)

**Özellikler:**

- Karakter görseli yükleme
- Karakter kaydetme (isim + görsel)
- Kayıtlı karakterler listesi
- Topluluk karakterleri butonu
- Lokasyon seçimi (55 Türkiye lokasyonu):
  - İstanbul: Galata Kulesi, Kız Kulesi, Boğaz Köprüsü, vb.
  - Kapadokya: Balon turu, Peribacaları, vb.
  - Antalya: Kaleiçi, Düden Şelalesi, vb.
  - İzmir: Saat Kulesi, Kordon, vb.
  - ... (toplam 55 lokasyon)
- Prompt input
- En-boy oranı: 1:1, 16:9, 9:16
- Çözünürlük: 1K, 2K, 4K
- Kredi maliyeti: 15-25kr (çözünürlüğe göre)

**Akış:**

1. Karakter görseli yükle/seç
2. Lokasyon seç
3. Prompt gir (opsiyonel)
4. Oluştur

**Sonuç:**

- Karakter + lokasyon birleştirilmiş görsel
- İndirme, favorilere ekle, yeni oluştur

### 5. Upscale (/upscale)

**Özellikler:**

- Görsel yükleme (drag & drop)
- Scale seçimi: 2x (10kr), 4x (15kr), 8x (20kr)
- Yükleme progress bar
- Kredi kontrolü

**Sonuç Ekranı:**

- Before/After comparison slider
- İndirme butonu
- Yeni upscale

**Loading State:**

- GenerationLoadingCard (inline)
- Status polling

### 6. Galeri (/gallery)

**Tab'lar:**

- Görseller
- Videolar
- Upscale

**Özellikler:**

- Grid layout (responsive)
- Favorilere ekleme/çıkarma
- Toplu silme (checkbox selection)
- İndirme
- Zoom modal (görseller için)
- Video player modal (videolar için)
- Boş state (CTA butonları ile)
- Auto-refresh (30 saniyede bir, sadece aktif tab)
- Video thumbnail (#t=0.5 ile ilk kare)

**Durum Gösterimi:**

- İşleniyor: Badge + loading animation
- Tamamlandı: Normal görüntüleme
- Başarısız: Error badge

### 7. Viral Uygulamalar (/apps)

**16+ Uygulama:**

- Sarılma, Öpücük, Dans, Yaş Dönüşümü
- Anime, Konuşan Fotoğraf, Lip Sync, Bebek Filtresi
- Yüz Değiştirme, Ağlama, Gülme, Şaşırma
- Korku, Mutluluk, Üzgünlük, Öfke

**Özellikler:**

- Uygulama seçimi (grid)
- Görsel/video yükleme
- Parametreler (her uygulamaya özel)
- Kredi maliyeti: 5-15kr
- Sonuç: Görsel veya video

### 8. Çoklu Açı Fotoğraf (/multi-angle)

**Özellikler:**

- Görsel yükleme
- Açı seti seçimi:
  - 4 Açı (20kr)
  - 8 Açı (35kr)
- Sonuç: Grid layout ile tüm açılar
- Toplu indirme

### 9. Ürün Tanıtım Videosu (/product-promo)

**Özellikler:**

- Ürün görseli yükleme
- Stil seçimi: Modern, Minimalist, Dinamik, Lüks
- Süre: 5s, 10s, 15s
- Kredi: 40-80kr
- Sonuç: Profesyonel promo video

### 10. UGC Reklam Videosu (/ugc-ad)

**Özellikler:**

- Ürün/içerik görseli yükleme
- Model seçimi: Kadın/Erkek influencer
- Ton: Samimi, Heyecanlı, Bilgilendirici
- Süre: 15s, 30s
- Kredi: 50-100kr
- Sonuç: UGC tarzı reklam videosu

### 11. Logo Oluşturucu (/logo-generator)

**Özellikler:**

- Marka adı input
- Sektör seçimi (20 seçenek): Teknoloji, Sağlık, Eğitim, vb.
- Stil seçimi (12 seçenek): Modern, Minimalist, Vintage, vb.
- Renk paleti (12 seçenek): Mavi tonlar, Kırmızı tonlar, vb.
- Kredi: 15kr
- Sonuç: 4 farklı logo varyasyonu
- Toplu indirme

### 12. Cilt İyileştirme (/skin-enhancement)

**Özellikler:**

- Görsel yükleme
- Mod seçimi:
  - Natural Clean (20kr)
  - Soft Glow (25kr)
  - No-Makeup Real (25kr)
  - Studio Look (30kr)
  - Pro Mod (+5kr ek)
- Sonuç: Before/After comparison slider
- İndirme

### 13. Prompt Derleyici (/prompt-compiler)

**Özellikler:**

- Türkçe input (basit açıklama)
- AI ile İngilizce master prompt üretimi
- Kredi: 1kr
- Copy to clipboard butonu
- Sonuç: Optimize edilmiş İngilizce prompt

**Örnek:**

- Input: "güneşli bir bahçede oynayan sevimli bir kedi"
- Output: "A cute cat playing in a sunny garden, high quality, detailed fur, natural lighting, vibrant colors, photorealistic"

### 14. Profil (/profile)

**Bölümler:**

- Kullanıcı bilgileri (isim, email)
- Kredi bakiyesi (büyük gösterim)
- Kredi geçmişi tablosu (son 50 işlem)
- Referral kodu (paylaşma butonu)
- Referral istatistikleri
- Çıkış yap butonu

### 15. Paketler (/packages)

**Kredi Paketleri:**

- Başlangıç: 150₺ / 300 kredi
- Standart: 375₺ / 750 kredi
- Profesyonel: 1100₺ / 2200 kredi (ÖNE ÇIKAN)
- Kurumsal: 2000₺ / 4000 kredi

**Özellikler:**

- Paket karşılaştırma tablosu
- Satın alma butonu (Manus ödeme sistemi)
- Referral bilgilendirme: "Arkadaş davet et, 50 kredi kazan"

### 16. Blog (/blog, /blog/:slug)

**Özellikler:**

- Blog listesi (grid)
- Kapak görseli, başlık, özet
- Etiketler
- Görüntülenme sayısı
- Yayın tarihi
- Blog detay sayfası (Markdown render)
- İlgili yazılar

### 17. Topluluk Karakterleri (/community-characters)

**Özellikler:**

- Kullanıcıların paylaştığı AI karakterler
- Grid layout
- Karakter görseli + isim
- Kullanım sayısı
- "Kullan" butonu → AI Influencer sayfasına yönlendir

### 18. Admin Panel (/admin-panel)

**Bölümler:**

- Dashboard (istatistikler)
- Kullanıcı yönetimi
- Kredi işlemleri
- Sistem ayarları
- Blog yönetimi
- SEO ayarları

---

## Ortak Bileşenler

### Header.tsx

- Logo (sol üst)
- Navigasyon menüsü: Uygulamalar, Upscale, Video Oluştur, AI Influencer, Galeri, Paketler, Blog, Profil
- Kredi gösterimi (sağ üst, "Kredi Yükle" butonu ile)
- Bildirim ikonu (badge ile sayı)
- Tema değiştirici (dark/light)
- Dil değiştirici (TR/EN)
- Login butonu (giriş yapmamışsa)

### MobileBottomNav.tsx

- 5 tab: Ana Sayfa, Topluluk, Oluştur (merkez, büyük), Galeri, Profil
- Aktif tab vurgusu
- Sticky bottom

### InsufficientCreditsDialog.tsx

- Modal
- Başlık: "Yetersiz Kredi"
- Mesaj: "Bu işlem için X kredi gerekli, mevcut krediniz Y"
- CTA: "Kredi Yükle" butonu → /packages

### GenerationLoadingCard.tsx

- Inline loading animation
- Dönen halka (lime-400 renk)
- Değişen mesajlar:
  - "Model ayarlanıyor, dokunmayın..."
  - "Piksel piksel sanat işleniyor"
  - "Prompt bilmiyorsan, biz düşünüyoruz"
- Alt metin: "NanoInf • Prompt bilmiyorsan, biz düşünüyoruz"
- 3 nokta animasyonu

### ImagePreviewModal.tsx

- Full screen modal
- Görsel zoom
- İndirme butonu
- Kapat butonu (X)

### WelcomePopup.tsx

- İlk giriş yapan kullanıcılar için
- "Hoş geldiniz!" başlığı
- 100 kredi hediye bilgisi
- "Başla" butonu

### ErrorBoundary.tsx

- Hata yakalama
- Kullanıcı dostu hata mesajı
- "Ana Sayfaya Dön" butonu

### ScrollToTop.tsx

- Sayfa değiştiğinde otomatik scroll top

### SeoHead.tsx

- Dynamic meta tags
- OG tags
- Twitter cards
- Canonical URL

---

## Backend API Endpoints (tRPC)

### auth

- `me`: Mevcut kullanıcı bilgisi
- `logout`: Çıkış yap

### generation

- `generate`: Görsel oluştur
- `getHistory`: Görsel geçmişi
- `getCredits`: Kredi bakiyesi
- `getCreditCosts`: Kredi maliyetleri
- `checkStatus`: Görsel durumu kontrol
- `deleteImage`: Görsel sil
- `deleteMultiple`: Çoklu görsel sil

### videoGeneration

- `generate`: Video oluştur
- `list`: Video listesi
- `checkStatus`: Video durumu
- `getPricing`: Video fiyatları
- `generateViralPrompt`: Viral prompt üret (5kr)
- `deleteVideo`: Video sil

### aiCharacters

- `create`: Karakter oluştur
- `list`: Karakterler
- `delete`: Karakter sil
- `generateWithCharacter`: Karakter ile görsel oluştur
- `listCommunity`: Topluluk karakterleri
- `incrementUsage`: Kullanım sayısı artır

### upscale

- `upscale`: Upscale işlemi
- `checkStatus`: Durum kontrol
- `history`: Geçmiş
- `delete`: Sil

### viralApps

- `getApps`: Uygulama listesi
- `process`: Uygulama işle
- `getHistory`: Geçmiş

### multiAngle

- `generate`: Çoklu açı oluştur
- `getHistory`: Geçmiş

### productPromo

- `generate`: Promo video oluştur
- `getOptions`: Seçenekler

### ugcAd

- `generate`: UGC video oluştur
- `getOptions`: Seçenekler

### logo

- `generate`: Logo oluştur
- `getHistory`: Geçmiş

### skinEnhancement

- `enhance`: Cilt iyileştirme
- `getHistory`: Geçmiş
- `getPricing`: Fiyatlar

### promptCompiler

- `compile`: Prompt derle (1kr)

### promptEnhancer

- `enhance`: Prompt iyileştir (1kr)

### favorites

- `add`: Favorilere ekle
- `remove`: Favorilerden çıkar
- `list`: Favori listesi

### userTemplates

- `create`: Template oluştur
- `list`: Template listesi
- `delete`: Template sil

### promptHistory

- `list`: Prompt geçmişi

### user

- `getProfile`: Profil bilgisi
- `updateProfile`: Profil güncelle
- `getCreditHistory`: Kredi geçmişi

### referral

- `getStats`: Referral istatistikleri
- `generateCode`: Kod oluştur

### blog

- `list`: Blog listesi
- `getBySlug`: Blog detay
- `incrementViews`: Görüntülenme artır

### admin

- `getStats`: Dashboard istatistikleri
- `listUsers`: Kullanıcı listesi
- `addCredits`: Kredi ekle
- `updateSettings`: Ayarlar güncelle

### seo

- `get`: SEO ayarları
- `update`: SEO güncelle

---

## Önemli İş Mantığı

### Kredi Sistemi

1. Yeni kullanıcı: 100 kredi hediye
2. Referral: Davet eden ve davet edilen her ikisi de 50 kredi
3. Her işlem öncesi kredi kontrolü
4. Yetersiz kredide InsufficientCreditsDialog göster
5. İşlem başarısızsa kredi iade et
6. Tüm kredi hareketleri creditTransactions tablosuna kaydet

### Görsel/Video Üretim Akışı

1. Kullanıcı formu doldurur
2. Kredi kontrolü
3. Kredi düş (deduct)
4. API'ye istek gönder (Nano Banana / Kie AI)
5. taskId al
6. Database'e kaydet (status: pending)
7. Polling başlat (her 5-10 saniye)
8. Status güncelle (processing → completed/failed)
9. Başarısızsa kredi iade et
10. Galeri'yi invalidate et (otomatik yenileme)

### Çoklu Tıklama Önleme

- Her generate fonksiyonunda `isGenerating/isPending` kontrolü
- Button disabled state
- Mutation pending durumunda return

### Hata Yönetimi

- API timeout: 60 saniye
- Timeout durumunda özel mesaj + retry butonu
- Network error: Kullanıcı dostu mesaj
- Kredi yetersizliği: InsufficientCreditsDialog
- Teknik hata kodları Türkçeleştir (INSUFFICIENT_CREDITS → "Yetersiz kredi")

### Sayfa Yenileme Recovery

- LocalStorage'a geçici kayıt
- Sayfa yüklendiğinde recovery kontrolü
- Yarım kalan işlemleri tamamla veya iptal et

---

## UI/UX Kuralları

### Renk Paleti

- Primary: lime-400 (#a3e635)
- Background: black/dark gray
- Text: white/gray
- Accent: gradient (purple-pink, blue-cyan, rose-orange, vb.)
- Error: red-500
- Success: green-500

### Tipografi

- Font: Inter (sans-serif)
- Başlık: text-4xl, font-bold
- Alt başlık: text-xl, font-semibold
- Body: text-base
- Small: text-sm

### Spacing

- Container: max-w-7xl mx-auto px-4
- Section: py-16
- Card: p-6
- Gap: gap-4, gap-6, gap-8

### Responsive

- Mobile: < 768px (tek sütun, bottom nav)
- Tablet: 768px - 1024px (2 sütun)
- Desktop: > 1024px (3-4 sütun)

### Animasyon

- Framer Motion: fadeIn, slideIn, scale
- Hover: scale-105, brightness-110
- Loading: spin, pulse

### Loading States

- Skeleton: ImageSkeleton bileşeni
- Inline: GenerationLoadingCard
- Button: Loader2 icon + disabled

### Empty States

- Icon + başlık + açıklama
- CTA butonları
- Örnek: "Henüz görsel oluşturmadınız" + "Hemen Oluştur" butonu

### Error States

- Toast notification (sonner)
- Error badge (galeri'de)
- Retry butonu

---

## Dil Desteği

### Türkçe (TR)

- Tüm UI metinleri Türkçe
- Hata mesajları Türkçe
- Loading mesajları Türkçe
- Placeholder metinleri Türkçe

### İngilizce (EN)

- Alternatif dil (LanguageContext ile)
- Tüm metinler TR object'inde tanımlı

---

## Güvenlik

### Auth

- Manus OAuth (openId)
- Session cookie (httpOnly, secure)
- Protected routes (user check)
- Admin routes (role check)

### API

- tRPC context'te user inject
- protectedProcedure: user zorunlu
- adminProcedure: admin role zorunlu
- Input validation (Zod)

### File Upload

- Max size: 10MB (görsel), 50MB (video)
- Allowed types: image/_, video/_
- S3 upload (server-side)
- Unique file names (userId + timestamp + random)

---

## Performans

### Frontend

- Code splitting (React.lazy)
- Image optimization (WebP, lazy load)
- Debounce (search, input)
- Memoization (useMemo, useCallback)

### Backend

- Database indexing (userId, status, createdAt)
- Query optimization (select only needed fields)
- Caching (tRPC query cache)
- Rate limiting (API endpoints)

### API

- Polling interval: 5-10 saniye
- Auto-refresh: 30 saniye (sadece aktif tab)
- Timeout: 60 saniye
- Retry: 3 kez

---

## Test

### Vitest

- Unit tests (server/\*.test.ts)
- Auth tests (logout, me)
- Generation tests (create, status, delete)
- Credit tests (deduct, refund)

### Manual Test Checklist

- Tüm sayfalar mobilde test edildi
- Tüm sayfalar desktop'ta test edildi
- Kredi yetersizliği senaryosu
- API timeout senaryosu
- Çoklu tıklama senaryosu
- Sayfa yenileme senaryosu
- Prompt builder edge cases
- Galeri boş/dolu states
- Video thumbnail'ları

---

## Deployment

### Environment Variables

```
DATABASE_URL=mysql://...
JWT_SECRET=...
VITE_APP_ID=...
OAUTH_SERVER_URL=...
VITE_OAUTH_PORTAL_URL=...
OWNER_OPEN_ID=...
OWNER_NAME=...
BUILT_IN_FORGE_API_URL=...
BUILT_IN_FORGE_API_KEY=...
VITE_FRONTEND_FORGE_API_KEY=...
VITE_FRONTEND_FORGE_API_URL=...
NANO_BANANA_API_KEY=...
KIE_AI_API_KEY=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_ADMIN_CHAT_ID=...
```

### Build

```bash
pnpm install
pnpm db:push
pnpm build
pnpm start
```

### Manus Hosting

- Auto-deploy on push
- Custom domain support
- SSL certificate (auto)
- Analytics (UV/PV)

---

## Özel Özellikler

### Telegram Bot Entegrasyonu

- Video üretim bildirimleri
- Hata bildirimleri
- Admin'e özel mesajlar

### Background Jobs

- Video status updater (30 saniye interval)
- Pending video'ları kontrol et
- Status güncelle (processing → completed/failed)

### Referral Sistemi

- Unique referral code (kullanıcı başına)
- Davet linki paylaşma
- Her başarılı referral: 50 kredi (her iki tarafa)
- Referral istatistikleri (profil sayfasında)

### Analytics

- Manus built-in analytics
- UV/PV tracking
- Dashboard'da gösterim

---

## Prompt Örnekleri

### Görsel Prompt İyileştirici

**Input (Türkçe):** "güneşli bir bahçede oynayan sevimli bir kedi"
**Output (İngilizce):** "A cute cat playing in a sunny garden, high quality, detailed fur, natural lighting, vibrant colors, photorealistic, 4K resolution"

### Viral Video Prompt Üretici

**Input (Türkçe):** "Güneşli bir bahçede oynayan sevimli bir kedi, yüksek kalite"
**Output (İngilizce):**

```
Scene: A sunny backyard garden filled with colorful flowers and green grass.
Subject: An adorable fluffy cat with bright eyes, playfully chasing a butterfly.
Camera: Slow-motion tracking shot, following the cat's movements.
Mood: Joyful, heartwarming, perfect for viral content.
Quality: High-definition, vibrant colors, natural lighting.
Duration: 9 seconds.
```

---

## Kritik Hatalar ve Çözümleri

### Sorun: Çoklu Tıklama

**Çözüm:** Her generate fonksiyonunda `if (isGenerating) return;`

### Sorun: Kredi Yetersizliği Tutarsızlığı

**Çözüm:** Tüm sayfalarda InsufficientCreditsDialog kullan

### Sorun: API Timeout Bilgilendirme

**Çözüm:** Timeout durumunda özel mesaj + retry butonu

### Sorun: Sayfa Yenileme Veri Kaybı

**Çözüm:** LocalStorage recovery mekanizması

### Sorun: Hata Mesajları Teknik Terimler

**Çözüm:** Tüm hata mesajlarını Türkçeleştir, teknik kodları gizle

### Sorun: Video Thumbnail Yükleme

**Çözüm:** `#t=0.5` ile ilk kare + fallback poster image

### Sorun: Galeri Auto-Refresh Performans

**Çözüm:** Sadece aktif tab refetch et

---

## Son Kontrol Listesi

- [ ] Tüm sayfalar responsive
- [ ] Tüm butonlar disabled state'e sahip
- [ ] Tüm hata mesajları Türkçe
- [ ] Tüm loading states bilgilendirici
- [ ] Kredi sistemi tutarlı
- [ ] API timeout handling
- [ ] Çoklu tıklama önleme
- [ ] Sayfa yenileme recovery
- [ ] Galeri auto-refresh optimizasyonu
- [ ] Video thumbnail'ları çalışıyor
- [ ] Empty states CTA butonları var
- [ ] Prompt builder edge cases handle ediliyor
- [ ] UI tutarlılığı sağlandı
- [ ] Mobil bottom nav tüm sayfalarda
- [ ] Header tüm sayfalarda
- [ ] SEO meta tags tüm sayfalarda
- [ ] Analytics tracking aktif
- [ ] Telegram bot bildirimleri çalışıyor
- [ ] Background jobs çalışıyor
- [ ] Referral sistemi çalışıyor
- [ ] Admin panel erişim kontrolü
- [ ] Database indexing yapıldı
- [ ] Vitest testleri yazıldı ve geçti

---

## AI'ya Talimatlar

Bu prompt'u kullanarak NanoInf platformunu sıfırdan oluşturmak için:

1. **Manus web development template** kullan (tRPC + React + Express)
2. Yukarıdaki **database schema**'yı tam olarak uygula
3. Tüm **sayfaları** ve **bileşenleri** belirtilen özelliklere göre oluştur
4. **Backend API endpoints**'leri tRPC ile oluştur
5. **Kredi sistemi** mantığını tam olarak uygula
6. **Görsel/Video üretim akışı**nı polling ile uygula
7. **UI/UX kuralları**na uygun tasarım yap
8. **Hata yönetimi** ve **loading states**'leri ekle
9. **Responsive design** uygula (mobil/tablet/desktop)
10. **Dil desteği** ekle (TR/EN)
11. **Güvenlik** önlemlerini al (auth, validation, file upload)
12. **Performans** optimizasyonları yap
13. **Test** yaz (Vitest)
14. **Deployment** için hazırla

**Önemli:** Tüm özellikler, bileşenler ve iş mantığı bu dokümanda detaylı olarak açıklanmıştır. Eksik veya belirsiz bir nokta varsa, en iyi UX/UI pratiklerine göre karar ver.

---

**Hazırlayan:** Manus AI  
**Tarih:** 21 Aralık 2025  
**Versiyon:** 1.0
