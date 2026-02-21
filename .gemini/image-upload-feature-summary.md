# Görsel Yükleme Özelliği - Qwen ve SeeDream Edit Modelleri

## Yapılan Değişiklikler

### Eklenen Modeller

Aşağıdaki modeller için görsel yükleme (reference image upload) özelliği eklendi:

1. **Qwen Image Edit** (`qwen/image-edit`)
2. **Qwen Image to Image** (`qwen/image-to-image`)
3. **SeeDream 4.5 Edit** (`bytedance/seedream-4.5-edit`)
4. **SeeDream 4.0 Edit** (`bytedance/seedream-v4-edit`)

### Özellikler

#### Görsel Yükleme Limitleri

- **Maksimum Görsel Sayısı**: 3 adet
- **Maksimum Dosya Boyutu**: 20 MB (her görsel için)
- **Desteklenen Formatlar**: JPG, PNG, WebP

#### Kullanıcı Arayüzü

- Bu modeller seçildiğinde, otomatik olarak "Referans Görseller (Gerekli)" bölümü gösterilir
- Kullanıcılar drag-and-drop veya tıklayarak görsel yükleyebilir
- Yüklenen görseller grid formatında önizlenir
- Her görselin üzerinde silme butonu bulunur
- Yüklenen görsel sayısı görsel olarak gösterilir (örn: "2/3")

#### Validasyonlar

- Edit modları için referans görsel zorunludur
- Maksimum 3 görsele izin verilir
- Her görsel 20 MB'ı geçemez
- Limitler aşıldığında kullanıcıya Türkçe hata mesajı gösterilir

### Değiştirilen Dosyalar

#### `/home/nano-influencer/client/src/pages/Generate.tsx`

**Değişiklik 1:** Qwen ve SeeDream edit modelleri için yeni görsel yükleme bölümleri eklendi

- Satır 392-490: SeeDream edit modelleri için bölüm güncellendi
- Satır 442-490: Qwen edit modelleri için yeni bölüm eklendi

**Değişiklik 2:** Diğer modeller için görsel gösterimi güncellendi

- Satır 492-500: `nano-banana-pro`, `seedream-edit`, `seedream`, `bytedance/seedream-v4-edit`, `bytedance/seedream-4.5-edit`, `qwen/image-edit`, `qwen/image-to-image` modelleri hariç tutuldu

**Değişiklik 3:** Advanced Settings bölümü güncellendi

- Satır 615-623: Aynı modeller için generic upload bölümü devre dışı bırakıldı

### Backend Uyumluluğu

Backend'de bu modeller için gerekli API entegrasyonları zaten mevcut:

- `server/kieAiApi.ts` içinde model tanımları var
- `scripts/seed-new-models.sql` içinde veritabanı kayıtları mevcut
- Görsel yükleme ve işleme mekanizması çalışıyor

### Test Edilmesi Gerekenler

1. ✅ Kod derleme hatası yok
2. ⏳ Her bir model seçildiğinde görsel yükleme bölümünün gösterilmesi
3. ⏳ Maksimum 3 görsel yükleme limiti
4. ⏳ 20 MB dosya boyutu validasyonu
5. ⏳ Görsellerin backend'e başarıyla yüklenmesi
6. ⏳ Edit işleminin referans görseller ile çalışması

### Notlar

- Mevcut `nano-banana-pro` için 8 görsel limiti korundu
- `seedream` ve `seedream-edit` modelleri için de görsel yükleme desteği zaten vardı, sadece yeni SeeDream versiyonları eklendi
- Tüm hata mesajları Türkçe
- UI/UX mevcut tasarım dilini takip ediyor
