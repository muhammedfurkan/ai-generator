# Package ID Hatası Çözümü

## Sorun
`pkg.id` undefined hatası alınıyordu: "Cannot read properties of undefined (reading id)"

## Yapılan Düzeltmeler

### 1. Frontend Güvenlik Kontrolleri (`Packages.tsx`)
- ✅ `handleBuyPackage` fonksiyonuna `pkg?.id` kontrolü eklendi
- ✅ Bonus field için optional chaining (`pkg?.bonus`) eklendi
- ✅ DEFAULT_PACKAGES'e `bonus` field'ı eklendi
- ✅ Debug logging eklendi

### 2. Backend Düzeltmeleri (`settings.ts`)
- ✅ `getPublicPackages` endpoint'ine `bonus` field'ı eklendi
- ✅ Debug logging eklendi
- ✅ Package ID kontrolü eklendi

### 3. Yeni Scriptler

#### a) Package Kontrolü
```bash
pnpm tsx scripts/check-packages.ts
```
Veritabanındaki paketleri kontrol eder.

#### b) Package Seed (Veritabanı Boşsa)
```bash
pnpm tsx scripts/seed-packages.ts
```
4 adet varsayılan paketi veritabanına ekler:
- Başlangıç (300 kredi, 150 TL)
- Standart (750 kredi, 375 TL)  
- Profesyonel (2200 kredi, 1100 TL, %10 bonus) ⭐
- Kurumsal (4000 kredi, 2000 TL, %15 bonus)

## Nasıl Test Edilir

### 1. Development Server'ı Başlat
```bash
pnpm dev
```

### 2. Browser Console'u Aç
`/packages` sayfasına git ve console'da şunları gör:
```
[Settings] Fetched 4 active package(s)
[Packages] Loaded packages: { fromDatabase: true, count: 4, packages: [...] }
```

### 3. Ödeme Testi
- Bir pakete tıkla
- "Kredi Yükle" butonuna tıkla
- Eğer login değilsen, login sayfasına yönlendirileceksin
- Login olduktan sonra Stripe checkout'a yönlendirileceksin

## Olası Sorunlar ve Çözümleri

### Sorun: "No active packages" Hatası
**Çözüm:** Veritabanında aktif paket yok
```bash
pnpm tsx scripts/seed-packages.ts
```

### Sorun: "Package missing ID" Hatası
**Çözüm:** Database schema problemi olabilir
```bash
pnpm db:push
```

### Sorun: Stripe Checkout Çalışmıyor
**Çözüm:** `.env` dosyasını kontrol et:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Field Açıklamaları

| Field | Type | Açıklama |
|-------|------|----------|
| `id` | number | **Zorunlu** - Paket benzersiz ID'si |
| `name` | string | Paket adı |
| `credits` | number | Kredit miktarı |
| `price` | string | Fiyat (TL) |
| `bonus` | number\|null | Bonus yüzdesi (ör: 10 = %10) |
| `isActive` | boolean | Aktif mi? |
| `isHighlighted` | boolean | Vurgulu mu? |
| `usage1k` | number\|null | 1K kalitede kaç görsel |
| `usage2k` | number\|null | 2K kalitede kaç görsel |
| `usage4k` | number\|null | 4K kalitede kaç görsel |

## Debug Modu

Eğer sorun devam ediyorsa, console'da detaylı logları göreceksiniz:
- Backend: `[Settings] ...`
- Frontend: `[Packages] ...`

Her iki tarafta da package ID'leri kontrol edilir ve eksikse uyarı verilir.
