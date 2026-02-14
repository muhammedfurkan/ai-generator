-- Shopier URL ekleyelim mevcut paketlere veya yeni paketler oluşturalım
-- 4000 kredi - https://www.shopier.com/ShowProductNew/products.php?id=42896987
-- 300 kredi - https://www.shopier.com/ShowProductNew/products.php?id=42896934
-- 750 kredi - https://www.shopier.com/ShowProductNew/products.php?id=42896957
-- 2200 kredi - https://www.shopier.com/ShowProductNew/products.php?id=42634110

-- Önce mevcut paketleri kontrol edelim
SELECT id, name, credits, price FROM creditPackages ORDER BY credits;
