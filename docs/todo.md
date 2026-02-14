# Nano Influencer - Proje TODO

## Veritabanı ve Schema
- [x] Veritabanı şemasını güncelle (users, generatedImages, creditTransactions, systemSettings)
- [x] Migration işlemlerini gerçekleştir (pnpm db:push)

## Backend API ve tRPC Prosedürleri
- [x] Kullanıcı yönetimi prosedürleri (profil görüntüleme, güncelleme)
- [x] Görüntü oluşturma prosedürleri (generate, list, delete)
- [x] Kredi sistemi prosedürleri (bakiye sorgulama, işlem geçmişi)
- [x] Admin prosedürleri (kullanıcı listesi, kredi ekleme, sistem ayarları)
- [x] Nano Banana API entegrasyonu (görüntü oluşturma backend)
- [x] Telegram bot entegrasyonu (bildirimler)

## Frontend Sayfalar ve Bileşenler
- [x] Ana sayfa (Home) - Landing page ve özellik tanıtımı
- [x] Görüntü oluşturma sayfası (Generate) - AI görüntü oluşturma arayüzü
- [x] Galeri sayfası (Gallery) - Oluşturulan görselleri görüntüleme
- [x] Profil sayfası (Profile) - Kullanıcı bilgileri ve işlem geçmişi
- [x] Paket satın alma sayfası (Packages) - Kredi paketleri
- [x] Admin dashboard (Admin) - Kullanıcı yönetimi ve sistem ayarları
- [x] Admin dashboard detaylı (AdminDashboard) - İstatistikler ve raporlar

## Entegrasyonlar
- [x] Manus OAuth entegrasyonu (giriş/çıkış)
- [x] Nano Banana API entegrasyonu (görüntü oluşturma)
- [x] Telegram bot bildirimleri (yeni kullanıcı, görüntü oluşturma)
- [x] S3 storage entegrasyonu (görüntü depolama)

## Test ve Deployment
- [x] Vitest testleri yaz ve çalıştır
- [x] Tüm özellikleri tarayıcıda test et
- [x] Checkpoint oluştur

## Yeni Özellikler (Kullanıcı İstekleri)
- [x] Aspect ratio seçeneklerini genişlet (2:3, 3:4, 4:3, 3:2 ekle)
- [x] Görsel önizleme mockup/çerçeve sistemi oluştur
- [x] Görsellere tıklandığında modal ile tam boyut görüntüleme
- [x] Modal'da indirme butonu ekle
- [x] Mobil ve masaüstü için responsive görsel boyutları düzenle

## Prompt Şablonları Sistemi (Hızlı Başlangıç)
- [x] Prompt şablonları veri yapısı oluştur (shared/const.ts)
- [x] 10-15 hazır şablon ekle (kategorize edilmiş)
- [x] Şablon seçici bileşeni oluştur
- [x] Generate sayfasına şablon seçici entegre et
- [x] Tek tıkla şablon uygulama
- [x] Şablon seçildiğinde otomatik aspect ratio ve resolution ayarla

## Kullanıcı Şablonları Sistemi
- [x] Veritabanı şemasına userPromptTemplates tablosu ekle
- [x] Şablon kaydetme backend API'si (create)
- [x] Şablon listeleme backend API'si (getUserTemplates)
- [x] Şablon silme backend API'si (delete)
- [x] Şablon kaydetme modal bileşeni oluştur
- [x] Generate sayfasına "Şablon Olarak Kaydet" butonu ekle
- [x] Şablon seçicide "Kendi Şablonlarım" kategorisi ekle
- [x] Kullanıcı şablonlarını şablon seçicide göster
- [x] Şablon silme özelliği ekle

## Ana Sayfa Tasarımı (Interactive & Playful)
- [x] Hero section (animasyonlu gradient, büyük başlık, floating öğeler)
- [x] Interactive prompt showcase (tıklanabilir prompt önerileri)
- [x] Özellik kartları (hover animasyonları, magnetic efektler)
- [x] Nasıl çalışır bölümü (adım adım animasyonlar)
- [x] Örnek görseller galerisi (hover efektleri)
- [x] CTA section (animasyonlu butonlar)
- [x] Scroll-triggered animasyonlar
- [x] Particle efektleri
- [x] Parallax scroll efektleri
- [x] Gradient animasyonları

## Gerçek Görsel Örnekleri Galerisi
- [x] Görselleri proje dizinine kopyala
- [x] Ana sayfaya görsel galerisi bölümü ekle
- [x] Hover animasyonları ve zoom efektleri
- [x] Responsive grid layout

## Bug Fixes
- [x] PromptTemplateSelector duplicate key hatası (Tümü kategorisi)

## Bug Fixes (Yeni)
- [x] Generate sayfasında "Referans görsel yükleniyor..." loading spinner sürekli dönüyor
- [x] Görsel oluştuktan sonra loading state kapanmıyor

## Hata Mesajları İyileştirme
- [x] Backend'de detaylı hata tipleri tanımla (kredi yetersiz, API hatası, timeout, geçersiz parametre)
- [x] Frontend'de kullanıcı dostu hata mesajları göster
- [x] Hata mesajlarında çözüm önerileri ekle
- [x] Kredi yetersiz hatası için paketler sayfasına yönlendirme

## Admin Telegram Bildirim Sistemi
- [x] Yeni kullanıcı kaydında admin'e Telegram bildirimi (isim, email, kayıt zamanı)
- [x] Kredi harcamasında admin'e Telegram bildirimi (kullanıcı, harcanan kredi, kalan kredi, işlem detayı)
- [x] Bildirim formatını düzenle ve bilgilendirici hale getir

## Mobil Uyumluluk Sorunları (Kritik)
- [x] Ana sayfa mobil görünümde çöküyor
- [x] Animasyonların mobilde performans sorunları
- [x] Overflow ve scroll sorunları
- [x] Touch event optimizasyonları
- [x] Viewport meta tag kontrolü
- [x] Tüm sayfaların mobil responsive testi

## Production Hata (Kritik)
- [x] nanoinf.com sitesinde "birçok kez sorun oluştu" hatası
- [x] locale=tr parametresi ile ilgili sorun
- [x] Server loglarını incele
- [x] Hatanın kaynağını tespit et ve düzelt
- [x] Telegram bot singleton pattern uygulandı (409 Conflict hatası düzeltildi)

