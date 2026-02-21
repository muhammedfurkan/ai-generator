# Site Ayarları Operasyon Runbook (1:1)

Bu doküman, `client/src/lib/siteSettingTemplates.ts` içindeki tüm site ayarı şablonlarını ürün akışına göre operasyonel hale getirir.

## 1. Amaç

- Admin panelden yapılan ayar değişikliklerinin hangi modülü/sayfayı etkilediğini netleştirmek.
- Değişiklik sonrası zorunlu doğrulama adımlarını standartlaştırmak.
- Hatalı değişikliklerde hızlı geri dönüş (rollback) prosedürü sağlamak.

## 2. Standart Uygulama Akışı

1. Ayarı `Admin > Site Ayarları` veya ilgili modülden değiştir.
2. `Öncelik` seviyesi `critical`/`high` ise canlıya almadan önce staging doğrulaması yap.
3. Bu dokümandaki doğrulama adımlarını tamamla.
4. Sorun varsa rollback adımını hemen uygula.
5. Yapılan değişikliği kısa notla kayıt altına al (değişen key, eski değer, yeni değer, tarih).

## 3. Öncelik Seviyeleri

- `critical`: Erişim, route görünürlüğü, temel web akışı etkilenir. Hata durumunda hemen geri alınmalı.
- `high`: Kullanıcı deneyimi veya gelir/kredi akışı etkilenir. Yayın sonrası hızlı kontrol gerekir.
- `normal`: İçerik/metin/görünüm seviyesinde etki. Planlı kontrol yeterlidir.

## 4. 1:1 Operasyon Matrisi

