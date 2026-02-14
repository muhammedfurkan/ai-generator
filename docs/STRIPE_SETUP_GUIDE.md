# Stripe Ödeme Entegrasyonu - Kurulum Rehberi

Bu proje artık Stripe ödeme sistemini desteklemektedir. Kullanıcılar kredi paketlerini güvenli bir şekilde Stripe üzerinden satın alabilirler.

## ✅ Yapılanlar

### 1. Backend Entegrasyonu
- ✅ `server/routers/stripe.ts` - Stripe checkout session oluşturma
- ✅ `server/routes/stripeWebhook.ts` - Webhook event handler
- ✅ `drizzle/schema.ts` - `stripeOrders` tablosu eklendi
- ✅ Express app'e webhook route eklendi
- ✅ tRPC router'a Stripe router eklendi

### 2. Frontend Güncellemeleri
- ✅ `/packages` sayfası giriş yapmadan görülebilir hale getirildi
- ✅ Stripe checkout entegrasyonu eklendi
- ✅ Paket satın alma sırasında Shopier veya Stripe seçimi yapılabiliyor

### 3. Database
- ✅ `stripeOrders` tablosu oluşturuldu
- ✅ Migration başarıyla çalıştırıldı

## 📋 Kurulum Adımları

### 1. Stripe Hesabı Oluşturun
1. [Stripe Dashboard](https://dashboard.stripe.com/register) üzerinden hesap oluşturun
2. Test modunda çalışmak için "Test Mode" açık olduğundan emin olun

### 2. API Anahtarlarını Alın
1. [API Keys sayfasına](https://dashboard.stripe.com/test/apikeys) gidin
2. **Secret Key** (sk_test_... ile başlayan) ve **Publishable Key** (pk_test_... ile başlayan) değerlerini kopyalayın

### 3. Webhook Secret Oluşturun
1. [Webhooks sayfasına](https://dashboard.stripe.com/test/webhooks) gidin
2. **Add endpoint** butonuna tıklayın
3. Endpoint URL'ini girin: `https://YOUR_DOMAIN.com/stripe/webhook`
4. **Select events to listen to** kısmından şu event'leri seçin:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. **Add endpoint** butonuna tıklayın
6. Oluşan webhook'un detay sayfasında **Signing secret** (whsec_... ile başlayan) değerini kopyalayın

### 4. Environment Variables Ayarlayın
`.env` dosyanızda aşağıdaki değerleri güncelleyin:

```bash
# Stripe Payment Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

⚠️ **ÖNEMLİ:** 
- Test modunda çalışırken `sk_test_` ve `pk_test_` ile başlayan anahtarları kullanın
- Production'a geçerken `sk_live_` ve `pk_live_` anahtarlarını kullanın

### 5. Uygulamayı Yeniden Başlatın
```bash
pnpm dev  # Development mode
# veya
pnpm start  # Production mode
```

## 🧪 Test Etme

### Test Kartları (Test Modunda)
Stripe test modunda aşağıdaki kart bilgilerini kullanabilirsiniz:

**Başarılı Ödeme:**
- Kart Numarası: `4242 4242 4242 4242`
- CVC: Herhangi 3 rakam (örn: `123`)
- Son Kullanma: Gelecekteki herhangi bir tarih (örn: `12/34`)

**Ödeme Hatası:**
- Kart Numarası: `4000 0000 0000 0002`

**3D Secure Test:**
- Kart Numarası: `4000 0027 6000 3184`

### Test Akışı
1. Tarayıcınızda `/packages` sayfasına gidin
2. Giriş yapmadan paketleri görebileceğinizi doğrulayın
3. Bir pakete tıklayın
4. Giriş sayfasına yönlendirildiğinizi doğrulayın
5. Giriş yapın
6. Tekrar pakete tıklayın
7. Stripe Checkout sayfasına yönlendirildiğinizi doğrulayın
8. Test kartı bilgilerini girin ve ödemeyi tamamlayın
9. Başarılı ödeme sonrası `/packages?success=true&session_id=...` sayfasına yönlendirildiğinizi doğrulayın
10. Profilinizi kontrol edin, kredilerinizin eklendiğini doğrulayın

## 📊 Ödeme Takibi

### Stripe Dashboard
- [Payments](https://dashboard.stripe.com/test/payments) - Tüm ödemeleri görün
- [Events](https://dashboard.stripe.com/test/events) - Webhook event'lerini kontrol edin
- [Logs](https://dashboard.stripe.com/test/logs) - Webhook delivery durumunu görün

### Database
- `stripeOrders` tablosunda tüm Stripe ödemeleri kayıtlıdır
- `creditTransactions` tablosunda kredi işlemleri görülebilir
- `users` tablosunda güncel kredi bakiyeleri bulunur

## 🔄 Webhook Event'leri

Sistem aşağıdaki Stripe event'lerini işler:

1. **checkout.session.completed** - Ödeme tamamlandığında krediler eklenir
2. **checkout.session.async_payment_succeeded** - Async ödemeler için (örn: banka transferi)
3. **checkout.session.async_payment_failed** - Async ödeme başarısız olunca
4. **payment_intent.payment_failed** - Ödeme başarısız olunca
5. **charge.refunded** - İade yapıldığında krediler düşülür

## 🌐 Production'a Geçiş

Production'a geçmek için:

1. Stripe Dashboard'da **Live Mode**'a geçin
2. [Live API Keys](https://dashboard.stripe.com/apikeys) sayfasından live anahtarları alın
3. [Live Webhooks](https://dashboard.stripe.com/webhooks) sayfasından yeni webhook oluşturun
4. `.env` dosyasındaki anahtarları güncelleyin:
   - `sk_test_...` → `sk_live_...`
   - `pk_test_...` → `pk_live_...`
   - `whsec_...` (test) → `whsec_...` (live)
5. `NODE_ENV=production` olduğundan emin olun
6. Uygulamayı yeniden başlatın

## 🔐 Güvenlik

- ✅ Webhook signature verification yapılıyor
- ✅ Tüm ödeme işlemleri Stripe üzerinden gerçekleştiriliyor
- ✅ Hassas bilgiler `.env` dosyasında tutuluyor
- ✅ Secret key'ler asla frontend'e gönderilmiyor

## 🆘 Sorun Giderme

### Webhook çalışmıyor
1. Stripe Dashboard → Webhooks → Events sekmesini kontrol edin
2. Webhook delivery durumunu kontrol edin
3. Server loglarında hata mesajlarını kontrol edin
4. `STRIPE_WEBHOOK_SECRET` doğru olduğundan emin olun

### Krediler eklenmiyor
1. Stripe Dashboard → Events'te `checkout.session.completed` event'ini kontrol edin
2. Database'de `stripeOrders` tablosunu kontrol edin
3. `creditTransactions` tablosunu kontrol edin
4. Server loglarında hata mesajlarını arayın

### Test ödemeleri production'da görünüyor
1. Doğru API anahtarlarını kullandığınızdan emin olun
2. Test ve Live mode karıştırılmamış olmalı
3. Her environment için ayrı webhook endpoint kullanın

## 📝 Notlar

- Shopier entegrasyonu hala çalışmaktadır ve korunmuştur
- Admin panelinden paketlere Shopier URL'si eklenirse, Shopier kullanılır
- Shopier URL'si yoksa, otomatik olarak Stripe checkout kullanılır
- Her iki ödeme sistemi de aynı `creditPackages` tablosunu kullanır

## 🎉 Tebrikler!

Stripe entegrasyonu başarıyla tamamlanmıştır. Artık kullanıcılarınız güvenli bir şekilde kredi paketleri satın alabilir!
