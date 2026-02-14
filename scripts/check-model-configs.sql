-- Mevcut Modellerin configJson'unu Kontrol ve Güncelleme
-- Tarih: 2026-01-17

-- Wan 2.6 modellerini kontrol et
SELECT modelKey, modelName, configJson 
FROM aiModelConfig 
WHERE modelKey LIKE 'wan/2-6%' 
ORDER BY modelKey;

-- Kling 2.6 modellerini kontrol et
SELECT modelKey, modelName, configJson 
FROM aiModelConfig 
WHERE modelKey LIKE 'kling/%' AND (modelKey LIKE '%2-6%' OR modelKey LIKE '%2.6%')
ORDER BY modelKey;

-- Veo modellerini kontrol et
SELECT modelKey, modelName, configJson 
FROM aiModelConfig 
WHERE modelKey LIKE 'veo%'
ORDER BY modelKey;