| Key                           | Modül                                      | Etkilenen Sayfalar                        | Etkilenen Alanlar                        | Minimum Doğrulama                                                   | Rollback                              |
| ----------------------------- | ------------------------------------------ | ----------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------- | ------------------------------------- |
| `site_name`                   | Marka & Kimlik (`/admin/branding`)         | `/`, `/blog`, `/gallery`                  | Header, Footer, SEO title                | Header ve footer'da yeni adı kontrol et                             | Önceki site adını geri yaz            |
| `site_logo_url`               | Marka & Kimlik (`/admin/branding`)         | Tüm sayfalar                              | Desktop/mobil header logo                | Desktop + mobil header görselini kontrol et                         | Önceki logo URL'ini geri yükle        |
| `site_favicon_url`            | Marka & Kimlik (`/admin/branding`)         | Tüm sayfalar                              | Browser tab icon                         | Hard refresh sonrası favicon değişimini kontrol et                  | Önceki favicon URL'ine dön            |
| `site_tagline`                | Marka & Kimlik (`/admin/branding`)         | `/`, `/login`, `/register`                | Marka slogan metinleri                   | Sloganın taşma/bozulma yapmadığını kontrol et                       | Önceki sloganı geri yaz               |
| `site_description`            | Marka & Kimlik (`/admin/branding`)         | `/`, `/blog`, `/gallery`                  | Meta description fallback                | DevTools ile meta description içeriğini doğrula                     | Önceki açıklamayı geri yükle          |
| `web_ui_config`               | Web Kontrol Merkezi (`/admin/web-control`) | `/`, header görünen tüm sayfalar          | Hero, menü sırası, home section, footer  | Home/menü/footer sıralarını desktop+mobil kontrol et                | Son çalışan JSON yedeğini geri kaydet |
| `maintenance_mode_enabled`    | Özellik Yönetimi (`/admin/features`)       | Tüm route'lar                             | Genel erişim kontrolü                    | Admin dışı kullanıcıda bakım ekranını doğrula                       | Değeri `false` yap                    |
| `maintenance_message`         | Özellik Yönetimi (`/admin/features`)       | Maintenance görünümü                      | Bakım ekran metni                        | Bakım ekranında yeni mesajı doğrula                                 | Önceki mesajı geri yaz                |
| `registration_enabled`        | Özellik Yönetimi (`/admin/features`)       | `/register`                               | Kayıt akışı                              | Açık/kapalı durumda register davranışını test et                    | Önceki değere dön (genelde `true`)    |
| `referral_system_enabled`     | Özellik Yönetimi (`/admin/features`)       | Profil/referans alanları                  | Referral kazanım akışı                   | Referral işlemi sonrası kredi akışını kontrol et                    | Önceki değeri geri yaz                |
| `referral_show_on_dashboard`  | Özellik Yönetimi (`/admin/features`)       | `/profile`                                | Dashboard referral kartı                 | Profilde kart görünürlüğünü doğrula                                 | Önceki değere dön                     |
| `image_generation_enabled`    | Özellik Yönetimi (`/admin/features`)       | `/generate`, `/`                          | Generate route, home tool kartları, menü | `/generate` erişimi ve menü görünürlüğünü test et                   | Değeri eski haline al                 |
| `video_generation_enabled`    | Özellik Yönetimi (`/admin/features`)       | `/video-generate`, `/motion-control`, `/` | Video/motion akışı, menü                 | Video route erişimi ve home video bloklarını test et                | Önceki değere dön                     |
| `ai_influencer_enabled`       | Özellik Yönetimi (`/admin/features`)       | `/ai-influencer`, `/`                     | AI influencer route + menü               | Route erişimi ve menü linkini kontrol et                            | Önceki değeri geri yaz                |
| `upscale_enabled`             | Özellik Yönetimi (`/admin/features`)       | `/upscale`, `/`                           | Upscale route + menü                     | Upscale route ve menü görünürlüğünü kontrol et                      | Önceki değere dön                     |
| `audio_generation_enabled`    | Özellik Yönetimi (`/admin/features`)       | `/audio-generate`                         | Audio modülü route + menü                | Audio route erişimi ve link görünürlüğünü doğrula                   | Önceki değeri geri yaz                |
| `music_generation_enabled`    | Özellik Yönetimi (`/admin/features`)       | `/music-generate`                         | Music modülü route + menü                | Music route erişimi ve link görünürlüğünü doğrula                   | Önceki değeri geri yaz                |
| `gallery_enabled`             | Özellik Yönetimi (`/admin/features`)       | `/gallery`, `/`                           | Galeri route, home gallery, bottom nav   | Galeri route ve home gallery görünürlüğünü test et                  | Önceki değere dön                     |
| `blog_enabled`                | Özellik Yönetimi (`/admin/features`)       | `/blog`, `/blog/:slug`                    | Blog route, header/mobile menu, footer   | Blog liste + detay sayfasını ve menü linklerini kontrol et          | Önceki değere dön                     |
| `community_enabled`           | Özellik Yönetimi (`/admin/features`)       | `/community-characters`, `/`              | Community route, home block, bottom nav  | Community route ve nav görünürlüğünü doğrula                        | Önceki değere dön                     |
| `signup_bonus_credits`        | Özellik Yönetimi (`/admin/features`)       | `/register`                               | Kayıt bonus kredi dağıtımı               | Yeni kullanıcı açıp kredi değerini kontrol et                       | Önceki bonus değerini geri yaz        |
| `packages_bonus_message`      | Özellik Yönetimi (`/admin/features`)       | `/packages`                               | Packages bonus görünürlüğü               | Bonus mesajının görünür/gizli olduğunu kontrol et                   | Önceki değeri geri yaz                |
| `packages_bonus_text`         | Özellik Yönetimi (`/admin/features`)       | `/packages`                               | Packages bonus metni                     | Metnin doğru ve taşmasız göründüğünü kontrol et                     | Önceki metni geri yaz                 |
| `packages_validity_message`   | Özellik Yönetimi (`/admin/features`)       | `/packages`                               | Packages validity görünürlüğü            | Validity satır görünürlüğünü kontrol et                             | Önceki değeri geri yaz                |
| `packages_validity_text`      | Özellik Yönetimi (`/admin/features`)       | `/packages`                               | Packages validity metni                  | Geçerlilik metnini UI'da doğrula                                    | Önceki metni geri yaz                 |
| `email_notifications_enabled` | Özellik Yönetimi (`/admin/features`)       | Arka plan bildirim akışları               | Sistem e-posta bildirimleri              | Bildirim tetikleyen bir aksiyon sonrası mail gönderimini kontrol et | Önceki değere dön                     |
| `push_notifications_enabled`  | Özellik Yönetimi (`/admin/features`)       | Notification izin/gönderim akışı          | Web push mekanizması                     | Push izin ve gönderim testini staging'de doğrula                    | Önceki değere dön                     |
| `credit_cost_1k`              | Özellik Yönetimi (`/admin/features`)       | `/generate`, `/video-generate`            | 1K üretim kredi tüketimi                 | 1K üretimde düşen kredi miktarını doğrula                           | Önceki sayısal değeri geri yaz        |
| `credit_cost_2k`              | Özellik Yönetimi (`/admin/features`)       | `/generate`, `/video-generate`            | 2K üretim kredi tüketimi                 | 2K üretimde düşen kredi miktarını doğrula                           | Önceki sayısal değeri geri yaz        |
| `credit_cost_4k`              | Özellik Yönetimi (`/admin/features`)       | `/generate`, `/video-generate`            | 4K üretim kredi tüketimi                 | 4K üretimde düşen kredi miktarını doğrula                           | Önceki sayısal değeri geri yaz        |

## 5. Operasyon Notları

- `web_ui_config` ve feature flag key'leri frontend üzerinde aktif kullanıldığı için değer değişikliği anında kullanıcıya yansır.
- JSON tipindeki ayarlarda (özellikle `web_ui_config`) canlıya almadan önce JSON format doğrulaması yapılmalı.
- `isPublic=true` ayarları client tarafından okunabildiğinden, gizli anahtar/değerler bu alana yazılmamalıdır.

## 6. Kaynaklar

- Şablon kaynağı: `client/src/lib/siteSettingTemplates.ts`
- Site ayarları admin UI: `client/src/pages/admin/AdminSettings.tsx`
- Web kontrol merkezi: `client/src/pages/admin/AdminWebControl.tsx`
- Homepage yönetimi: `client/src/pages/admin/AdminHomepage.tsx`
- Özellik yönetimi: `client/src/pages/admin/AdminFeatures.tsx`
