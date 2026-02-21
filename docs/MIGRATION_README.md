# 🔄 TiDB Cloud → Local MySQL Migration Rehberi

## 📋 Genel Bakış

Bu script, TiDB Cloud üzerindeki uzak MySQL veritabanınızdaki tüm verileri güvenli bir şekilde lokal MySQL veritabanınıza taşır.

## ✨ Özellikler

- ✅ **Otomatik Yedekleme**: Migration öncesi mevcut lokal veritabanınızı yedekler
- ✅ **SSL Desteği**: TiDB Cloud için güvenli bağlantı
- ✅ **Hata Kontrolü**: Her adımda hata kontrolü ve detaylı loglama
- ✅ **Rollback Desteği**: Hata durumunda otomatik geri alma
- ✅ **Veri Doğrulama**: Tablo ve satır sayılarını karşılaştırarak doğrulama
- ✅ **Renkli Çıktı**: Anlaşılır ve görsel geri bildirim
- ✅ **Detaylı Rapor**: İşlem sonunda kapsamlı özet rapor

## 📦 Gereksinimler

### 1. MySQL Client Tools Yüklü Olmalı

Script'i çalıştırmadan önce sisteminizde `mysql` ve `mysqldump` komutlarının yüklü olması gerekir.

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install mysql-client
```

**macOS (Homebrew):**

```bash
brew install mysql-client
```

**CentOS/RHEL:**

```bash
sudo yum install mysql
```

### 2. Lokal MySQL Server Çalışıyor Olmalı

```bash
# MySQL durumunu kontrol et
sudo systemctl status mysql

# Çalışmıyorsa başlat
sudo systemctl start mysql
```

### 3. Veritabanı Bağlantı Bilgileri

Script içinde aşağıdaki bilgiler önceden tanımlıdır:

**Uzak Veritabanı (TiDB Cloud):**

- Host: `gateway02.us-east-1.prod.aws.tidbcloud.com`
- Port: `4000`
- User: `3RD81TG4rcgjaLg.bf493ad42272`
- Password: `lril1MrVR9q32wH4Y2am`
- Database: `LKmeEoJsnZn9U4KoySaL4G` (TiDB Cloud otomatik adı)

**Lokal Veritabanı:**

- Host: `localhost`
- Port: `3306`
- User: `root`
- Password: `Aa123456+`
- Database: `nanoinf`

> ⚠️ **Not:** Eğer farklı bilgiler kullanıyorsanız, script dosyasındaki ilgili değişkenleri düzenleyin.

## 🚀 Kullanım

### 1. Script'i Çalıştırın

```bash
cd /home/nano-influencer
./migrate-remote-to-local.sh
```

### 2. İşlem Adımları

Script aşağıdaki adımları otomatik olarak gerçekleştirir:

1. **Ön Kontroller**
   - Gerekli araçların (mysql, mysqldump) varlığını kontrol eder
   - Backup dizinini oluşturur

2. **Bağlantı Testleri**
   - Uzak veritabanına bağlantıyı test eder
   - Lokal veritabanına bağlantıyı test eder

3. **Lokal Yedekleme**
   - Mevcut lokal veritabanını yedekler (varsa)
   - Yedek dosyası: `./backups/local_backup_YYYYMMDD_HHMMSS.sql`

4. **Uzak Dump Alma**
   - TiDB Cloud'dan tüm verileri dump eder
   - Dump dosyası: `./backups/remote_dump_YYYYMMDD_HHMMSS.sql`
   - Bu işlem birkaç dakika sürebilir

5. **Dump Analizi**
   - Dump dosyasındaki tablo ve INSERT sayılarını analiz eder
   - Boş veritabanı uyarısı verir

6. **Lokal Import**
   - Lokal veritabanını temizler ve yeniden oluşturur
   - Dump'ı lokal veritabanına import eder

7. **Veri Doğrulama**
   - Tablo sayılarını karşılaştırır
   - Her tablo için satır sayılarını karşılaştırır
   - Detaylı tablo raporu gösterir

8. **Özet Rapor**
   - Migration istatistiklerini gösterir
   - Sonraki adımları listeler

## 📊 Örnek Çıktı

```
[INFO] 2024-12-23 11:30:00 - Migration işlemi başlatılıyor...
[SUCCESS] 2024-12-23 11:30:01 - Gerekli araçlar kontrol edildi
[INFO] 2024-12-23 11:30:01 - Uzak veritabanı bağlantısı test ediliyor...
[SUCCESS] 2024-12-23 11:30:02 - Uzak veritabanına başarıyla bağlanıldı
[INFO] 2024-12-23 11:30:02 - Lokal veritabanı bağlantısı test ediliyor...
[SUCCESS] 2024-12-23 11:30:03 - Lokal veritabanına başarıyla bağlanıldı
[INFO] 2024-12-23 11:30:03 - Mevcut lokal veritabanı yedekleniyor...
[SUCCESS] 2024-12-23 11:30:05 - Lokal veritabanı yedeği oluşturuldu
[INFO] 2024-12-23 11:30:05 - Uzak veritabanından dump alınıyor...
[SUCCESS] 2024-12-23 11:32:15 - Uzak veritabanı dump'ı başarıyla alındı (Boyut: 24M)
[INFO] 2024-12-23 11:32:15 - Toplam tablo sayısı: 42
[INFO] 2024-12-23 11:32:15 - Toplam INSERT statement sayısı: 1523
[INFO] 2024-12-23 11:32:15 - Lokal veritabanı hazırlanıyor...
[SUCCESS] 2024-12-23 11:32:16 - Lokal veritabanı hazırlandı: nanoinf
[INFO] 2024-12-23 11:32:16 - Dump lokal veritabanına import ediliyor...
[SUCCESS] 2024-12-23 11:33:45 - Dump başarıyla import edildi

