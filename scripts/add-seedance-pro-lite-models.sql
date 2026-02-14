-- Add SeeDance 1.0 Lite and SeeDance 1.0 Pro models to database
-- These models support both text-to-video and image-to-video

-- 1. ADD SEEDANCE 1.0 LITE
INSERT INTO aiModelConfig (modelKey, modelName, modelType, provider, isActive, priority, configJson)
VALUES ('seedance-lite', 'SeeDance 1.0 Lite', 'video', 'ByteDance', 1, 5,
  JSON_OBJECT(
    'supportsTextToVideo', true,
    'supportsImageToVideo', true,
    'supportedDurations', JSON_ARRAY('3', '6'),
    'defaultDuration', '3',
    'supportedAspectRatios', JSON_ARRAY('16:9', '9:16', '1:1'),
    'defaultAspectRatio', '16:9',
    'hasAudioSupport', false
  )
) ON DUPLICATE KEY UPDATE 
  modelName = 'SeeDance 1.0 Lite',
  isActive = 1,
  configJson = VALUES(configJson);

-- 2. ADD SEEDANCE 1.0 PRO
INSERT INTO aiModelConfig (modelKey, modelName, modelType, provider, isActive, priority, configJson)
VALUES ('seedance-pro', 'SeeDance 1.0 Pro', 'video', 'ByteDance', 1, 6,
  JSON_OBJECT(
    'supportsTextToVideo', true,
    'supportsImageToVideo', true,
    'supportedDurations', JSON_ARRAY('3', '6'),
    'defaultDuration', '3',
    'supportedAspectRatios', JSON_ARRAY('16:9', '9:16', '1:1'),
    'defaultAspectRatio', '16:9',
    'hasAudioSupport', false
  )
) ON DUPLICATE KEY UPDATE 
  modelName = 'SeeDance 1.0 Pro',
  isActive = 1,
  configJson = VALUES(configJson);

-- Verify
SELECT modelKey, modelName, isActive, JSON_PRETTY(configJson) 
FROM aiModelConfig 
WHERE modelKey IN ('seedance-lite', 'seedance-pro', 'seedance-15-pro')
ORDER BY priority;
