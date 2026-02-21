# Clerk DNS Ayarları

## clerk.amonify.com için DNS Kayıtları Ekleyin:

1. DNS sağlayıcınızda (domain registrar) aşağıdaki CNAME kaydını ekleyin:
   - Host: clerk
   - Type: CNAME
   - Value: clerk.clerk.com (veya Clerk Dashboard'da gösterilen değer)

2. Ya da Clerk Dashboard'da custom domain ayarını kaldırın ve varsayılan Clerk domain'ini kullanın.

## Hızlı Test:

nslookup clerk.amonify.com

Eğer DNS kaydı yoksa, geçici olarak development key kullanın.