═══════════════════════════════════════════════════
TABLO SATIR SAYILARI KARŞILAŞTIRMASI
═══════════════════════════════════════════════════
TABLO ADI                           UZAK            LOKAL           DURUM
───────────────────────────────────────────────────
users                               142             142             ✓
generatedImages                     1523            1523            ✓
creditTransactions                  387             387             ✓
videoGenerations                    89              89              ✓
...
═══════════════════════════════════════════════════

[SUCCESS] Tüm tablolardaki satır sayıları eşleşiyor! ✓

═══════════════════════════════════════════════════
MİGRATION BAŞARIYLA TAMAMLANDI!
═══════════════════════════════════════════════════
```

## 🔍 Veri Doğrulama

Script otomatik olarak şunları kontrol eder:

1. **Tablo Sayısı**: Uzak ve lokal veritabanlarındaki tablo sayılarını karşılaştırır
2. **Satır Sayıları**: Her tablo için satır sayılarını karşılaştırır
3. **Dump İçeriği**: CREATE TABLE ve INSERT statement sayılarını analiz eder

### Manuel Doğrulama

İsterseniz manuel olarak da kontrol edebilirsiniz:

```bash
# Lokal veritabanına bağlan
mysql -u root -p'Aa123456+' nanoinf

# Tabloları listele
SHOW TABLES;

# Örnek bir tablodaki veri sayısını kontrol et
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM generatedImages;

# Çıkış
exit
```

## 📁 Oluşturulan Dosyalar

Migration işlemi sırasında `./backups/` dizini altında şu dosyalar oluşturulur:

```
backups/
├── remote_dump_20241223_113000.sql      # Uzak veritabanı dump'ı
├── local_backup_20241223_113000.sql     # Lokal veritabanı yedeği (varsa)
└── migration_20241223_113000.log        # Detaylı işlem logu
```

### Dosya Boyutları

Veritabanı boyutuna bağlı olarak dump dosyaları büyük olabilir:

- **Küçük DB**: 1-10 MB
- **Orta DB**: 10-100 MB
- **Büyük DB**: 100 MB - 1 GB+

## ⚠️ Hata Yönetimi

### Bağlantı Hatası

```
[ERROR] Uzak veritabanına bağlanılamadı!
```

**Çözüm:**

- İnternet bağlantınızı kontrol edin
- TiDB Cloud sunucusunun erişilebilir olduğundan emin olun
- Kullanıcı adı ve şifrenin doğru olduğunu kontrol edin

### MySQL Client Bulunamadı

```
[ERROR] mysqldump komutu bulunamadı!
```

**Çözüm:**

```bash
# Ubuntu/Debian
sudo apt install mysql-client

