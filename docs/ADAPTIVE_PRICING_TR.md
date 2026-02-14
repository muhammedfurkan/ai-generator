# Stripe Adaptive Pricing - Kullanım Kılavuzu

## 🌍 Adaptive Pricing Nedir?

Stripe Adaptive Pricing, kullanıcıların konumlarına göre otomatik olarak yerel para birimlerinde ödeme yapmalarını sağlar. 150+ ülkede yerel para birimi desteği sunar.

## ✅ Implementasyon Durumu

### Backend (Tamamlandı ✅)
- `server/routers/stripe.ts` içinde `adaptive_pricing: { enabled: true }` mevcut
- Orijinal para birimi ve tutar metadata'da saklanıyor
- Order kayıtları hem TRY hem de converted currency bilgisini içeriyor

### Frontend (Basitleştirilmiş Yaklaşım ✅)
- **Seçilen Strateji**: Otomatik IP-based currency selection
- Currency Selector Element kullanmıyoruz (daha basit UX için)
- Kullanıcıya bilgilendirme banner'ı gösteriliyor
- Stripe Checkout sayfasında otomatik currency conversion

## 🎯 Kullanıcı Deneyimi

1. Kullanıcı **Packages** sayfasını ziyaret eder
2. Fiyatlar **TRY** cinsinden gösterilir (base currency)
3. Mavi bilgi banner'ında şu mesaj görülür:
   - 🇹🇷 TR: "Konumunuza göre otomatik olarak yerel para birimi belirlenir..."
   - 🇬🇧 EN: "Your local currency is automatically determined based on your location..."
4. "Satın Al" butonuna tıklandığında Stripe Checkout'a yönlenir
5. Stripe, kullanıcının IP adresine göre:
   - 🇹🇷 Türkiye → TRY
   - 🇺🇸 USA → USD
   - 🇪🇺 Europe → EUR
   - 🇬🇧 UK → GBP
   - vb. 150+ ülke desteği
6. Kullanıcı kendi para biriminde ödeme yapar

## 📋 Stripe Dashboard Ayarları

### Adım 1: Dashboard'a Giriş
1. https://dashboard.stripe.com/settings/adaptive-pricing adresine gidin
2. **Test Mode** ve **Live Mode** için ayrı ayrı etkinleştirin

### Adım 2: Adaptive Pricing Ayarları
```
☑️ Enable Adaptive Pricing for Checkout
☑️ Automatically detect customer currency
☑️ Show currency selector in Checkout (optional)
```

### Adım 3: Supported Currencies
En yaygın para birimleri:
- ✅ TRY - Turkish Lira (base currency)
- ✅ USD - US Dollar
- ✅ EUR - Euro
- ✅ GBP - British Pound
- ✅ AED - UAE Dirham
- ✅ SAR - Saudi Riyal
- ✅ CAD - Canadian Dollar
- ✅ AUD - Australian Dollar

**Not**: Tüm supported currencies listesi için: https://stripe.com/docs/currencies

## 🔧 Environment Variables

`.env` dosyasına aşağıdakileri ekleyin:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Base URL for redirect URLs
LOCAL_BASE_URL=https://yourdomain.com
```

## 💰 Fiyatlandırma Örneği

### Base Price (TRY)
- Paket: 150 TRY

### Adaptive Pricing Conversion (Örnek)
Stripe, gerçek zamanlı exchange rate kullanır:
- 🇹🇷 Turkey: **150 TRY**
- 🇺🇸 USA: **~$5.00 USD** (güncel kur)
- 🇪🇺 Europe: **~€4.50 EUR** (güncel kur)
- 🇬🇧 UK: **~£3.90 GBP** (güncel kur)

**Not**: Exchange rate 24 saat garantilidir.

## 🧪 Test Etme

### Test Mode'da Deneme

1. **Türkiye'den test**:
   ```bash
   # Normal bağlantı - TRY göreceksiniz
   ```

2. **Farklı ülkelerden test**:
   ```bash
   # VPN ile farklı ülke IP'si kullanın
   # Örnek: USA VPN → USD göreceksiniz
   ```

3. **Test Credit Cards**:
   ```
   # Türkiye
   4000 0056 1000 0004
   
   # USA
   4242 4242 4242 4242
   
   # Euro Zone
   4000 0025 0000 3155
   ```

## 📊 Webhook Events

Adaptive Pricing ile gelen önemli webhook events:

```typescript
checkout.session.completed
{
  ...
  presentment_currency: "usd",  // Kullanıcının ödediği para birimi
  amount_total: 500,            // 5.00 USD (cents)
  metadata: {
    originalCurrency: "TRY",
    originalAmount: "150",
    ...
  }
}
```

## 🚨 Önemli Notlar

### Compliance (Yasal Uyum)
- ✅ AB'de fiyat gösteriminde currency selector zorunlu (Stripe otomatik handle eder)
- ✅ Bazı ülkelerde yerel para birimi gösterimi yasal zorunlu
- ✅ Stripe tüm compliance gereksinimlerini karşılar

### Best Practices
1. ✅ Base currency'yi (TRY) açıkça göster
2. ✅ Otomatik conversion'dan bahset
3. ✅ Final fiyatı Stripe Checkout'ta göster
4. ✅ Order history'de hem base hem presentment currency kaydet

### Limitasyonlar
- ❌ Payment Intents API'de desteklenmez (sadece Checkout Sessions)
- ❌ Subscription fiyatlandırmasında farklı yaklaşım gerekir
- ⚠️ Bazı ödeme methodları belirli currency'lerde çalışmaz

## 🔗 Faydalı Linkler

- [Stripe Adaptive Pricing Docs](https://docs.stripe.com/payments/currencies/localize-prices/adaptive-pricing)
- [Supported Currencies](https://stripe.com/docs/currencies)
- [Checkout Sessions API](https://stripe.com/docs/api/checkout/sessions)
- [Exchange Rates](https://stripe.com/docs/currencies#presentment-currencies)

## 🆘 Sorun Giderme

### "Adaptive Pricing not working"
1. Dashboard'da enable edildi mi kontrol edin
2. `adaptive_pricing: { enabled: true }` backend'de var mı?
3. Test/Live mode'u doğru mu?

### "Currency not changing"
1. IP-based detection IP değişikliği gerektirir (VPN kullanın)
2. Browser cache'i temizleyin
3. Incognito mode'da test edin

### "Webhook failed"
1. Webhook secret doğru mu?
2. presentment_details'i doğru parse ediyor musunuz?
3. Stripe Dashboard > Webhooks > Events log kontrol edin

## 📞 Destek

Sorun yaşarsanız:
1. Stripe Dashboard > Logs kontrol edin
2. Console'da error logları inceleyin
3. `server/routers/stripe.ts` log mesajlarını kontrol edin
