# Kie.ai Yeni Modeller - Admin Panel'e Eklenecek

## 1. SORA 2 PRO

**Model Key:** `sora-2-pro`
**Model Adı:** Sora 2 Pro
**Tip:** Video
**Provider:** kie_ai
**Açıklama:** OpenAI'ın gelişmiş video üretim modeli. Daha yüksek kalite ve uzun süre desteği (10s/15s/20s).
**Maks Video Süresi:** 20 saniye
**Kredi Maliyeti:** 40-65 (süreye göre)

## 2. SORA 2 PRO STORYBOARD

**Model Key:** `sora-2-pro-storyboard`
**Model Adı:** Sora 2 Pro Storyboard
**Tip:** Video
**Provider:** kie_ai
**Açıklama:** Sora 2 Pro'nun storyboard modu. Çok sahneli video üretimi için optimize edilmiş.
**Kredi Maliyeti:** 80

## 3. KLING 2.1

**Model Key:** `kling-2.1`
**Model Adı:** Kling 2.1
**Tip:** Video
**Provider:** kie_ai
**Açıklama:** Kuaishou'nun AI video modeli v2.1. Text-to-video ve image-to-video desteği.
**Maks Video Süresi:** 10 saniye
**Kredi Maliyeti:** 35-60 (süreye göre)

## 4. KLING 2.5

**Model Key:** `kling-2.5`
**Model Adı:** Kling 2.5  
**Tip:** Video
**Provider:** kie_ai
**Açıklama:** Kuaishou'nun AI video modeli v2.5. Geliştirilmiş kalite ve tutarlılık.
**Maks Video Süresi:** 10 saniye
**Kredi Maliyeti:** 40-70 (süreye göre)

## 5. SEEDANCE 1.0 LITE

**Model Key:** `seedance/1.0-lite`
**Model Adı:** Seedance 1.0 Lite
**Tip:** Video
**Provider:** kie_ai (ByteDance)
**Açıklama:** ByteDance'ın hızlı video üretim modeli. Kısa videolar için optimize edilmiş.
**Maks Video Süresi:** 6 saniye
**Kredi Maliyeti:** 20-35 (süreye göre)

## 6. SEEDANCE 1.0 PRO

**Model Key:** `seedance/1.0-pro`
**Model Adı:** Seedance 1.0 Pro
**Tip:** Video
**Provider:** kie_ai (ByteDance)
**Açıklama:** ByteDance'ın profesyonel video üretim modeli. Daha yüksek kalite.
**Maks Video Süresi:** 6 saniye
**Kredi Maliyeti:** 30-50 (süreye göre)

## 7. SEEDANCE 1.5 PRO

**Model Key:** `seedance/1.5-pro`
**Model Adı:** Seedance 1.5 Pro
**Tip:** Video
**Provider:** kie_ai (ByteDance)
**Açıklama:** ByteDance'ın en gelişmiş video modeli. Sinema kalitesinde video, senkronize ses ve çok dilli diyalog desteği.
**Maks Video Süresi:** 10 saniye
**Kredi Maliyeti:** 55-95 (süreye göre)

## 8. HAILUO 2.3

**Model Key:** `hailuo-2.3`
**Model Adı:** Hailuo 2.3
**Tip:** Video
**Provider:** kie_ai (MiniMax)
**Açıklama:** MiniMax'ın yüksek kaliteli AI video modeli. Text-to-video ve image-to-video desteği.
**Maks Video Süresi:** 6 saniye
**Kredi Maliyeti:** 25

## 9. WAN 2.2

**Model Key:** `wan-2.2`
**Model Adı:** Wan 2.2
**Tip:** Video
**Provider:** kie_ai (Alibaba)
**Açıklama:** Alibaba'nın AI video modeli v2.2. Çok sahneli video üretimi desteği.
**Maks Video Süresi:** 10 saniye
**Kredi Maliyeti:** 30-55 (süreye göre)

## 10. WAN 2.5

**Model Key:** `wan-2.5`
**Model Adı:** Wan 2.5
**Tip:** Video
**Provider:** kie_ai (Alibaba)
**Açıklama:** Alibaba'nın AI video modeli v2.5. Geliştirilmiş görsel kalite.
**Maks Video Süresi:** 10 saniye
**Kredi Maliyeti:** 35-60 (süreye göre)

## 11. WAN 2.6

**Model Key:** `wan-2.6`
**Model Adı:** Wan 2.6
**Tip:** Video
**Provider:** kie_ai (Alibaba)
**Açıklama:** Alibaba'nın en son video modeli. 1080p çoklu çekim ve senkronize ses desteği.
**Maks Video Süresi:** 10 saniye
**Kredi Maliyeti:** 40-70 (süreye göre)

## 12. SORA WATERMARK REMOVER

**Model Key:** `sora-watermark-remover`
**Model Adı:** Sora Watermark Remover
**Tip:** Video (Utility)
**Provider:** kie_ai
**Açıklama:** Sora videolarındaki filigranları kaldırır.
**Kredi Maliyeti:** 20

---

## 🔧 Admin Panel'de Nasıl Ekleyeceğim?

1. `/admin/models` sayfasına gidin
2. "Model Ekle" butonuna tıklayın
3. Yukarıdaki bilgileri her model için doldurun
4. Önemli: `modelKey` değerleri TAM OLARAK yukarıdaki gibi olmalı (API kodu bunlara göre çalışıyor)
5. `provider` değerini `kie_ai` olarak ayarlayın
6. `isActive` true, `isMaintenanceMode` false yapın

## 📝 Örnek Model Ekleme:

**Model Key:** `sora-2-pro`
**Model Adı:** Sora 2 Pro
**Model Tipi:** Video
**Provider:** kie_ai
**Aktif:** ✅
**Bakım Modu:** ❌
**Maks Çözünürlük:** 1920x1080
**Maks Video Süresi:** 20
**Free Günlük Limit:** 2
**Premium Günlük Limit:** 20
**Kredi Maliyeti (override):** 50 (10s için ortalama)
**API Maliyeti:** 0.10 (örnek)
**Öncelik:** 5
**Açıklama:** "OpenAI'ın gelişmiş video üretim modeli. Daha yüksek kalite ve uzun süre desteği."