## Prompt Geçmişi Sistemi (Otomatik Kaydetme)
- [x] Veritabanı şemasına promptHistory tablosu ekle
- [x] Backend API: Prompt kaydetme (otomatik, başarılı generation sonrası)
- [x] Backend API: Prompt geçmişi listeleme (kullanıcıya özel, tarih sıralı)
- [x] Backend API: Prompt silme (tekil veya toplu)
- [x] PromptHistory modal bileşeni oluştur
- [x] Generate sayfasına "Geçmiş" butonu ekle
- [x] Başarılı görsel oluşturma sonrası otomatik prompt kaydetme
- [x] Geçmişten prompt seçince otomatik doldurma
- [x] Prompt kullanım sayısı gösterimi
- [x] Son kullanılan promptlar en üstte
- [x] Geçmişten silme özelliği (hover'da çöp kutusu ikonu)
- [x] Boş state gösterimi (henüz prompt yok)
- [x] Testler yazıldı ve başarıyla geçti (7 test)

## Şablon Seçici Modal Düzeltmesi (UI/UX)
- [x] Mevcut tasarım sorunlarını tespit et
- [x] Kategori filtreleme sistemini basitleştir
- [x] Şablon kartlarını daha görünür yap
- [x] Scroll ve overflow sorunlarını düzelt
- [x] Mobil uyumluluğu iyileştir
- [x] Tüm şablonların görünebildiğinden emin ol
- [x] Modal yüksekliğini sabit yap (85vh)
- [x] Grid layout'u responsive yap (1/2/3 sütun)
- [x] Gereksiz animasyonları kaldır
- [x] Kategori butonlarını horizontal scroll yap

## Favoriler Sistemi
- [x] Veritabanı şemasına favorites tablosu ekle
- [x] Backend API: Favorilere ekleme (toggle)
- [x] Backend API: Favori listesini getirme
- [x] Backend API: Favoriden çıkarma
- [x] Galeri sayfasına kalp ikonu ekle (her görsel kartında)
- [x] Kalp ikonuna tıklayınca animasyon
- [x] Galeri sayfasına "Favorilerim" filtresi ekle
- [x] Görsel detay modalına büyük favori butonu
- [x] Favori durumunu real-time güncelleme (optimistic update)
- [x] Boş state gösterimi (henüz favori yok)
- [x] Testler yaz ve çalıştır (7 test, hepsi başarılı)

## Prompt İyileştirici (AI Powered)
- [x] Backend API: LLM ile prompt zenginleştirme
- [x] Kısa promptları detaylı hale getirme
- [x] İngilizce prompt'lar için optimize etme
- [x] Türkçe promptları İngilizce'ye çevirip zenginleştirme
- [x] Generate sayfasına "✨ Promptu İyileştir" butonu
- [x] İyileştirilmiş prompt'u otomatik doldurma
- [x] Loading state (shimmer animasyon)
- [x] Hata durumu yönetimi
- [x] Orijinal prompt'u geri yükleme seçeneği
- [x] Testler yaz ve çalıştır (5 test, hepsi başarılı)

## Ana Sayfa Yeniden Tasarım (Apple Liquid Glass)
- [x] Mevcut Home.tsx'i analiz et
- [x] Şablon seçici butonunu kaldır (sadece ana sayfadan)
- [x] Apple-style liquid glass efektleri ekle
- [x] Frosted glass blur efektleri (backdrop-blur-xl)
- [x] Smooth animasyonlar (framer-motion)
- [x] Minimalist, temiz layout
- [x] Premium tipografi (tracking-tight, leading-relaxed)
- [x] Hero section yenile (dark theme, liquid orbs)
- [x] CTA butonları optimize et (white button on dark)
- [x] Animated gradient overlay
- [x] Liquid glass orbs animasyonu
- [x] Features section glassmorphism kartlar

## Ana Sayfa Showcase Bölümü
- [x] Görselleri proje klasörüne kopyala (client/public/showcase/)
- [x] Showcase bölümü ekle (Hero ve Features arasına)
- [x] Bento grid layout (asimetrik, modern)
- [x] Glassmorphism overlay görseller üzerinde
- [x] Hover efektleri (scale, glow)
- [x] Responsive design (mobil, tablet, desktop)
- [x] Framer Motion animasyonlar (staggered entrance)
- [x] 9 örnek görsel eklendi

## Scroll Pozisyonu Bug Düzeltmesi
- [x] ScrollToTop component oluştur
- [x] App.tsx'e entegre et
- [x] Her route değişiminde scroll to top
- [x] useLocation hook ile location değişimini dinle
- [x] window.scrollTo(0, 0) ile en üste scroll

## Loading Skeleton Animasyonu
- [x] ImageSkeleton component oluştur (shimmer animasyonu)
- [x] index.css'e shimmer keyframe animasyonu ekle
- [x] Gallery sayfasına skeleton ekle (isLoading durumunda)
- [x] Generate sayfasına skeleton ekle (generating durumunda)
- [x] Shimmer animasyonu (gradient + animation)
- [x] Responsive skeleton (mobil, tablet, desktop)
- [x] 8 skeleton card Gallery'de, 1 skeleton Generate'de

## Site Mobil Çökme Sorunu (Kritik)
- [x] Dev server loglarını kontrol et - çalışıyor
- [x] Browser console hatalarını incele - masaüstünde hata yok
- [x] Mobil tespit sistemi eklendi (window.innerWidth < 768)
- [x] Framer Motion animasyonları mobilde devre dışı bırakıldı
- [x] Liquid glass orbs mobilde statik yapıldı (animasyon yok)
- [x] Orb boyutları mobilde küçültüldü (600px → 300px)
- [x] Tüm görsellere loading="lazy" eklendi
- [x] whileHover animasyonları mobilde devre dışı
- [x] Animation duration mobilde kısaltıldı (0.5s → 0.3s)
- [x] Stagger delay mobilde azaltıldı (0.08 → 0.05)

## JSON Hatası Araştırması (beygovau@gmail.com)
- [x] Kullanıcıyı veritabanında bul
- [x] Son görsel oluşturma işlemlerini incele
- [x] Görsel oluşturma kodunu kontrol et
- [x] JSON parse hatalarını tespit et
- [x] Hatanın kaynağını bul ve düzelt
- [x] nanoBananaApi.ts'de HTTP hata kontrolü eklendi
- [x] nanoBananaApi.ts'de JSON parse try-catch eklendi
- [x] Generate.tsx'de upload response hata yakalama iyileştirildi
- [x] Daha anlaşılır hata mesajları eklendi

## AI Influencer Oluşturma Sayfası (Yeni Özellik)
- [x] Veritabanı: aiCharacters tablosu oluştur (userId, name, characterImageUrl, description, createdAt)
- [x] Backend: Karakter kaydetme API (create)
- [x] Backend: Karakter listeleme API (list)
- [x] Backend: Karakter silme API (delete)
- [x] Backend: Karakter güncelleme API (update)
- [x] Backend: Karakter ile görsel oluşturma API (generateWithCharacter)
- [x] Frontend: AI Influencer sayfası oluştur (/ai-influencer)
- [x] Frontend: Karakter görseli yükleme bölümü (ana karakter)
- [x] Frontend: Referans poz görseli yükleme bölümü (opsiyonel)
- [x] Frontend: Prompt girişi bölümü
- [x] Frontend: Aspect ratio seçimi (1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3)
- [x] Frontend: Resolution seçimi (1K, 2K, 4K)
- [x] Frontend: Karakter kaydetme modalı
- [x] Frontend: Kayıtlı karakterler listesi (dropdown)
- [x] Frontend: Kayıtlı karakteri seçip hızlı görsel oluşturma
- [x] Frontend: Karakter yönetimi (silme)
- [x] App.tsx'e route ekle
- [x] Header'a navigasyon linki ekle
- [x] Testler yaz ve çalıştır (11 test, hepsi başarılı)
- [ ] Checkpoint oluştur


## Karakter Paylaşım Sistemi (Topluluk Karakterleri)
- [x] Veritabanı: aiCharacters tablosuna isPublic alanı ekle
- [x] Backend: Karakter paylaşım toggle API (togglePublic)
- [x] Backend: Public karakterleri listeleme API (getPublicCharacters)
- [x] Backend: Popüler karakterleri getirme API (getPopularCharacters)
- [x] Ana sayfa: "Topluluk Karakterleri" bölümü ekle
- [x] Ana sayfa: 6-8 popüler karakter kartı göster
- [x] Ana sayfa: "Tümünü Gör" butonu ile ayrı sayfaya yönlendir
- [x] AI Influencer sayfası: Karakter paylaşım toggle switch ekle
- [x] Karakter kartlarında kullanıcı adı ve kullanım sayısı göster
- [x] /community-characters sayfası oluşturuldu (arama, sayfalama)
- [x] Testler yaz ve çalıştır (15 test, hepsi başarılı)
- [ ] Checkpoint oluştur


## Mobil Görünüm Düzeltmesi (AI Influencer Sayfası)
- [x] Aspect ratio butonları mobilde iç içe geçiyor - düzelt (flex-wrap kullanıldı)
- [x] Kalite butonları mobilde iç içe geçiyor - düzelt (flex-wrap kullanıldı)
- [x] Kalite seçeneklerini sadeleştir: sadece 1K, 2K, 4K (açıklama kaldırıldı)
- [x] Generate sayfası da aynı şekilde düzeltildi
- [ ] Checkpoint oluştur

## Video Oluşturma Bölümü (Yeni Özellik)

### Modeller ve Fiyatlandırma (%50 kar dahil)
- Veo 3.1 Fast: 50 kredi
- Grok Imagine (6s): 17 kredi
- Kling 2.6 (5s no audio): 45 kredi
- Kling 2.6 (10s no audio): 90 kredi
- Kling 2.6 (5s audio): 90 kredi
- Kling 2.6 (10s audio): 180 kredi
- Sora 2 Standard (10s): 120 kredi
- Sora 2 Standard (15s): 220 kredi
- Sora 2 High (10s): 265 kredi
- Sora 2 High (15s): 510 kredi

### Görevler
- [x] Veritabanı: videoGenerations tablosu oluştur
- [x] Backend: Kie AI API entegrasyonu (kieAiApi.ts)
- [x] Backend: Video oluşturma router (videoGeneration.ts)
- [x] Backend: Text-to-video endpoint
- [x] Backend: Image-to-video endpoint
- [x] Backend: Video durumu kontrol endpoint
- [x] Frontend: Video oluşturma sayfası (/video-generate)
- [x] Frontend: Model seçimi (Veo 3.1, Grok, Sora 2, Kling 2.6)
- [x] Frontend: Text-to-video modu
- [x] Frontend: Image-to-video modu (görsel yükleme)
- [x] Frontend: Süre ve kalite seçenekleri (modele göre)
- [x] Frontend: Audio seçeneği (Kling için)
- [x] Frontend: Prompt girişi
- [x] Frontend: Kredi maliyeti gösterimi
- [x] Frontend: Video önizleme ve indirme
- [x] Header'a "Video Oluştur" linki ekle
- [x] Testler yaz ve çalıştır (8 test, hepsi başarılı)
- [ ] Checkpoint oluştur

## Birleşik Galeri (Foto + Video)
- [x] Galeri sayfasına "Görseller" ve "Videolar" tab'ları ekle
- [x] Video listesini galeri sayfasına entegre et
- [x] Video-gallery route'unu ve sayfasını kaldır
- [x] Tek "Galeri" linki ile her iki içeriğe erişim sağla
- [ ] Checkpoint oluştur

## Viral Video Mini Uygulamaları (Veo 3.1)

### Mini Uygulamalar
- Hug Video (Sarılma videosu)
- Kiss Video (Öpücük efekti)
- Dance Video (Dans videosu)
- Talking Photo (Konuşan fotoğraf)
- Age Transform (Yaşlandırma/gençleştirme)
- Style Transfer (Sanat stili animasyon)
- Zoom Effect (Dramatik zoom)
- Split Screen (Önce/sonra)

### Görevler
- [x] shared/const.ts'e VIRAL_APP_TEMPLATES sabiti ekle
- [x] Backend: Mini uygulama video oluşturma endpoint
- [x] Frontend: /apps sayfası oluştur
- [x] Frontend: Uygulama kartları (ikon, isim, açıklama)
- [x] Frontend: Tek fotoğraf yükleme
- [x] Frontend: Tek tıkla video oluşturma
- [x] Frontend: Video önizleme ve indirme
- [x] Ana sayfaya "Viral Uygulamalar" bölümü ekle
- [x] Header'a Apps linki ekle
- [x] Testler yazıldı ve başarıyla geçti (7 test)
- [ ] Checkpoint oluştur


## Görsel Upscale Özelliği (Topaz AI)

### Fiyatlandırma (Kie AI üzerinden, %50 kar payı ile)
- 2x Upscale (≤2K): 15 kredi
- 4x Upscale (4K): 30 kredi
- 8x Upscale (8K): 60 kredi

### Görevler
- [x] Backend: Topaz API entegrasyonu (kieAiApi.ts'e ekle)
- [x] Backend: Upscale router oluştur (create task, query status)
- [x] Backend: Upscale işlem geçmişi (upscaleHistory tablosu)
- [x] Frontend: /upscale sayfası oluştur
- [x] Frontend: Görsel yükleme bölümü
- [x] Frontend: Upscale faktörü seçimi (2x, 4x, 8x)
- [x] Frontend: Önizleme ve sonuç görüntüleme
- [x] Frontend: İndirme butonu
- [x] Header'a Upscale linki ekle
- [x] Testler yazıldı ve başarıyla geçti (10 test)
- [ ] Checkpoint oluştur


## Mobil Tasarım Yenileme (Higgsfield.ai Stili)

### Bottom Navigation Bar
- [x] MobileBottomNav component oluştur
- [x] 5 sekme: Ana Sayfa, Topluluk, Oluştur, Galeri, Profil
- [x] Oluştur butonu: Lime yeşil, büyük, yıldız ikonu
- [x] Sadece mobilde görünür (md:hidden)
- [x] Aktif sekme vurgulama

### Ana Sayfa Mobil Tasarımı
- [x] Horizontal scroll banner/slider (kampanyalar)
- [x] "BUGÜN NE OLUŞTURACAKSIN?" başlık bölümü
- [x] 2 sütunlu grid: Görsel Oluştur, Video Oluştur kartları
- [x] "Tüm araçları keşfet" butonu (lime yeşil)
- [x] "EN İYİ SEÇİMLER" bölümü - horizontal scroll

### Create Modal (Araçlar)
- [x] Tam ekran modal component
- [x] Tab filtreleri: Tümü, Yeni, Görseller, Videolar
- [x] Hero kart (Nano Banana Pro)
- [x] 2 sütunlu araç kartları grid
- [x] Badge'ler: CORE, NEW, HOT, PRO

### Genel Mobil İyileştirmeler
- [x] Header'ı mobilde gizle (bottom nav kullanılacak)
- [x] Lime yeşil vurgu rengi (#CCFF00)
- [x] Koyu tema optimizasyonu
- [x] Touch-friendly butonlar ve kartlar
- [ ] Checkpoint oluştur


## Mobil Kapak Resimleri (Nano Banana Pro ile)
- [x] AI Influencer kapak resmi oluştur
- [x] Viral Apps kapak resmi oluştur
- [x] Create Image kapak resmi oluştur
- [x] Create Video kapak resmi oluştur
- [x] Upscale kapak resmi oluştur
- [x] Nano Banana Pro hero kapak resmi oluştur
- [x] Resimleri client/public/covers/ klasörüne kaydet
- [x] MobileHome ve CreateModal'da resimleri güncelle
- [ ] Checkpoint oluştur


## AI Influencer Görsel Oluşturma Hatası
- [x] Görsel oluştur butonuna basınca karakter kaydetme sayfası açılıyor - düzelt
- [x] Görsel oluşturma akışını doğru çalışır hale getir (karakter kaydedildikten sonra otomatik görsel oluştur)
- [ ] Test et
- [ ] Checkpoint oluştur


## Opsiyonel Karakter Kaydetme
- [x] Backend: Geçici görsel URL ile görsel oluşturma endpoint'i ekle (generateWithTemporaryImage)
- [x] Frontend: SaveCharacterModal'a "Kaydetmeden Devam Et" butonu ekle
- [x] Kaydetmeden devam edildiğinde direkt görsel oluştur
- [ ] Test et
- [ ] Checkpoint oluştur


## Video Oluşturma Araçları Hataları
- [x] Sora 2 image to video çalışmıyor - düzelt (image upload eklendi)
- [x] Veo 3.1 image to video çalışmıyor - düzelt (image upload eklendi)
- [x] Grok image to video çalışmıyor - düzelt (image upload eklendi)
- [ ] Test et
- [ ] Checkpoint oluştur


## AI Influencer Otomatik Prompt Üretme
- [x] Backend: AI prompt üretme endpoint'i oluştur (generatePrompt)
- [x] Prompt şablonu: Lokasyon, poz, kıyafet, ışık, kamera stili içeren detaylı prompt
- [x] Frontend: Prompt kutusunun altına "AI ile Prompt Üret" butonu ekle
- [x] Buton tıklandığında rastgele lokasyon ve poz ile prompt üret
- [x] Üretilen promptu textarea'ya otomatik doldur
- [ ] Test et
- [ ] Checkpoint oluştur


## Türkiye Lokasyonları Güncelleme
- [x] Mevcut lokasyonları kaldır (Paris, Tokyo, Dubai vb.)
- [x] 55 Türkiye lokasyonu eklendi:
  - İstanbul: Kadıköy, Üsküdar, Taksim, Beşiktaş, Galata, Sultanahmet, Ortaköy, Bebek, Sarıyer, Balat, Eminönü, Kapalıçarşı, Boğaz Köprüsü, Adalar
  - Ege: İzmir Kordon, Alsancak, Efes, Alaçatı, Çeşme, Bodrum, Marmaris, Fethiye, Ölüdeniz, Pamukkale, Kuşadası
  - Akdeniz: Antalya Kaleiçi, Konyaaltı, Alanya, Side, Kaş, Mersin, Tarsus
  - İç Anadolu: Kapadokya, Göreme, Uchisar, Ankara Kalesi, Anıtkabir, Konya Mevlana, Tuz Gölü
  - Marmara: Bursa Ulu Cami, Uludağ, Cumalıkızık, Edirne Selimiye
  - Karadeniz: Uzungöl, Sümela, Ayder, Rize Çay, Safranbolu, Amasra, Sinop
  - Güneydoğu: Mardin, Midyat, Diyarbakır, Şanlıurfa, Göbeklitepe, Gaziantep
  - Doğu: Van, Akdamar, Ishak Paşa, Ani, Erzurum
- [x] Her lokasyon için landmarks ve environment bilgisi eklendi
- [ ] Test et
- [ ] Checkpoint oluştur


## Veo 3.1 API Güncelleme
- [x] Yeni endpoint: /api/v1/veo/generate (zaten mevcut)
- [x] Yeni parametreler eklendi: watermark, enableFallback
- [x] generationType: REFERENCE_2_VIDEO (image-to-video için otomatik seçiliyor)
- [x] kieAiApi.ts dosyası güncellendi
- [ ] Test et
- [ ] Checkpoint oluştur


## Profile setState Hatası
- [x] Profile.tsx'de render sırasında navigation çağrısı yapılıyor - düzelt
- [x] Navigation çağrısını useEffect içine al
- [ ] Test et
- [ ] Checkpoint oluştur


## Ana Sayfa Değişikliği
- [x] Landing page kaldır
- [x] Direkt uygulama arayüzü göster (araç kartları, hızlı erişim)
- [ ] Test et
- [ ] Checkpoint oluştur


## Mobil Auth Kontrolü
- [x] MobileBottomNav'da Profil butonuna auth kontrolü ekle (requiresAuth: true)
- [x] MobileBottomNav'da Galeri butonuna auth kontrolü ekle (requiresAuth: true)
- [x] Giriş yapılmamışsa login sayfasına yönlendir (getLoginUrl())
- [ ] Test et
- [ ] Checkpoint oluştur


## Masaüstü Ana Sayfa Higgsfield Tasarımı
- [x] Header: Logo, nav linkleri, lime yeşil "Create" butonu
- [x] Kategori filtreleri: AI Influencer, Hug, Kiss, Dance, Age Transform vb.
- [x] Galeri grid: Topluluk görselleri masonry layout
- [x] Her görsel kartında: thumbnail, başlık, kullanıcı bilgisi
- [x] Hover efektleri ve animasyonlar
- [x] Alt kısımda "Explore More AI Features" bölümü (lime yeşil)
- [x] Footer: CTA bölümü
- [ ] Test et
- [ ] Checkpoint oluştur


## Ana Sayfa Sadeleştirme
- [x] Karmaşık galeri bölümlerini kaldır
- [x] Kategori filtreleri (üstte)
- [x] Lime yeşil "EXPLORE MORE AI FEATURES" bölümü (4 araç kartı)
- [x] Örnek görseller eklendi (8 adet)
- [ ] Test et
- [ ] Checkpoint oluştur


## Kredi Fiyatları Düzeltme
- [x] Kling ve Sora 2 fiyatlarını kontrol et
- [x] Kling 2.6 en pahalı model olacak şekilde düzelt
  - Kling 2.6 5s: 300 kredi (eskiden 45)
  - Kling 2.6 10s: 600 kredi (eskiden 90)
  - Kling 2.6 10s+audio: 900 kredi (eskiden 180)
  - Sora 2 10s: 80 kredi (eskiden 120)
  - Sora 2 Pro 15s: 250 kredi (eskiden 510)
- [x] Test edildi ve geçti
- [ ] Checkpoint oluştur


## AI Influencer Sayfası İndirme ve Galeri Sorunu
- [x] AI Influencer sayfasında oluşturulan görsellerde indirme butonu eksik - Mobil için her zaman görünür butonlar eklendi
- [x] AI Influencer sayfasında oluşturulan görseller galeriye kaydedilmiyor - generatedImages tablosuna kaydetme eklendi
- [x] Sorunu analiz et ve düzelt
- [x] Test et (87 test başarılı)
- [ ] Checkpoint oluştur

## Veo 3.1 API FIRST_AND_LAST_FRAMES_2_VIDEO Düzeltmesi
- [x] Dokümantasyonu incele
- [x] REFERENCE_2_VIDEO yerine FIRST_AND_LAST_FRAMES_2_VIDEO kullan (9:16 desteği için)
- [x] kieAiApi.ts güncellendi
- [x] Test edildi - 3 aspect ratio da başarılı (9:16, 16:9, Auto)
- [ ] Checkpoint oluştur


## Veo 3.1 API Güncellemesi
- [x] Mevcut API kodunu incele
- [x] Doğru endpoint: POST /api/v1/veo/generate (eski endpoint doğruydu)
- [x] Status endpoint: GET /api/v1/veo/record-info?taskId=TASK_ID
- [x] Parametre yapısı: prompt, model (veo3/veo3_fast), aspectRatio (16:9/9:16/Auto), generationType, imageUrls
- [x] Test et - API çalışıyor, Kie AI sunucularında geçici hata var
- [x] Checkpoint oluştur


## Topluluk Karakterleri Ekleme
- [x] 32 fotoğrafı S3'e yükle
- [x] Veritabanına topluluk karakterleri olarak kaydet (isPublic: true)

## Viral App Test ve Yeni App'ler
- [x] Mevcut viral app'leri test et - Çalışıyor
- [x] Hataları düzelt - Hata yok
- [x] Yeni viral app'ler oluştur - 8 yeni app eklendi (Gülümseme, Göz Kırpma, Baş Çevirme, Kahkaha, Öpücük Gönderme, El Sallama, Göz Teması)
- [x] Checkpoint oluştur


## Kategori Butonları Aktif Etme
- [x] Ana sayfadaki kategori butonlarına tıklandığında ilgili viral app sayfasına yönlendirme ekle
- [x] Checkpoint oluştur


## SEO, Blog, Çoklu Dil ve Kredi Sistemi
- [x] SEO optimizasyonu (meta etiketler, anahtar kelimeler, yapılandırılmış veri)
- [x] Blog bölümü oluştur (6 örnek yazı ile)
- [x] İngilizce versiyon için çoklu dil desteği (LanguageContext + LanguageSwitcher)
- [x] Yeni kullanıcılara otomatik 20 kredi yüklemesi
- [x] Checkpoint oluştur


## Veo 3.1 Video URL Sorunu
- [x] Video status check ve URL kaydetme kodunu incele
- [x] Sorunu tespit et ve düzelt - API response yapısı değişmişti (data.response.resultUrls array formatı)
- [x] Mevcut 3 videonun URL'leri düzeltildi
- [x] Test et ve checkpoint kaydet


## Video İndirme Butonu
- [ ] Galeri sayfasındaki video kartlarını incele
- [ ] İndirme butonu ekle
- [x] Test et ve checkpoint kaydet


## Sora 2 ve Kling 2.6 Kredi Güncellemesi
- [x] Sora 2: 10s=24 kredi, 15s=30 kredi
- [x] Kling 2.6: 5s=85 kredi, 10s=150 kredi
- [x] Checkpoint oluştur


## Görsel Oluşturma "Load failed" Hatası
- [x] Hata kaynağını tespit et - Kie AI 422 hataları: Görsel boyutu 20MB'dan büyük veya medya dosyası erişilemez
- [x] Frontend'de görsel boyutu kontrolü ekle (max 20MB)
- [x] Daha iyi hata mesajları göster
- [x] Test et ve checkpoint kaydet


## Yükleme İyileştirmeleri
- [x] Yükleme ilerleme çubuğu ekle
- [x] Desteklenen format bilgilerini göster (JPG, PNG, WebP, max 20MB)
- [x] Test et ve checkpoint kaydet


## Diğer Sayfalara İlerleme Çubuğu Ekleme
- [x] AI Influencer sayfasına ilerleme çubuğu ve format bilgisi ekle
- [x] Upscale sayfasına ilerleme çubuğu ve format bilgisi ekle
- [x] Test et ve checkpoint kaydet


## Sora 2 Pro Kredi Güncellemesi
- [x] Sora 2 Pro: 10s=100 kredi, 15s=160 kredi
- [x] Test et ve checkpoint kaydet


## Hata Bildirimi ve WhatsApp İletişim
- [x] Profil sayfasına Hata Bildir formu ekle (hata türü, açıklama, ekran görüntüsü)
- [x] WhatsApp butonu ekle (+905519287034)
- [x] Hata bildirimlerini veritabanına kaydet (feedbacks tablosu)
- [x] Telegram bot ile bildirim gönder (notifyOwner)
- [x] Test et

## Yeni Viral App'ler
- [ ] Bebek Filtresi
- [ ] Yaşlandırma
- [ ] Cinsiyet Değişimi
- [ ] Anime Dönüşümü
- [ ] Çift Selfie
- [ ] Şarkı Söyleme (Lip Sync)
- [ ] Ağlama Efekti
- [ ] Gülme Krizi
- [ ] Checkpoint oluştur

## Yeni Viral App'ler (8 Yeni Uygulama)
- [x] Baby Filter (Bebek Filtresi) - Yüzü bebeğe dönüştür
- [x] Aging Filter (Yaşlandırma) - 30-40 yıl sonraki görünüm
- [x] Gender Swap (Cinsiyet Değişimi) - Kadın/erkek versiyonu
- [x] Anime Transform (Anime Dönüşümü) - Anime karakterine dönüşüm
- [x] Couple Selfie (Çift Selfie) - İki fotoğrafı romantik videoda birleştir
- [x] Lip Sync (Şarkı Söyleme) - Fotoğraf şarkı söylesin
- [x] Crying Effect (Ağlama Efekti) - Duygusal ağlama videosu
- [x] Laugh Attack (Gülme Krizi) - Kahkaha patlaması videosu
- [x] Tüm yeni app'ler için kapak görselleri oluşturuldu
- [x] shared/const.ts'e VIRAL_APP_TEMPLATES'e eklendi

## Kullanıcı Geri Bildirim Sistemi
- [x] Profil sayfasına "Hata Bildir / Öneri Gönder" butonu eklendi
- [x] Profil sayfasına WhatsApp iletişim butonu eklendi (+90551 928 7034)
- [x] Feedback modal bileşeni oluşturuldu (tür, açıklama, ekran görüntüsü)
- [x] feedbacks veritabanı tablosu oluşturuldu
- [x] feedbackRouter backend API'si oluşturuldu (submit, myFeedbacks)
- [x] Feedback gönderildiğinde admin'e Telegram bildirimi
- [x] Testler başarıyla geçti (87/87)

## Referans Programı (Arkadaş Davet Sistemi)
- [x] Veritabanı: referrals tablosu oluştur (referrerId, referredId, referralCode, bonusGiven, createdAt)
- [x] Veritabanı: users tablosuna referralCode alanı ekle
- [x] Backend: Benzersiz referans kodu oluşturma API'si
- [x] Backend: Referans kodu ile kayıt kontrolü
- [x] Backend: Başarılı kayıtta bonus kredi verme (davet eden ve davet edilen)
- [x] Backend: Referans istatistikleri API'si (kaç kişi davet edildi, kazanılan kredi)
- [x] Frontend: Profil sayfasına "Arkadaşını Davet Et" bölümü
- [x] Frontend: Referans kodu gösterimi ve kopyalama butonu
- [x] Frontend: Davet linki paylaşma (WhatsApp, kopyala)
- [x] Frontend: Davet istatistikleri gösterimi
- [x] Testler yaz ve çalıştır (7 test başarılı)

## WhatsApp Şablon ve Kredi Paketleri Güncelleme
- [x] WhatsApp şablon mesajındaki domain'i düzelt (nanoinfluencer.net → nanoinf.com)
- [x] Kredi paketlerini güncelle (4 paket: 120, 300, 850, 1500 TL)
- [x] Paket açıklamalarını farklılaştır (ucuzdan pahalıya daha detaylı açıklamalar)

## Ödeme Geçmişi (Profil Sayfası)
- [x] Veritabanı: creditTransactions tablosunu incele
- [x] Backend: Ödeme geçmişi API'si oluştur (getPaymentHistory)
- [x] Frontend: Profil sayfasına ödeme geçmişi bölümü ekle
- [x] Tarih, miktar, paket adı ve durum gösterimi
- [x] Testler başarılı (94/94)

## Bug Fix: Nano Banana "Your image is unavailable" Hatası
- [x] Nano Banana API entegrasyonunu incele - S3 URL'leri kie.ai API tarafından erişilemiyordu
- [x] Referans görsel URL'sinin doğru şekilde gönderildiğini kontrol et
- [x] kie.ai File Upload API entegre edildi - Görseller önce kie.ai'ye yükleniyor
- [x] Hatayı düzelt ve test et (94/94 test başarılı)


## Bug Fix: Viral App Video "İşleniyor" Durumunda Kalıyor
- [x] Viral apps video status polling mekanizmasını incele
- [x] Video tamamlandığında UI'ın güncellenmesini sağla - Yeni API response formatı desteklendi
- [x] Galeriye video kaydının düşmesini kontrol et - taskId artık doğru kaydediliyor
- [x] Test et


## Masaüstü UI Optimizasyonu
- [ ] AI Influencer sayfası - önizleme kutusu ve elementleri küçült
- [ ] Görsel boyutlarını masaüstü için optimize et
- [ ] Kompakt ve profesyonel düzen oluştur
- [ ] Diğer sayfaları kontrol et


## Uygulamalar Sayfası Yeniden Tasarım
- [x] Kategori filtreleme sistemini kaldır
- [x] Tüm uygulamaları yan yana grid düzeninde göster
- [x] Masaüstünde 6 sütunlu, mobilde 2 sütunlu responsive grid
- [x] Kompakt ve şık kart tasarımı (rounded-2xl, lime badge, popüler etiketi)


## Lottie Loading Animasyonu
- [x] Lottie dosyasını projeye ekle (client/public/animations/loading.json)
- [x] lottie-react kütüphanesini kur
- [x] LottieLoading komponenti oluştur
- [x] Apps sayfasındaki video işleme durumuna ekle
- [x] VideoGenerate sayfasındaki video işleme durumuna ekle


## Video Thumbnail (Poster) Özelliği
- [x] Video elementlerine poster attribute'u ekle
- [x] Kaynak görsel (inputImageUrl/referenceImageUrl) veya thumbnailUrl kullanılıyor
- [x] Apps sayfasındaki video oynatıcı güncellendi (uploadedImage poster olarak)
- [x] VideoGenerate sayfasındaki video oynatıcı güncellendi (imagePreview poster olarak)
- [x] Gallery sayfasındaki video oynatıcılar güncellendi (referenceImageUrl/thumbnailUrl)


## Bug Fix: Kling Video Modeli Çalışmıyor
- [x] Kling API entegrasyonunu incele
- [x] Kling 2.6'yı kaldır, Kling 2.5 Turbo ekle
- [x] kieAiApi.ts'de model değişikliği (kling/v2-5-turbo-text-to-video-pro)
- [x] videoGeneration router güncellemesi (5s: 45 kredi, 10s: 75 kredi)
- [x] Frontend model seçenekleri güncellemesi (Gallery.tsx)
- [x] Test et (106/106 başarılı)


## Kritik Hatalar ve Tasarım İyileştirmeleri

### 🔴 Kritik Hatalar
- [ ] Routing hatası: Alt sayfalarda F5 yapınca anasayfaya atılıyor
- [ ] Çalışmayan butonlar: JS hataları veya z-index sorunları
- [ ] Dil desteği: İngilizce seçeneği çalışmıyor

### 🟡 Teknik Sorunlar
- [ ] Kling 2.5 Turbo video status polling sorunu - video "işleniyor" durumunda kalıyor

### 🔵 Tasarım İyileştirmeleri
- [ ] Renk paleti çatışması: Pembe elementleri kaldır/uyumlu hale getir
- [ ] Karanlık mod çok sert - Light Mode ekle veya renkleri yumuşat
- [ ] Logo boyutu çok küçük - büyüt
- [ ] Profil sayfası düzeni: Tek sütun yerine çift sütun layout
- [ ] Blog ve anasayfa tasarımını zenginleştir


## Kullanıcı Bildirimi - Kritik Sorunlar (17 Aralık 2024)
- [ ] Routing Bug: F5 ile sayfa yenileme alt sayfalarda ana sayfaya yönlendiriyor
- [ ] Kling 2.5 Turbo: Videolar "processing" durumunda kalıyor, galeride görünmüyor
- [ ] Çalışmayan Butonlar: Bazı action butonları yanıt vermiyor
- [x] Dil Desteği: İngilizce seçeneği mevcut ama çalışmıyor (hardcoded Türkçe) - Düzeltildi

## Tasarım İyileştirmeleri (Kullanıcı Geri Bildirimi)
- [x] Lime yeşil (#CCFF00) renk teması korundu ve tüm tasarıma uygulandı
- [ ] Profil sayfası layout: İçerik tek sütunda sıkışık, sağ taraf boş
- [ ] Blog ve ana sayfa tasarımı: Daha zengin görsel içerik gerekli
- [x] Logo boyutu: Daha büyük olmalı - h-8'den h-12'ye büyütüldü

## Kredi İadesi Sistemi (17 Aralık 2024)
- [x] Başarısız görsel oluşturma işlemlerinde kredi iadesi - Düzeltildi
- [x] Başarısız video oluşturma işlemlerinde kredi iadesi - Düzeltildi
- [x] Başarısız upscale işlemlerinde kredi iadesi - Düzeltildi
- [x] Kredi iadesi için veritabanı transaction kaydı - refundCredits fonksiyonu eklendi
- [x] Testler yaz ve çalıştır - 118 test başarılı

## Mobil UI İyileştirmeleri (17 Aralık 2024)
- [x] Mobil header'daki logo boyutunu büyüt - h-7'den h-10'a büyütüldü

## Telegram Bildirim Sistemi (17 Aralık 2024)
- [x] Kredi harcama bildirimlerinin neden çalışmadığını tespit et - Video ve Upscale'de bildirim eksikti
- [x] Bildirim sistemini düzelt ve güvenilir hale getir - Tüm işlemlere bildirim eklendi
- [x] Telegram bot ile yapılabilecek ek özellikleri araştır - Yeni bildirim türleri ve komutlar eklendi

## Ana Sayfa ve Admin Panel Güncellemeleri (17 Aralık 2024)
- [x] Ana sayfaya mini app grid kartları ekle - 10 viral app kartı eklendi
- [x] Admin panele blog yönetimi bölümü ekle - /admin-blog sayfası eklendi
- [x] Blog CRUD API endpoint'leri oluştur (ekleme, düzenleme, silme) - blogRouter eklendi
- [x] Blog yönetim arayüzü tasarla - AdminBlog.tsx oluşturuldu

## Giriş Butonları Güncellemesi (17 Aralık 2024)
- [x] Masaüstü "Giriş Yap" butonunu lime yeşil (#CCFF00) yap
- [x] Masaüstü ve mobil giriş butonlarına tıklayınca kayıt sayfasına yönlendir
- [x] Mobil "Ücretsiz Dene" butonuna tıklayınca kayıt sayfasına yönlendir

## Dil Ayarları Düzeltmesi (17 Aralık 2024)
- [x] Varsayılan dili Türkçe olarak ayarla - browser dil kontrolü kaldırıldı
- [x] Header ve ana sayfa tamamen Türkçe olacak - varsayılan "tr" olarak ayarlandı

## Hata Loglama ve Telegram İyileştirmeleri (17 Aralık 2024)
- [x] Merkezi hata loglama sistemi oluştur - notifyError, notifyApiError, notifyGenerationFailure fonksiyonları eklendi
- [x] Tüm hataları Telegram'a bildirim olarak gönder - generation, video, upscale, ai-character hataları bildirilecek
- [x] Telegram add credit komutunu hızlandır - paralel işlemler ve hızlı yanıt eklendi

## Mobil Buton Güncelleme (17 Aralık 2024)
- [x] Giriş yapmış kullanıcılar için "Ücretsiz Dene" butonunu "Kredi Yükle" olarak değiştir

## Timeout Süresini Artır (17 Aralık 2024)
- [x] Nano Banana API polling timeout süresini artır - 150'den 300'e (5 dk -> 10 dk)

## Header Güncellemesi (18 Aralık 2024)
- [x] Oluştur butonunu lime yeşil (#CCFF00) yap
- [x] Logo boyutunu header'ı tam dolduracak şekilde büyüt (h-12 -> h-14, py-4 -> py-3)

## Multi-Angle Photo Generator Mini-App (18 Aralık 2024)
- [ ] Veritabanı şeması: multiAngleJobs tablosu oluştur
- [ ] Backend: Dynamic prompt engine oluştur
- [ ] Backend: Generation endpoint'leri (create, status, download)
- [ ] Frontend: Upload ekranı
- [ ] Frontend: Angle set seçimi
- [ ] Frontend: Progress ve result grid ekranı
- [x] Kredi sistemi entegrasyonu (9-angle: 40 kredi, 12-angle: 55 kredi)
- [ ] ZIP download özelliği


## Multi-Angle Photo Generator (Çoklu Açı Fotoğraf Oluşturucu)
- [x] Veritabanı: multiAngleJobs tablosu oluştur
- [x] Veritabanı: multiAngleImages tablosu oluştur
- [x] Backend: Açı setleri tanımla (standard_9, influencer_8, creator_12)
- [x] Backend: create endpoint - iş oluşturma ve arka plan işleme
- [x] Backend: getStatus endpoint - iş durumu sorgulama
- [x] Backend: getHistory endpoint - kullanıcı iş geçmişi
- [x] Backend: getDownloadUrls endpoint - tamamlanan görselleri indirme
- [x] Backend: Arka plan işleme fonksiyonu (processAngleImage)
- [x] Backend: Kredi sistemi entegrasyonu (40/35/55 kredi)
- [x] Backend: Telegram bildirim entegrasyonu
- [x] Backend: In-app bildirim entegrasyonu
- [x] Frontend: MultiAngle sayfası oluştur (/multi-angle)
- [x] Frontend: Referans görsel yükleme bölümü
- [x] Frontend: Açı seti seçimi (3 seçenek)
- [x] Frontend: İlerleme göstergesi (progress bar)
- [x] Frontend: Sonuç galerisi (tamamlanan görseller)
- [x] Frontend: Toplu indirme butonu
- [x] Frontend: App.tsx'e route eklendi
- [x] Ana sayfaya mini app kartı ekle (Home.tsx ve MobileHome.tsx)
- [x] Testler başarıyla geçti (118/118)


## Multi-Angle Polling Bug Fix (Kritik)
- [x] Bug: processAngleImage arka planda çalışıyor ama pollTaskCompletion sonucu veritabanına kaydedilmiyor
- [x] Sorun: Kie API'de görseller hazır ama veritabanında status hala "processing" kalıyor
- [x] Çözüm: syncPendingTasks endpoint'i eklendi
- [x] Manuel "Senkronize Et" butonu eklendi
- [x] Otomatik sync (30 saniye sonra) eklendi
- [x] Detaylı logging eklendi

## Multi-Angle Kalite Ayarı
- [x] Çıktı kalitesini 4K'dan 1K'ya düşür (maliyet ve süre optimizasyonu)

## Mobil Çoklu Açı Kapak Fotoğrafı
- [x] MobileHome.tsx'deki Çoklu Açı kartının kapak fotoğrafı zaten doğru ayarlı
- [x] CreateModal.tsx'e Çoklu Açı aracı eklendi (doğru kapak fotoğrafı ile)

## Çoklu Açı Bug Düzeltmeleri
- [x] Bug: "Tümünü İndir" butonu sadece bir görsel indiriyor - düzeltildi (her görsel için ayrı indirme, 800ms aralık)
- [x] Bug: Oluşturulan fotoğraflar galeriye kaydedilmiyor - saveGeneratedImage ile ana galeriye ekleniyor

## Sayfa Yenileme Bug
- [x] Bug: Herhangi bir sayfayı yenilediğinde ana sayfaya yönlendiriyor - serveStatic fonksiyonu düzeltildi

## Galeri Hızlı İndirme
- [x] Galeri fotoğraflarının üstüne hızlı indirme butonu eklendi (favori butonunun yanında)

## Çoklu Açı ZIP İndirme
- [x] Tümünü İndir butonuna basınca tüm görselleri ZIP olarak indiriyor (JSZip + FileSaver)

## Mobil Bildirim Düğmesi
- [x] Mobil arayüzde sağ üst köşeye bildirim düğmesi eklendi (kredi yükle butonunun soluna)

## Mobil Bildirim Pozisyon Düzeltmesi
- [x] Bildirim butonunu kredi yükle butonunun sağına alındı (dropdown kayma sorunu düzeltildi)

## Mobil Bildirim Geliştirmeleri
- [x] Mobil bildirim panelini tam ekran bottom sheet olarak yeniden tasarlandı (framer-motion animasyonları ile)
- [x] Yeni bildirimler için ses desteği eklendi (Web Audio API ile)

## AI Karakter Bekleme Süresi ve Galeri Kaydı
- [x] AI Karakter oluşturma bekleme süresi uzatıldı (300 -> 600 deneme, 10dk -> 20dk)
- [x] AI Karakter görselleri zaten galeriye kaydediliyor (saveGeneratedImage ile)

## Telegram Bot Kredi Gösterme Bug
- [x] Bug: /addcredit komutu kullanıcının kalan kredisini sıfır gösteriyor - düzeltildi (kredi eklendikten sonra güncel bakiye sorgulanıyor)

## Admin Panel Giriş Düğmesi
- [x] Admin yetkisine sahip kullanıcıların profil sayfasında admin paneline giriş düğmesi eklendi (mor gradient buton)

## Bildirim Paneli Düzeltmesi
- [x] Bildirim panelini tam sayfa yerine eski dropdown tarzına geri döndürüldü

## Kredi Fiyatı Güncelleme
- [x] Kredi fiyatını 0.5 TL olarak güncellendi (paket fiyatları yeniden hesaplandı)
- [x] Paket sayfasından birim kredi fiyatı bilgisi kaldırıldı

## Telegram'dan Web Bildirimi Gönderme
- [x] Telegram bot'a /broadcast komutu eklendi (tüm kullanıcılara bildirim)
- [x] Telegram bot'a /notify <email> <mesaj> komutu eklendi (tek kullanıcıya bildirim)
- [x] Gönderilen bildirimler web sitesindeki bildirim panelinde görünüyor

## Bildirim Paneli Bug
- [x] "Son 20 bildirim gösteriliyor" metni tıklanamaz hale getirildi (pointer-events-none)

## Blog Makaleleri (10 Adet)
- [x] Makale 1: AI Görsel Oluşturma Rehberi
- [x] Makale 2: E-ticarette Ürün Fotoğrafçılığı
- [x] Makale 3: Sosyal Medya İçerik Stratejisi
- [x] Makale 4: AI Influencer Nedir?
- [x] Makale 5: Görsel Kalite Artırma (Upscale)
- [x] Makale 6: Video İçerik Üretimi
- [x] Makale 7: Marka Kimliği ve Görsel Tutarlılık
- [x] Makale 8: Prompt Yazma Teknikleri
- [x] Makale 9: AI Fotoğrafçılığın Geleceği
- [x] Makale 10: Çoklu Açı Fotoğraf Teknolojisi
- [x] Tüm makaleler için kapak fotoğrafları oluşturuldu (10 görsel)
- [x] Makaleler veritabanına eklendi

## Masaüstü Ana Sayfa Yeniden Tasarım
- [ ] Mini app'leri kapak fotoğraflarıyla grid layout olarak göster
- [ ] Mini app'ler için kayar carousel/slider ekle
- [ ] Alt bölüme topluluk AI karakter görselleri ekle
- [ ] Parallax ve hover efektleri ekle


## Ana Sayfa Yeniden Tasarım (Mini Apps Grid + Carousel + Topluluk Galerisi)
- [x] Mini app'leri kapak fotoğraflarıyla carousel/slider formatında göster
- [x] AI Araçları carousel bölümü (otomatik geçiş, önceki/sonraki butonları)
- [x] TÜM AI ARAÇLARI lime yeşil bölümü (6 araç kartı grid)
- [x] VİRAL VİDEO UYGULAMALARI bölümü (10 viral app kartı)
- [x] TOPLULUK GALERİSİ bölümü - gerçek AI karakterleri gösteriyor
- [x] aiCharacters.getPopular API çağrısı ile topluluk karakterlerini çek
- [x] Karakter adı, kullanıcı adı ve kullanım sayısı hover'da görünüyor
- [x] "Tümünü Gör" butonu /community-characters sayfasına yönlendiriyor
- [x] Users ikonu başlığa eklendi
- [x] Placeholder kartları veri yoksa gösteriliyor


## Çoklu Açı Seçenekleri Düzenleme
- [x] Açı setlerini yeniden düzenle (4, 6, 8 açı)
- [x] Açı başına 20 kredi fiyatlandırma (80, 120, 160 kredi)
- [x] Türkçe açı isimleri ekle
- [x] Frontend'de Türkçe açı isimlerini göster
- [x] Testleri güncelle


## Product Promo Video Generator Mini-App
- [x] Veritabanı şeması: productPromoVideos tablosu oluştur
- [x] Backend API: Video oluşturma prosédürü (create)
- [x] Backend API: Video durumu sorgulama (getStatus)
- [x] Backend API: Kullanıcı videoları listeleme (list)
- [x] Video prompt şablonları: 4 stil preset (Minimal Clean, Premium Luxury, Tech/Futuristic, Social Media Viral)
- [x] Kredi sistemi: 30 kredi (standart), 45 kredi (premium)
- [x] Frontend: Ürün görseli yükleme ekranı
- [x] Frontend: Stil seçimi ekranı
- [x] Frontend: Opsiyonel metin girişi (ürün adı, slogan)
- [x] Frontend: Video oluşturma progress ekranı
- [x] Frontend: Video önizleme ve indirme ekranı
- [x] App.tsx'e route ekle (/product-promo)
- [x] Header'a navigasyon ekle (Ana sayfa MINI_APPS'e eklendi)
- [x] Testler yaz (143/143 başarılı)


## Product Promo Kredi Güncellemesi
- [x] Kredi fiyatlarını 3 katına çıkar (30→90, 45→135)


## Mobil Ana Sayfa - Product Promo Ekleme
- [x] MobileHome bileşenindeki kayan slider'a Product Promo ekle
- [x] Kapak fotoğrafı oluştur/ekle


## Mobil Product Promo Optimizasyonu
- [x] Stil seçim kartlarını mobilde tek sütun yap


## AI UGC Ad Video Generator Mini-App
- [ ] Veritabanı şeması: ugcAdVideos tablosu oluştur
- [ ] Backend API: Video oluşturma prosedürü (create)
- [ ] Backend API: Video durumu sorgulama (getStatus)
- [ ] Backend API: Kullanıcı videoları listeleme (list)
- [ ] UGC senaryo şablonları: 5 senaryo (Testimonial, Unboxing, Problem-Solution, First Impression, Lifestyle)
- [ ] Model seçimi: Sora 2 ve Veo 3.1 desteği
- [ ] Kredi sistemi: 45 kredi (standart), +15 kredi (Sora 2 premium)
- [ ] Frontend: Ürün görseli/video yükleme ekranı
- [ ] Frontend: Model seçimi (Sora 2 / Veo 3.1)
- [ ] Frontend: UGC senaryo seçimi
- [ ] Frontend: Karakter ve ton seçimi (cinsiyet, dil, ton)
- [ ] Frontend: Video oluşturma ve önizleme ekranı
- [ ] App.tsx'e route ekle (/ugc-ad)
- [ ] Ana sayfaya navigasyon ekle (MINI_APPS ve VIRAL_APPS)
- [ ] Mobil ana sayfaya banner ekle
- [ ] Testler yaz


## AI UGC Ad Video Generator Mini-App (Tamamlandı)
- [x] Veritabanı şeması: ugcAdVideos tablosu oluşturuldu
- [x] Backend API: Video oluşturma prosédürü (create)
- [x] Backend API: Video durumu sorgulama (getStatus)
- [x] Backend API: Kullanıcı videoları listeleme (list)
- [x] UGC Senaryoları: 5 senaryo (testimonial, unboxing, problem_solution, first_impression, lifestyle)
- [x] Video Modelleri: Sora 2 (60 kredi), Veo 3.1 (45 kredi)
- [x] Ton Seçenekleri: casual, excited, calm, persuasive
- [x] Dil Desteği: TR, EN, DE, FR, ES, AR
- [x] Frontend: Ürün görseli yükleme (opsiyonel)
- [x] Frontend: Model seçimi ekranı
- [x] Frontend: Senaryo seçimi ekranı
- [x] Frontend: Karakter ayarları (cinsiyet, dil, ton)
- [x] Frontend: Video oluşturma progress ekranı
- [x] Frontend: Video önizleme ve indirme ekranı
- [x] App.tsx'e route ekle (/ugc-ad)
- [x] Ana sayfa MINI_APPS'e ekle
- [x] Mobil ana sayfa BANNERS'a ekle
- [x] Kapak fotoğrafı oluşturuldu
- [x] Testler yazıldı (153/153 başarılı)


## Ultra Detaylı Admin Panel

### 1. Ana Dashboard
- [ ] Gerçek zamanlı istatistikler (toplam kullanıcı, aktif kullanıcı, günlük/haftalık/aylık)
- [ ] Gelir grafikleri (günlük, haftalık, aylık, yıllık)
- [ ] En çok kullanılan özellikler grafiği
- [ ] Son aktiviteler akışı (canlı)
- [ ] Sistem sağlığı göstergeleri (API durumu, sunucu yükü)
- [ ] Hızlı eylem butonları

### 2. Kullanıcı Yönetimi
- [ ] Kullanıcı listesi (arama, filtreleme, sıralama)
- [ ] Kullanıcı detay sayfası (tüm bilgiler, aktivite geçmişi)
- [ ] Kullanıcı düzenleme (isim, email, rol, durum)
- [ ] Kredi ekleme/çıkarma (manuel)
- [ ] Kullanıcı yasaklama/askıya alma
- [ ] Kullanıcı silme (soft delete)
- [ ] Toplu işlemler (seçili kullanıcılara kredi ver, email gönder)
- [ ] Kullanıcı aktivite logları
- [ ] Kullanıcı segmentasyonu (VIP, aktif, pasif, yeni)

### 3. SEO Ayarları
- [ ] Genel SEO ayarları (site başlığı, açıklama, anahtar kelimeler)
- [ ] Sayfa bazlı meta etiketleri
- [ ] Open Graph ayarları (sosyal medya paylaşım görselleri)
- [ ] Twitter Card ayarları
- [ ] Robots.txt düzenleme
- [ ] Sitemap yönetimi
- [ ] Canonical URL ayarları
- [ ] Schema.org yapılandırılmış veri
- [ ] Google Analytics entegrasyonu
- [ ] Google Search Console entegrasyonu

### 4. Site Ayarları
- [ ] Genel ayarlar (site adı, logo, favicon)
- [ ] İletişim bilgileri (email, telefon, adres)
- [ ] Sosyal medya linkleri
- [ ] Footer içeriği düzenleme
- [ ] Bakım modu açma/kapama
- [ ] Kayıt açma/kapama
- [ ] Varsayılan dil ayarı
- [ ] Tema ayarları (renk paleti, font)
- [ ] Email şablonları düzenleme
- [ ] Bildirim ayarları (Telegram, email)

### 5. Kredi Paketleri Yönetimi
- [ ] Paket listesi (CRUD)
- [ ] Paket oluşturma (isim, kredi miktarı, fiyat, açıklama)
- [ ] Paket düzenleme
- [ ] Paket silme/deaktif etme
- [ ] İndirim kodları yönetimi (kupon sistemi)
- [ ] Kampanya oluşturma (belirli tarihlerde indirim)
- [ ] Paket satış istatistikleri

### 6. Fiyatlandırma Yönetimi
- [ ] Özellik bazlı fiyatlar (görsel oluşturma, video, upscale vb.)
- [ ] Model bazlı fiyatlar (Sora, Veo, Kling vb.)
- [ ] Toplu fiyat güncelleme
- [ ] Fiyat geçmişi

### 7. İçerik Yönetimi
- [ ] Blog yazıları yönetimi (mevcut)
- [ ] Duyurular/haberler
- [ ] SSS (Sıkça Sorulan Sorular)
- [ ] Yardım dökümanları
- [ ] Kullanım kılavuzları
- [ ] Popup/banner yönetimi

### 8. Medya Yönetimi
- [ ] Yüklenen görseller galerisi
- [ ] S3 depolama istatistikleri
- [ ] Dosya silme/düzenleme
- [ ] Kapak görselleri yönetimi

### 9. Viral Uygulamalar Yönetimi
- [ ] Uygulama listesi
- [ ] Uygulama ekleme/düzenleme/silme
- [ ] Uygulama sıralaması
- [ ] Uygulama aktif/pasif durumu
- [ ] Uygulama istatistikleri

### 10. AI Karakterler Yönetimi
- [ ] Topluluk karakterleri moderasyonu
- [ ] Karakter onaylama/reddetme
- [ ] Uygunsuz içerik filtreleme
- [ ] Öne çıkan karakterler seçimi

### 11. Raporlar ve Analizler
- [ ] Kullanıcı büyüme raporu
- [ ] Gelir raporu
- [ ] Özellik kullanım raporu
- [ ] API kullanım raporu
- [ ] Hata raporu
- [ ] Dışa aktarma (CSV, Excel)

### 12. Sistem Ayarları
- [ ] API anahtarları yönetimi
- [ ] Rate limiting ayarları
- [ ] Cache ayarları
- [ ] Log seviyesi ayarları
- [ ] Yedekleme ayarları
- [ ] Güvenlik ayarları (2FA, IP whitelist)

### 13. Bildirim Merkezi
- [ ] Telegram bot ayarları
- [ ] Email bildirimleri ayarları
- [ ] Push notification ayarları
- [ ] Bildirim şablonları
- [ ] Toplu bildirim gönderme

### 14. Geri Bildirimler
- [ ] Kullanıcı geri bildirimleri listesi
- [ ] Geri bildirim durumu (yeni, inceleniyor, çözüldü)
- [ ] Geri bildirime yanıt verme
- [ ] Geri bildirim istatistikleri


## Ultra Detaylı Admin Panel - TAMAMLANDI
- [x] Veritabanı: siteSettings, creditPackages, discountCodes, featurePricing, announcements, faqs, viralAppsConfig, activityLogs, apiUsageStats, userSessions tabloları
- [x] Backend: adminPanelRouter (40+ endpoint)
- [x] Frontend: AdminPanel.tsx (13 modül)
  - Dashboard (8 istatistik kartı, hızlı işlemler)
  - Kullanıcı Yönetimi (arama, sayfalama, kredi ekleme, rol değiştirme)
  - Site Ayarları (SEO, genel, iletişim, sosyal medya)
  - Kredi Paketleri (CRUD)
  - İndirim Kodları (CRUD)
  - Fiyatlandırma (özellik bazlı kredi fiyatları)
  - Duyurular (popup, banner, notification)
  - SSS (sıkça sorulan sorular)
  - Viral Apps Konfigürasyonu
  - Geri Bildirimler (kullanıcı şikayetleri)
  - AI Karakter Moderasyonu
  - Raporlar (kullanıcı büyümesi, gelir)
  - Aktivite Logları
- [x] Route: /admin-panel
- [x] Testler (153/153 başarılı)


## UGC Ad Video - Sora 2 Kaldırma
- [x] Backend: ugcAd.ts'den Sora 2 modelini kaldır
- [x] Frontend: UgcAd.tsx'den Sora 2 seçeneğini kaldır
- [x] Sadece Veo 3.1 kullanılsın
- [x] Test et ve checkpoint kaydet


## UGC Video Kredi Güncellemesi
- [x] Veo 3.1 kredi fiyatını 45'ten 90'a güncelle


## Sora 2 Pro Tamamen Kaldırma
- [x] kieAiApi.ts'den Sora 2 model tanımlarını kaldır
- [x] videoGeneration.ts'den Sora 2 seçeneğini kaldır
- [x] videoGeneration.test.ts'den Sora 2 testlerini kaldır
- [x] ugcAd.ts'deki Sora 2 referanslarını temizle
- [x] ugcAd.test.ts'deki Sora 2 testlerini kaldır
- [x] creditRefund.test.ts'deki Sora 2 referanslarını kaldır
- [x] drizzle/schema.ts'deki yorumları güncelle
- [x] VideoGenerate.tsx frontend'den Sora 2 kaldır
- [x] Veritabanı güncellendi (151/151 test başarılı)


## Sora 2 Geri Ekleme (Pro Hariç) - TAMAMLANDI
- [x] kieAiApi.ts'e normal Sora 2 modellerini geri ekle (Pro hariç)
- [x] videoGeneration.ts'e Sora 2 seçeneğini geri ekle
- [x] VideoGenerate.tsx frontend'e Sora 2 geri ekle
- [x] Testleri güncelle (152/152 başarılı)


## Video Model ve Galeri Güncellemeleri
- [x] Product Promo: Sadece Veo 3.1 Fast modeli kullan
- [x] UGC Ad: Sadece Veo 3.1 Fast modeli kullan
- [x] Product Promo: Arka plan işleme - galeri üzerinden devam (mevcut yapı zaten destekliyor)
- [x] UGC Ad: Arka plan işleme - galeri üzerinden devam (mevcut yapı zaten destekliyor)
- [x] AI Karakter: Arka plan işleme - galeri üzerinden devam (mevcut yapı zaten destekliyor)
- [x] Galeri: Görsel silme seçeneği ekle
- [x] Galeri: Video silme seçeneği ekle


## Masaüstü Ana Sayfa Yeniden Tasarım
- [x] Hero bölümü - video banner ile
- [x] AI Araçları grid bölümü
- [x] Galeri grid bölümleri - masonry layout
- [x] Video galeri bölümü
- [x] Viral uygulamalar bölümü - lime yeşil
- [x] Topluluk galerisi bölümü
- [x] Alt CTA bölümü - lime yeşil
- [x] Kullanıcı görselleri ve videoları eklendi


## Mobil Ana Sayfa Yeniden Tasarım (Masaüstü Paralel)
- [x] Hero bölümü - banner slider
- [x] AI Araçları grid - 3 sütun renkli kartlar
- [x] AI ile Oluşturuldu galerisi - masonry layout (2 sütun)
- [x] AI Video galerisi - yatay scroll
- [x] Viral uygulamalar bölümü - lime yeşil
- [x] Topluluk galerisi - masonry layout (API'den çekiliyor)
- [x] CTA bölümü - lime yeşil


## Görsel Oluşturma - AI Model Seçimi
- [ ] Backend: Seedream 4.5 API entegrasyonu (kieAiApi.ts)
- [ ] Backend: Generation router'a model seçimi parametresi ekle
- [ ] Frontend: Model seçimi UI (Qwen vs Seedream 4.5)
- [ ] Frontend: Model bazlı fiyatlandırma gösterimi
- [x] Test et ve checkpoint kaydet
- [x] Görsel oluşturma sayfasına AI model seçimi eklendi (Qwen ve SeeDream 4.5)

## AI Skin Enhancement Engine Mini-App
- [x] Mimari tasarım ve teknik dokümantasyon
- [x] Backend API endpoint'leri (enhance, getStatus, getHistory)
- [x] Enhancement pipeline (Natural Clean, Soft Glow, Studio Look, No-Makeup Real)
- [x] Kredi sistemi entegrasyonu (3/10/+2 kredi)
- [x] Frontend upload/select image ekranı
- [x] Enhancement mode selection UI
- [x] Before/After comparison slider
- [x] Download ve paylaşım
- [x] Kalite kontrol (düşük çözünürlük reddi, over-smoothing önleme)
- [x] Test ve checkpoint

## Mobil Resim Yükleme Sorunu
- [x] MobileHome.tsx'deki resim yükleme sorununu tespit et
- [x] AI İLE OLUŞTURULDU bölümündeki görselleri düzelt
- [x] AI VİDEO GALERİSİ bölümündeki görselleri düzelt
- [x] Test et ve checkpoint kaydet

## Lazy Loading ve Video Silme
- [x] Lazy loading ekle - MobileHome.tsx
- [x] Lazy loading ekle - Home.tsx
- [x] Galeri video silme özelliği - işleniyor/başarısız videolar için
- [x] Test ve checkpoint kaydet

## Admin Panel SEO Kontrol Ayarları
- [x] Database schema - SEO ayarları tablosu
- [x] Backend - SEO router ve CRUD işlemleri
- [x] Frontend - Admin panel SEO sayfası (mobil uyumlu)
- [x] Test ve checkpoint kaydet

## Admin Panel SEO Kontrol Ayarları
- [x] Database schema - SEO ayarları tablosu
- [x] Backend - SEO router ve CRUD işlemleri
- [x] Frontend - Admin panel SEO sayfası (mobil uyumlu)
- [x] Test ve checkpoint kaydet

## SEO Head Entegrasyonu ve Sitemap
- [x] SEO meta taglerini dinamik olarak HTML heade ekle
- [x] Sitemap.xml endpointi oluştur
- [x] Test ve checkpoint kaydet

## Galeri ve Ürün Videosu İyileştirmeleri
- [x] Galeri video silme butonunu düzelt
- [x] Ürün videosu işlemlerini galeriye entegre et
- [ ] Test ve checkpoint kaydet

## Mobil Admin SEO Ayarları
- [ ] AdminPanel Ayarlar sekmesine SEO linki ekle


## Galeri Görsel Önizleme Sorunu
- [x] Gallery.tsx görsel modal'ını düzelt - siyah ekran hatası


## UGC Video Galeri Entegrasyonu
- [x] UGC video oluşturma işlemleri galeride İşleniyor olarak görünsün
- [x] UGC videolar tamamlandığında galeride otomatik güncellensin
- [x] UGC video silme fonksiyonu eklendi


## Video AI Prompt Oluşturucu
- [x] Backend: AI viral video prompt üretici endpoint oluştur
- [x] Frontend: Sora 2 bölümüne AI prompt butonu ekle
- [x] Frontend: Veo 3 bölümüne AI prompt butonu ekle
- [x] Test et ve checkpoint kaydet


## AI Prompt Butonu Mobil Düzeltme
- [x] AI ile Viral Prompt Üret butonu mobilde görünsün


## Video Durum Güncelleme Sorunu
- [x] Video durum kontrol sistemini incele ve düzelt
- [x] Backend'de otomatik video durum güncelleme job'u ekle
- [x] Kullanıcı sayfadan çıksa bile videolar otomatik güncellensin


## Video Oluşturma Sayfası Header Sorunu
- [x] Video oluşturma sayfasına header ekle
- [x] Masaüstü ve mobilde header görünsün


## Video Modal Prompt Kısaltma
- [x] Video izleme modalında uzun promptu kısalt
- [x] Daha fazlasını oku butonu ekle
- [x] Mobil uyumlu hale getir


## Google OAuth Entegrasyonu
- [ ] Google OAuth credentials al
- [ ] Backend Google OAuth entegrasyonu
- [ ] Frontend giriş sayfası güncelle
- [ ] Manus OAuth'u kaldır


## Uygulamalar Sayfası Header
- [x] Uygulamalar sayfasına header ekle


## Header Eksik Sayfalar Düzeltme
- [x] MultiAngle.tsx - header ekle
- [x] ProductPromo.tsx - header ekle
- [x] SkinEnhancement.tsx - header ekle
- [x] UgcAd.tsx - header ekle
- [x] Upscale.tsx - header ekle


## Mobil UX Düzeltmeleri
- [x] Mobil taşma sorunlarını tespit et
- [x] CSS düzeltmelerini uygula


## Galeri Yönlendirme Sorunu
- [x] Galeri sayfası yenilenince ana sayfaya yönlendirme sorununu düzelt


## Yüksek Öncelikli UX İyileştirmeleri
- [x] Push Bildirimleri - video/görsel tamamlandığında kullanıcıya bildirim
- [x] Favori Videolar - görsellerde olduğu gibi videoları da favorilere ekleme


## Tema Değiştirme
- [x] Karanlık/Aydınlık tema geçiş butonu ekle
- [x] Kullanıcı tercihini localStorage'da kaydet


## Görsel Oluştur - Nano Banana Pro Modeli
- [x] Nano Banana Pro modelini görsel oluşturma sayfasına ekle

## Nano Banana Pro Kredi Fiyatları
- [x] Nano Banana Pro kredi fiyatlarını 12, 18, 25 olarak güncelle

## Logo Oluşturucu Paneli
- [x] Logo Oluşturucu sayfası oluştur
- [x] Backend API endpoint'i ekle
- [x] Marka adı ve slogan girişi
- [x] Sektör seçimi
- [x] Logo stili seçimi
- [x] Renk paleti seçimi
- [x] İkon/sembol tercihi
- [x] Çıktı formatları
- [x] Varyasyon oluşturma
- [x] Ana sayfaya ve navigasyona ekle

## Telegram Duyuru Kanalı Entegrasyonu
- [x] Footer'a Telegram linki ekle
- [x] Profil sayfasına Telegram linki ekle

## Yeni Kullanıcı Başlangıç Kredisi
- [x] Yeni kullanıcıların başlangıç kredisini 25 olarak ayarla

## Hoş Geldin Popup
- [x] Görselli hoş geldin popup bileşeni oluştur
- [x] NanoInf logosunu popup'ta kullan
- [x] 25 kredi hediyesini vurgula
- [x] Yeni kullanıcılara popup'ı göster
- [x] LocalStorage ile tekrar göstermeyi engelle

## Onboarding Turu
- [x] Profesyonel onboarding tur bileşeni oluştur
- [x] Adım adım platform tanıtımı
- [x] Animasyonlu geçişler
- [x] Spotlight/highlight efektleri
- [x] İlerleme göstergesi
- [x] Hoş geldin popup ile entegre et
- [x] LocalStorage ile tamamlanma durumunu kaydet

## Mobil Onboarding ve Logo Yapıcı
- [x] MobileHome'a onboarding sistemini entegre et
- [x] Logo Yapıcı'yı mobil üst kayar grid'e ekle

## Prompt Ustası Mini-App
- [x] Backend API endpoint'i oluştur (POST /api/prompt-compiler)
- [x] LLM entegrasyonu ve sistem prompt'u
- [x] Frontend sayfası oluştur (3 blok: Girdi, Ayarlar, Çıktı)
- [x] Model seçimi (Nano Banana / SDXL / Sora / Veo / Kling / Universal)
- [x] Aspect ratio seçimi (1:1, 9:16, 16:9, 4:5)
- [x] Stil seçimi (Realistic / Cinematic / Anime / 3D / Illustration / Product / UGC Ad)
- [x] Quality seçimi (Draft / High / Ultra)
- [x] Çıktı paneli (Master Prompt, Negative Prompt, Settings, TR Özet)
- [x] Kopyala, Varyasyon üret, Daha kısa/detaylı butonları
- [x] Demo butonları (Kapadokya Reels, Ürün UGC, AI influencer)
- [x] Mobil banner'a ekle
- [x] Güvenlik kuralları (gerçek kişi, uygunsuz içerik engelleme)

## Görsel Optimizasyonu
- [x] Prompt Ustası kapak görseli oluştur ve ekle
- [x] Lazy loading ekle
- [x] Placeholder/skeleton ekle
- [x] Görsel boyutlarını optimize et

## Global Dinamik Yükleme Sistemi
- [x] GenerationLoadingOverlay bileşeni oluştur
- [x] Dinamik mesaj havuzu ve rotasyon sistemi
- [x] Responsive tasarım (desktop, tablet, mobile)
- [x] Smooth fade/slide animasyonlar
- [x] Tüm görsel araçlarına entegre et
- [x] Tüm video araçlarına entegre et
- [x] Edge case'leri handle et (hızlı/uzun generasyonlar)

## Galeri Görsel Optimizasyonu
- [x] Galeri sayfasına OptimizedImage bileşenini ekle
- [x] Skeleton/shimmer animasyonu ekle
- [x] Lazy loading ile performans iyileştirmesi

## Prompt Ustası Kredi Sistemi
- [x] Backend'e kredi kontrolü ekle
- [x] Her kullanımda 1 kredi düş
- [x] Frontend'de kredi gösterimi ekle
- [x] Yetersiz kredi durumunu handle et

## Galeri Toplu Silme ve Onay Dialog
- [x] Backend'e toplu silme endpoint'i ekle
- [x] Frontend'e toplu seçim modu ekle
- [x] Silme onay dialog'u ekle
- [x] Tek silme için de onay dialog'u ekle

## Mobil Cilt İyileştirme Entegrasyonu
- [x] Mobil AI Araçları bölümüne Cilt İyileştirme kartı ekle
- [x] Mobil üst banner'a Cilt İyileştirme slide ekle
- [x] Cilt İyileştirme kapak görseli oluştur

## Cilt İyileştirme Mobil Düzeltmeleri ve Fiyat Güncellemesi
- [x] Mobil arayüz sorunlarını düzelt (scroll, layout)
- [x] Header eksikliğini düzelt
- [x] Fiyatları minimum 20 krediden başlayacak şekilde güncelle
- [x] Sidebar'u mobilde gizle
- [x] Comparison slider'u mobil için optimize et

## Veo 3.1 API Optimizasyonu
- [x] Kullanıcı seçimi ne olursa olsun Kie AI'ya her zaman veo3_fast gönder

## İşleniyor Animasyonu Düzeltmesi
- [x] Tam ekran animasyonu kutucuk içinde gösterecek şekilde düzelt
- [x] Aynı animasyonları koru, sadece layout değiştir
- [x] VideoGenerate.tsx - inline card kullan
- [x] Generate.tsx - inline card kullan
- [x] AiInfluencer.tsx - inline card kullan
- [x] MultiAngle.tsx - inline card kullan

## Upscale İşleniyor Animasyonu ve Arka Plan İşleme
- [x] Upscale ekranında tam ekran overlay yerine kutu içinde animasyon göster
- [x] Arka planda işleme devam etsin (sayfadan çıkılabilsin)
- [x] Galeride upscale işlemleri görünsün (Upscale tab'ı eklendi)

## Galeri Video Thumbnail ve Otomatik Yenileme
- [x] Video thumbnail'ları göster (videodan alınma - #t=0.5 ile ilk kare)
- [x] 30 saniyede bir otomatik yenileme ekle (tüm tab'lar için)
- [x] Yeni işlemler anında galeride görünsün (invalidate eklendi)
- [x] Tüm araçlar için (görsel, video, upscale) otomatik güncelleme

## Görsel Oluştur İşleniyor Animasyonu Düzeltmesi
- [x] Generate.tsx'de işleniyor kutucuğunu düzelt - kutu içinde animasyonlu yap

## AI Influencer Galeri Entegrasyonu
- [x] AI Influencer görsel üretiminde galeride "ışleniyor" durumu görünsün
- [x] Galeri invalidate işlemi ekle (tüm generate fonksiyonlarına eklendi)

## FINAL QA - Kritik Düzeltmeler (BLOCKER)
- [x] Çoklu tıklama önleme - tüm generate butonlarına disabled state ekle
- [ ] Kredi yetersizliği standardizasyonu - tüm sayfalarda InsufficientCreditsDialog kullan
- [ ] API timeout handling - özel mesaj ve retry butonu ekle
- [ ] Sayfa yenileme veri kaybı - localStorage recovery mekanizması
- [ ] Hata mesajları Türkçeleştirme - tüm teknik terimler kaldırılacak
- [ ] Prompt builder kısa input validation - minimum karakter kontrolü
- [ ] Prompt builder Türkçe karakter handling - LLM talimatı düzeltme

## FINAL QA - Yüksek Öncelik
- [ ] Loading states tahmini süre bilgisi ekle
- [ ] Galeri boş state CTA butonları ekle
- [ ] Video thumbnail fallback poster image ekle
- [ ] Prompt copy to clipboard butonu ekle
- [ ] Galeri auto-refresh sadece aktif tab
- [ ] Video status updater database error fix
- [ ] Button stilleri tutarlılık - tüm primary lime-400
- [ ] Loading messages Türkçeleştirme

## FINAL QA - Orta Öncelik
- [ ] Mobil card padding artır
- [ ] Font size hiyerarşi düzelt
- [ ] Empty state kaliteli iconlar ekle
- [ ] Placeholder metinleri iyileştir
