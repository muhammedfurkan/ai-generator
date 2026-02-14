-- Sora 2 Model Feature Configuration
-- Adds special features support (Characters, Storyboard, Watermark Remover)

UPDATE aiModelConfig 
SET configJson = JSON_SET(
  configJson,
  '$.specialFeatures', JSON_ARRAY('characters', 'watermark-remover', 'storyboard')
)
WHERE modelKey = 'sora2';

-- Verify the update
SELECT modelKey, modelName, configJson 
FROM aiModelConfig 
WHERE modelKey = 'sora2';