# macOS
brew install mysql-client
```

### Lokal MySQL Çalışmıyor

```
[ERROR] Lokal veritabanına bağlanılamadı!
```

**Çözüm:**

```bash
# MySQL'i başlat
sudo systemctl start mysql

# Durumu kontrol et
sudo systemctl status mysql
```

### Otomatik Rollback

Eğer import sırasında hata oluşursa, script otomatik olarak:

1. Import işlemini durdurur
2. Hata mesajını gösterir
3. Önceki lokal yedekten geri yükleme yapar
4. Sistemi eski durumuna getirir

## 🔄 Sonraki Adımlar

Migration tamamlandıktan sonra:

### 1. .env Dosyasını Güncelle

Artık lokal veritabanı kullanacağınız için, `.env` dosyasında şunları güncelleyin:

```env
# TiDB Cloud satırlarını yoruma alın
# DATABASE_HOST=gateway02.us-east-1.prod.aws.tidbcloud.com
# DATABASE_USER=3RD81TG4rcgjaLg.bf493ad42272
# DATABASE_PASSWORD=lril1MrVR9q32wH4Y2am
# DATABASE_PORT=4000

# Lokal MySQL kullanın
DATABASE_URL=mysql://root:Aa123456+@localhost:3306/nanoinf
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=Aa123456+
```

### 2. Uygulamayı Yeniden Başlat

```bash
# Development modunda
bun dev

# Production modunda
bun start
```

### 3. Verileri Test Et

- Kullanıcı girişi yapın
- Mevcut verilerin görüntülendiğini kontrol edin
- Yeni veri oluşturmayı test edin

### 4. Yedek Dosyalarını Yönetin

Her şey yolundaysa, eski yedekleri silebilirsiniz:

```bash
# Tüm yedekleri listele
ls -lh backups/

# Eski yedekleri sil (dikkatli olun!)
rm backups/remote_dump_*.sql
rm backups/local_backup_*.sql
```

> ⚠️ **Uyarı:** Verilerin doğru taşındığından emin olmadan yedekleri silmeyin!

## 🛡️ Güvenlik Notları

1. **Şifre Güvenliği**: Script içinde şifreler düz metin olarak saklanıyor. Güvenlik için:
   - Script dosyasının izinlerini kısıtlayın: `chmod 700 migrate-remote-to-local.sh`
   - Migration sonrası script'i silebilir veya şifreleri kaldırabilirsiniz

2. **Yedekleme**: Migration öncesi mutlaka yedek alın

3. **Test Ortamı**: Önce test ortamında deneyin

## 🆘 Sorun Giderme

### Dump Dosyası Çok Büyük

Eğer veritabanınız çok büyükse, disk alanı problemi yaşayabilirsiniz:

```bash
# Mevcut disk alanını kontrol et
df -h

# Backups dizinini temizle
rm -rf backups/old_*
```

### Import Çok Yavaş

Import işlemi veritabanı boyutuna bağlı olarak uzun sürebilir:

- 100 MB → ~1-2 dakika
- 1 GB → ~10-15 dakika
- 10 GB → ~60+ dakika

**İpucu:** Script'i `screen` veya `tmux` içinde çalıştırarak bağlantı kesilse bile devam etmesini sağlayabilirsiniz:

```bash
screen -S migration
./migrate-remote-to-local.sh
# Ctrl+A+D ile ayrıl
# screen -r migration ile geri dön
```

### Karakter Seti Sorunları

Türkçe karakterlerde sorun yaşıyorsanız:

```bash
# Veritabanı karakter setini kontrol et
mysql -u root -p -e "SHOW VARIABLES LIKE 'character%';"

# UTF-8 olarak ayarla
mysql -u root -p -e "ALTER DATABASE nanoinf CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

## 📞 Destek

Sorun yaşıyorsanız:

1. Log dosyasını kontrol edin: `cat backups/migration_*.log`
2. MySQL error log'unu kontrol edin: `sudo tail -f /var/log/mysql/error.log`
3. Script çıktısını kaydedin: `./migrate-remote-to-local.sh 2>&1 | tee migration.log`

## 📝 Lisans

Bu script NanoInfluencer projesi için özel olarak hazırlanmıştır.

---

**Oluşturulma Tarihi:** 23 Aralık 2024  
**Versiyon:** 1.0.0  
**Yazar:** GitHub Copilot (Thinking-beast mode)
