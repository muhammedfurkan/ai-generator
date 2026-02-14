-- Wan 2.6 duplicate models cleanup
-- This script removes the separate Wan 2.6 models from database
-- and keeps only the unified wan-26 model

-- 1. Hide/Archive duplicate Wan 2.6 models
UPDATE aiModelConfig 
SET isMaintenanceMode = 1
WHERE modelKey IN (
  'wan/2-6-image-to-video',
  'wan/2-6-text-to-video',
  'wan/2-6-video-to-video'
);

-- 2. Ensure main wan-26 model is active
UPDATE aiModelConfig 
SET isMaintenanceMode = 0,
    supportedDurations = '[\"5\",\"10\",\"15\"]',
    supportedResolutions = '[\"720p\",\"1080p\"]'
WHERE modelKey = 'wan-26';

-- 3. Alternatively, delete the duplicate models completely (uncomment if needed)
-- DELETE FROM aiModelConfig 
-- WHERE modelKey IN (
--   'wan/2-6-image-to-video',
--   'wan/2-6-text-to-video',
--   'wan/2-6-video-to-video'
-- );

-- 4. Similar cleanup for Sora 2 (if needed)
UPDATE aiModelConfig 
SET isMaintenanceMode = 1
WHERE modelKey IN (
  'sora2/sora-2-image-to-video',
  'sora2/sora-2-text-to-video',
  'sora2/sora-watermark-remover'
) AND modelKey != 'sora2';

-- 5. Hide duplicate Kling models (keep only main kling)
UPDATE aiModelConfig 
SET isMaintenanceMode = 1
WHERE modelKey IN (
  'kling/text-to-video',
  'kling/image-to-video'
) AND modelKey LIKE 'kling/%';

-- 6. Hide duplicate Grok models (keep only main grok)
UPDATE aiModelConfig 
SET isMaintenanceMode = 1
WHERE modelKey IN (
  'grok-imagine/text-to-video',
  'grok-imagine/image-to-video'
) AND modelKey LIKE 'grok-imagine/%';

-- Verification query
SELECT 
  modelKey, 
  modelName, 
  isMaintenanceMode,
  supportedDurations,
  supportedResolutions
FROM aiModelConfig 
WHERE modelType = 'video'
ORDER BY modelKey;
