# Authentication System Migration Guide

Bu proje, Manus OAuth sisteminden **Email/Password** ve **Google Login (Clerk)** sistemine geçiş yapmıştır.

## 🎯 Yapılan Değişiklikler

### 1. Database Schema Güncellemeleri
**Dosya:** `drizzle/schema.ts`

- `openId` alanı artık nullable (OAuth kullanıcıları için)
- `clerkId` alanı eklendi (Clerk Google OAuth için)
- `email` alanı unique yapıldı
- `passwordHash` alanı eklendi (email/password kullanıcıları için)

### 2. Backend Auth Sistemi

#### Yeni Dosyalar:
- `server/_core/passwordAuth.ts` - Email/password authentication helper'ları
- `server/_core/clerkAuth.ts` - Clerk entegrasyonu
- `server/_core/newAuth.ts` - Yeni auth route'ları
- `server/_core/auth.ts` - Unified authentication (yeni + eski sistem desteği)

#### Güncellenmiş Dosyalar:
- `server/_core/env.ts` - Clerk environment variables eklendi
- `server/_core/index.ts` - Yeni auth route'ları register edildi
- `server/_core/context.ts` - Yeni auth sistemi kullanıyor
- `server/db.ts` - Yeni auth metodları için database fonksiyonları

### 3. Frontend

#### Yeni Dosyalar:
- `client/src/pages/LoginPage.tsx` - Modern login/register sayfası

#### Güncellenmiş Dosyalar:
- `client/src/App.tsx` - Clerk Provider ve /login route'u eklendi
- `client/src/const.ts` - getLoginUrl() yeni login sayfasına yönlendiriyor

### 4. Environment Variables

`.env` dosyasına yeni değişkenler eklendi:
```bash
# Clerk Authentication Configuration
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

## 🚀 Kurulum Adımları

### 1. Clerk Hesabı Oluştur ve Yapılandır

1. [Clerk Dashboard](https://dashboard.clerk.com/) üzerinden yeni bir uygulama oluştur
2. Google OAuth provider'ı etkinleştir
3. API Keys'leri al:
   - Publishable Key -> `VITE_CLERK_PUBLISHABLE_KEY`
   - Secret Key -> `CLERK_SECRET_KEY`

### 2. Environment Variables Güncelle

`.env` dosyasını güncelle:
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 3. Database Migration Çalıştır

```bash
pnpm db:push
```

Bu komut:
- Yeni migration dosyası oluşturur (`drizzle/0025_*.sql`)
- Database schema'sını günceller
- Yeni alanları ekler

### 4. Bağımlılıkları Kontrol Et

```bash
pnpm install
```

Aşağıdaki paketler yüklü olmalı:
- `bcryptjs` - Password hashing
- `@types/bcryptjs` - TypeScript definitions
- `@clerk/backend` - Clerk backend SDK
- `@clerk/nextjs` - Clerk React SDK

## 🔐 Authentication Flow

### Email/Password Registration:
1. Kullanıcı `/login` sayfasında Register tab'ından email/password girer
2. Frontend `POST /api/auth/register` endpoint'ine istek atar
3. Backend:
   - Email/password validasyonu yapar
   - Password'ü hash'ler (bcrypt)
   - Yeni kullanıcı oluşturur (25 bedava kredi ile)
   - Session token oluşturur
   - Cookie set eder
4. Kullanıcı ana sayfaya yönlendirilir

### Email/Password Login:
1. Kullanıcı `/login` sayfasında Login tab'ından email/password girer
2. Frontend `POST /api/auth/login` endpoint'ine istek atar
3. Backend:
   - Email ile kullanıcı bulur
   - Password'ü verify eder
   - Session token oluşturur
   - Cookie set eder
4. Kullanıcı ana sayfaya yönlendirilir

### Google Login (Clerk):
1. Kullanıcı "Continue with Google" butonuna tıklar
2. Clerk popup açılır ve Google OAuth akışı başlar
3. Başarılı giriş sonrası Clerk session ID döner
4. Frontend `POST /api/auth/clerk-callback` endpoint'ine session ID gönderir
5. Backend:
   - Clerk session'ı verify eder
   - Kullanıcıyı database'de bulur veya oluşturur
   - Session token oluşturur
   - Cookie set eder
6. Kullanıcı ana sayfaya yönlendirilir

## 🔄 Backward Compatibility

Sistem, eski Manus OAuth ile giriş yapmış kullanıcıları desteklemeye devam ediyor:

- `server/_core/auth.ts` önce yeni auth sistemi ile token'ı verify eder
- Başarısız olursa eski Manus OAuth sistemini dener
- Bu sayede mevcut kullanıcıların session'ları geçerli kalır

## 📝 API Endpoints

### POST /api/auth/register
Email/password ile kayıt olma
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

### POST /api/auth/login
Email/password ile giriş
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### POST /api/auth/clerk-callback
Clerk OAuth callback
```json
{
  "sessionId": "sess_..."
}
```

### POST /api/auth/logout
Logout (cookie'yi temizler)

## 🧪 Test

### Manuel Test:
1. `/login` sayfasına git
2. Register tab'ından yeni kullanıcı oluştur
3. Logout yap
4. Login tab'ından giriş yap
5. Google ile giriş yap
6. Profil sayfasında bilgilerin doğru göründüğünü kontrol et

### Database Kontrolü:
```sql
-- Yeni kullanıcıları görüntüle
SELECT id, email, name, loginMethod, clerkId, passwordHash IS NOT NULL as hasPassword 
FROM users 
ORDER BY createdAt DESC 
LIMIT 10;
```

## 🐛 Bilinen Sorunlar ve Çözümler

### Problem: "CLERK_SECRET_KEY is not configured"
**Çözüm:** `.env` dosyasında `CLERK_SECRET_KEY` değişkenini ayarla

### Problem: Password validation hatası
**Çözüm:** Password en az 8 karakter, 1 büyük harf, 1 küçük harf, 1 rakam içermeli

### Problem: Email zaten kayıtlı
**Çözüm:** Farklı bir email kullan veya login sayfasından giriş yap

## 📚 Ek Notlar

- Tüm yeni kullanıcılar 25 bedava kredi ile başlar
- Password'ler bcrypt ile hash'lenir (10 salt rounds)
- Session token'lar JWT ile oluşturulur ve 1 yıl geçerlidir
- Clerk sessio
n'ları Clerk tarafından yönetilir
- Admin bildirim sistemi yeni kullanıcı kayıtlarında Telegram mesajı gönderir

## 🔮 Gelecek İyileştirmeler

- [ ] Email verification sistemi
- [ ] Password reset özelliği
- [ ] 2FA (Two-Factor Authentication)
- [ ] Social login (Facebook, Twitter, vb.)
- [ ] Session management dashboard
- [ ] Login history ve güvenlik logları
